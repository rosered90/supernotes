# -*- coding: utf-8 -*-
# author: DJ
# date: 2018/01/03
# desc: this is a single model operate class ,include search,modify,add,delete action.
from django.shortcuts import render
from utils import try_except_class

# Create your views here.
class SingleObjectView(object):
    model = None
    create_template = None
    update_template = None

    def create(self,request,*args,**kwargs):
        method = request.method.lower()
        if method == 'get':
            self.create_get(request,*args,**kwargs)
        elif method == 'post':
            self.create_post(request,*args,**kwargs)
        else:
            raise Exception(u'不支持的请求方式')

    def update(self,request,*args,**kwargs):
        method = request.method.lower()
        if method == 'get':
            self.update_get(request,*args,**kwargs)
        elif method == 'post':
            self.update_post(request,*args,**kwargs)
        else:
            raise Exception(u'不支持的请求方式')

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
