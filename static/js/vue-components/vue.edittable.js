/*
 @author	:	ly
 @date 	:	2016-08-20
 @desc 	:	vue table js 生成具有增，删，改的表单，输出数据(标明数据action,行号row_index,及数据库已有数据的id)
 @example:
 <div class="row" id="myapp">
 <vue-edittable
 :options="options"
 csrftoken="{{ csrf_token }}"
 v-ref:edit_vue
 v-on:on_custom="on_custom"
 >
 </vue-edittable>
 </div>
 JS:
 var row_data =[
 {'id':1,'name':'li01','passwd':'123456','auth_type':0,'re_passwd':'123456'},
 {'id':2,'name':'li02','passwd':'123456','auth_type':'1','re_passwd':'123456'},
 {'id':3,'name':'li03','passwd':'123456','auth_type':0,'re_passwd':'123456'},
 {'id':4,'name':'li04','passwd':'123456','auth_type':1,'re_passwd':'123456'},
 ]
 //row_fields 的 type [CharField,PasswordField,TextField,BooleanField,DateField]等 具体参见edit_table_template.html
 var row_fields = [
 {'name': 'name', 'title': '登录账户','type':'CharField',},
 {'name': 'auth_type', 'title': '认证方式','type':'CharField',
 'choices':'[{"id":"0","text":"本地认证"},{"id":"1","text":"LDAP认证"}]'
 },
 {'name': 'passwd', 'title': '密码','type':'TextField',},
 {'name': 're_passwd', 'title':'确认密码','type':'CharField',}
 ];
 var comm_buttons = [
 {'title':'创建','class':'','icon':'','action':'create'},
 {'title':'自定义','class':'','icon':'','action':'custom'},
 ];
 //自定义按钮的事件用 on_ + action 来监听
 var more_buttons = [
 {'title': '删除', 'class': '', 'icon': '','action':'batch_delete'},
 ];

 var user_vue_app = new Vue({
 el: '#myapp',
 mixins: [dialogMixin],
 data: {
 dt_options: {
 'list_fields':row_fields,
 'row_value':row_data,
 'comm_buttons':comm_buttons,
 'more_buttons':more_buttons
 }
 },
 methods: {
 //内置提交方法搜集表单编辑后的数据
 submit:function(){
 var data=this.$refs.edit_vue.on_submit()
 console.log(data)
 },
 on_custom:function(){
 alert('ff')
 }

 }
 });
 */

/*
 vue.js and jquery.usertable.js
 */

