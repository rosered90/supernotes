# -*- coding: utf-8 -*-
# author: DJ
# date: 2018/01/03
# desc: this is a single model operate class ,include search,modify,add,delete action.
from django.shortcuts import render
from django.views.generic.edit import ModelFormMixin
from django.http import HttpResponse
from utils import try_except_class
import json


# Create your views here.
class ModelForm(ModelFormMixin):
    def __init__(self, request, args, kwargs, model, fields=[]):
        self.request = request
        self.args = args
        self.kwargs = kwargs
        self.model = model
        self.fields = fields


class SingleObjectView(object):
    '''
    该类为单表的操作视图，主要包括增、删、改、查、批量删除基本功能；
    同时也提供select2和datatable的后台读取和搜索视图
    后期有可能增加批量导入、批量导出功能

    各参数含义：
        @model: Menu, 数据表的类名
        @dt_template: 'menu_template.html', 响应跳转的页面
        @create_template: 'single_object_form.html', 创建的模板
        @update_template: 'single_object_form.html',  更新的模板
        @DT_VIEW: 'READ/WRITE',视图权限

    使用示例：
    from base_views.base import SingleObjectView
    from base.models.menu import Menu
    class MenuView(SingleObjectView):
        model = Menu
        dt_template = 'menu_template.html'
        DT_VIEW = 'WRITE'

    url定义应为成组出现，也可以根据需求注册url,不需要的则不注册
    import base.views.menu_views as menu_view
    menu = menu_view.MenuView()
    urlpatterns = [
        url(r'^menu/$', menu.dt_list),
        url(r'^menu/search/$', menu.search),
        url(r'^menu/s2read/$', menu.s2read),
        url(r'^menu/s2search/$', menu.s2search),
        url(r'^menu/create/$', menu.create),
        url(r'^menu/update/(?P<pk>\w+)/$', menu.update),
        url(r'^menu/delete/(?P<pk>\w+)/$', menu.delete),
        url(r'^menu/batch_delete/$', menu.batch_delete),
    ]

    '''
    model = None
    dt_template = None
    create_template = None
    update_template = None
    DT_VIEW = "READ"

    def create(self, request, *args, **kwargs):
        '''
        创建请求的响应，将请求分为get和post两种方式处理，其他方式不处理，将给请求端报错
        当HTTP请求为get时将返回HTML代码段
        当HTTP请求为post时将数据保存到数据库并返回新建数据的ID
        '''
        method = request.method.lower()
        if method == 'get':
            return self.create_get(request, *args, **kwargs)
        elif method == 'post':
            return self.create_post(request, *args, **kwargs)
        else:
            return self.unsupported_method(request, *args, **kwargs)

    def create_get(self, request, *args, **kwargs):
        return render(request, self.create_template)

    def create_post(self, request, *args, **kwargs):
        return HttpResponse

    def update(self, request, *args, **kwargs):
        method = request.method.lower()
        if method == 'get':
            return self.update_get(request, *args, **kwargs)
        elif method == 'post':
            return self.update_post(request, *args, **kwargs)
        else:
            return self.unsupported_method(request, *args, **kwargs)

    def update_get(self, request, *args, **kwargs):
        return render(request, self.update_template)

    @try_except_class
    def update_post(self, request, *args, **kwargs):
        result = {}
        kwargs['action'] = 'update'
        obj = self._form_submit(request, *args, **kwargs)
        if obj and obj.id:
            result['id'] = obj.id
        return result

    @try_except_class
    def delete(self, request, *args, **kwargs):
        pk = kwargs.get('pk', None)
        if pk:
            pk = int(pk)
        if pk is not None:
            obj = self.model.objects.filter(pk=pk)
            if obj:
                obj.delete()
            else:
                raise Exception(u'没有找到id=%s的数据.' % pk)
        else:
            raise Exception(u'没有在HTTP请求中找到主键(pk).')
        return {'is_success': True}

    def save_callback(self, request, *args, **kwargs):
        # this method will be call when form is submitted and data saved to database.
        # the new object or update object will append to kwargs
        pass

    def _get_form(self, request, *args, **kwargs):
        field_defs, field_names = self._analy_fields(request, *args, **kwargs)
        form_wrapper = ModelForm(request, args, kwargs, self.model, field_names)
        form_wrapper.object = None
        if kwargs.get('action') == 'update':
            form_wrapper.object = form_wrapper.get_object()
        form = form_wrapper.get_form()
        return form

    def _form_submit(self, request, *args, **kwargs):
        obj = None
        form = self._get_form(request, *args, **kwargs)
        if form.is_valid():
            obj = form.save()
            if obj and obj.id:
                kwargs['object'] = obj
                self.save_callback(request, *args, **kwargs)
            else:
                raise Exception(u'后端表单验证通过,但后台写入数据失败.')
        else:
            # 分析后台出错信息
            error_msgs = []
            for field_name in form.errors:
                field_error_list = form.errors[field_name]
                for error_msg in field_error_list:
                    field_name = self._convert_utf8(field_name)
                    error_msg = self._convert_utf8(error_msg)
                    e_msg = u'字段%s写入失败,原因:%s' % (field_name, error_msg)
                    error_msgs.append(e_msg)
            if error_msgs:
                raise Exception(u'\r\n'.join(error_msgs))

        return obj

    def _get_support_validators(self):
        return ['required', 'maxlength', 'minlength', 'unique', 'float', 'int', 'email', 'ip', 'url', 'word']

    def _analy_fields(self, request, *args, **kwargs):
        fields_str = request.GET.get('fields')
        if not fields_str and request.POST.get('fields'):
            fields_str = request.POST.get('fields')
        fields = []
        if fields_str:
            fields = json.loads(fields_str)

        field_defs, field_names = [], []
        for f in fields:
            field_name = f
            field_def = {}
            # get name
            if isinstance(f, str) or isinstance(f, unicode):
                field_name = f
                f = {'name': field_name}
                field_def['name'] = field_name
            elif isinstance(f, dict):
                field_name = f['name']
                field_def = f

            # field may be not in this model
            # but this condition is support.
            field_meta = None
            try:
                field_meta = self.model._meta.get_field(field_name)
            except Exception, e:
                pass
            # get title
            field_def['title'] = f.get('title')
            if not f.get('title') and field_meta:
                field_def['title'] = self._convert_utf8(field_meta.verbose_name)
            # get type
            field_def['type'] = f.get('type')
            if not f.get('type') and field_meta:
                field_def['type'] = field_meta.get_internal_type()
            # get choice
            choices = f.get('choices')
            if not choices and field_meta:
                choices = field_meta.choices
            if choices:
                if isinstance(choices, str) or isinstance(choices, unicode):
                    choices = json.loads(choices)
                s2_data = []
                for item in choices:
                    s2_data.append({'id': item[0], 'text': item[1]})
                field_def['choices'] = json.dumps(s2_data)
            # get default_value
            field_def['default'] = f.get('default')
            if not f.get('default') and field_meta and field_meta.default != models.fields.NOT_PROVIDED:
                field_def['default'] = field_meta.default
            # get readonly
            field_def['readonly'] = f.get('readonly')

            # 引用型字段特殊属性
            if field_def['type'] == 'ForeignKey':
                # app label
                field_def['app_label'] = f.get('app_label')
                if not f.get('app_label') and field_meta:
                    field_def['app_label'] = field_meta.related_model._meta.app_label
                # model name
                field_def['model_name'] = f.get('model_name')
                if not f.get('model_name') and field_meta:
                    field_def['model_name'] = field_meta.related_model._meta.model_name

            # 验证信息
            validators = f.get('validators')
            if not validators and field_meta:
                validators = []
                if not field_meta.blank:
                    validators.append(u"required:{ rule:true, message:'%s必须填写.' }" % field_def['title'])
                if hasattr(field_meta, 'max_length') and field_meta.max_length:
                    validators.append(u"maxlength:{ rule:%s, message:'%s长度必须小于%s.' }" % (
                        field_meta.max_length, field_def['title'], field_meta.max_length))
                if hasattr(field_meta, 'min_length') and field_meta.min_length:
                    validators.append(u"minlength:{ rule:%s, message:'%s长度必须大于%s.' }" % (
                        field_meta.min_length, field_def['title'], field_meta.min_length))
                if hasattr(field_meta, 'unique') and field_meta.unique:
                    validators.append(u"unique:{ rule:true, message:'%s出现重复.' }" % field_def['title'])
                if field_def['type'] == 'FloatField' or field_def['type'] == 'DecimalField':
                    validators.append(u"float:{ rule:true, message:'%s必须是浮点型.' }" % field_def['title'])
                if field_def['type'] == 'IntegerField':
                    validators.append(u"int:{ rule:true, message:'%s必须是整型.' }" % field_def['title'])
                if field_def['type'] == 'EmailField':
                    validators.append(u"email:{ rule:true, message:'%s必须是邮箱地址.' }" % field_def['title'])
                if field_def['type'] == 'IPAddressField' or field_def['type'] == 'GenericIPAddressField':
                    validators.append(u"ip:{ rule:true, message:'%s必须是IP地址.' }" % field_def['title'])
                if field_def['type'] == 'URLField':
                    validators.append(u"url:{ rule:true, message:'%s必须是URL.' }" % field_def['title'])
                if validators:
                    field_def['validators'] = '{ ' + ','.join(validators) + ' }'
            else:
                field_def['validators'] = validators

            field_defs.append(field_def)

            # editable设置为False的字段将不被保存到数据库
            if not (field_def.get('editable') and field_def.get('editable') == False):
                field_names.append(field_name)

        return field_defs, field_names

    def unique(self, request, *args, **kwargs):

        pass

    def unsupported_method(self,request, *args, **kwargs):
        '''
        用于处理不支持的请求，返回报错信息
        request,*args,**kwargs后期有可能有用，也可能没用
        '''
        result = {
            'is_success': False,
            'error_msg': u'不支持的请求方式!'
        }
        return HttpResponse(json.dumps(result))

    def _convert_utf8(self, txt):
        '''
        强制转换成utf-8编码
        '''
        if txt and isinstance(txt, str):
            return txt.decode('utf-8')
        else:
            return txt