var vueEdittable = Vue.extend({
    template: '<div></div>',
    props: ['options', 'csrftoken'],
    mixins: [dialogMixin],
    $dt: null,
    fields: [],
    ready: function () {
        var self = this
        this.$dt = $(this.$el);
        this.row_vue_app = {};
        this.template_url = '/edittable/template/';
        this.list_fields = this.options.list_fields;
        this.row_value = this.options.row_value;
        this.comm_buttons = [];
        if (this.options.comm_buttons) this.comm_buttons = this.options.comm_buttons;
        this.more_buttons = [];
        if (this.options.more_buttons) this.more_buttons = this.options.more_buttons;
        this._get_template(function (res) {
            $(self.$el).html(res);
            self._init_toolbar(self.list_fields);
            if (self.row_value) {
                self._init_context(self.row_value, self.list_fields);
            }

        });
    },
    methods: {
        refresh: function (row_value) {
            // 目前仅支持and
            var self = this;
            self.$dt.find('tbody.edit_tbody').children().remove()
            self._init_context(row_value, self.list_fields)
        },
        _get_template: function (callback) {
            var self = this;
            $.get(this.template_url, {
                'list_fields': JSON.stringify(this.list_fields),
                'comm_buttons': JSON.stringify(this.comm_buttons),
                'more_buttons': JSON.stringify(this.more_buttons)
            }, function (res) {

                if (callback) callback(res);
            });
        },
        _init_context: function (row_value, context) {
            var self = this
            // console.log(self.$dt.html())
            var template = $('.row-template', self.$dt).html();
            for (var t = 0; t < row_value.length; t++) {
                var item_id = 'row' + row_value[t].id;
                self.$dt.find('tbody.edit_tbody').append('<tr id="' + item_id + '" class="row_vue">' + template + '</tr>');
                var row_data = {};
                row_data['index'] = row_value[t].id;
                for (var i = 0; i < context.length; i++) {
                    var item_name = context[i].name;
                    row_data[item_name] = row_value[t][item_name]
                }
                self._init_row_vue(item_id, row_data);
            }
        },
        _init_toolbar: function (context) {
            var n_id = 1;
            var self = this;
            // 通用按钮事件绑定
            this.$dt.find("a.btn-comm").click(function () {
                var action_name = $(this).attr("action");
                var event_name = 'on_' + action_name;
                var event_callback = self.$emit('on_pre_' + action_name);
                if (!event_callback)return;
                if (action_name == 'create') {
                    self.on_create(n_id, context);
                    n_id++;
                }
                var datatable = self;
                self.$emit(event_name, datatable);
            });

            // 绑定更多中按钮的点击事件
            this.$dt.find("a.btn-more").click(function () {
                var action_name = $(this).attr("action");
                var event_name = 'on_' + action_name;
                var event_callback = self.$emit('on_pre_' + action_name);
                if (!event_callback)return;
                if (action_name == 'batch_delete') self.on_batch_delete();
                var datatable = self;
                self.$emit(event_name, datatable);
            });

            // 绑定批量选择checkbox事件
            this.$dt.find("input.check_all").click(function () {
                $("input[name='check_item']").each(function () {
                    if ($('#CheckAll').prop('checked') == true) {
                        $(this).attr("checked", true);
                    } else {
                        $(this).attr("checked", false);
                    }
                });
            })
        },
        _init_row_vue: function (id, row_data) {
            var self = this;
            var item_id = '#' + id;
            self.row_vue_app[id] = new Vue({
                el: item_id,
                data: row_data,
            });
        },
        on_submit: function () {
            var data = [];
            var self = this;
            var row_index = 1;
            $("tr.row_vue").each(function () {
                var item_id = $(this).children("td:eq(0)").children("input").attr('id');
                var tr_id = $(this).attr('id');
                var result = self.row_vue_app[tr_id]._data;
                result['id'] = item_id;

                if (tr_id.indexOf('new') < 0) {
                    if ($(this).attr('act') == 'delete') {
                        result['action'] = 'delete';
                        result['row_index'] = '';
                    } else {
                        result['action'] = 'update';
                        result['row_index'] = row_index;
                        row_index++;
                    }
                } else {
                    result['action'] = 'create';
                    result['row_index'] = row_index;
                    row_index++;
                }
                data.push(result);
            })
            return data
        },
        on_create: function (n_id, context) {
            var self = this;
            var template = $('.row-template', self.$dt).html();
            var item_id = 'new' + n_id;
            var row_data = {};
            row_data['index'] = n_id;
            for (var i = 0; i < context.length; i++) {
                var item_name = context[i].name;
                row_data[item_name] = '';
            }
            self.$dt.find('tbody.edit_tbody').append('<tr id=' + item_id + ' class="row_vue">' + template + '</tr>');
            self._init_row_vue(item_id, row_data);
            n_id++;
        },
        on_batch_delete: function () {
            var i = 0;
            $('tbody.edit_tbody').find("input[name='check_item']").each(function () {
                if ($(this).prop("checked") == true) {
                    i++;
                    var $item = $(this).parent().parent()
                    if ($item.attr('id').indexOf('new') < 0) {
                        $item.hide();
                        $item.attr('act', 'delete');
                    } else {
                        $item.remove();
                    }
                }
            })
            if (i == 0) {
                alert('请您选择欲删除项！')
            }
        }
    }
});


// 注册所有的组件
Vue.component('vueEdittable', vueEdittable)

