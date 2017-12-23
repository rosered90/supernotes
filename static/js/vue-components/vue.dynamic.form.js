/*
 @author	:	dj
 @date 	:	2017-08-10
 @desc 	:	vue dynamic form js
 @example:
 <vue-dynamicform cti='device' ci_id='5' group_mode='no' >
 </vue-dynamicform>

 cti :为 cti 的id 或者别名,指定之后将该cti以及父节点的属性加载到页面上.
 ci_id :如果给定ci_id，那么就认为是更新，表单中有数据，否则认为是创建，表单中没有数据.
 */


var vueDynamicForm = Vue.extend({
    template: '<div></div>',
    props: ['cti', 'ci_id', 'group_mode'],
    ready: function () {
        var self = this;
        var data = {};
        if (this.cti) {
            data.cti = this.cti;
        }
        if (this.ci_id) {
            data.ci_id = this.ci_id;
        }
        if (!this.group_mode) {
            this.group_mode = 'tab';
        }
        data.group_mode = this.group_mode;
        $.get('/cmdb/ci/dt/get_ciattr/', data, function (result) {
            $(self.$el).html(result);
            self._new_it();
        })
    },
    methods: {
        /*
         {'tattr_alias':'','value':'','disp_value':''}
         */
        _new_it: function () {
            var ciattr_data_str = $('#get_ciattr').attr('ciattr_data');
            var ciattr_data = null;
            if (ciattr_data_str) {
                this.ciattr_data = JSON.parse(ciattr_data_str);
                ciattr_data = this.ciattr_data;
            }
            var ciattr_str = $('#get_ciattr').attr('ciattr');
            if (ciattr_str) this.ciattr = JSON.parse(ciattr_str);
            this.attr_app = new Vue({
                el: '#get_ciattr',
                data: ciattr_data,
                ready: function () {
                    // TODO:优化select2异步验证问题
                    var self = this;
                    setTimeout(function () {
                        self.$resetValidation();
                    }, 1000);
                }
            });
            this.$validations = this.attr_app.$validations;
        },
        /*
         获取动态表单的值，返回数据格式如下：
         [
         {'tattr_alias':'test','type':'CharField','value':'1','disp_value':'1','tattr_id':1}
         ...
         ]
         */
        get_values: function () {
            var values = [];
            for (var i in this.ciattr) {
                var alias = this.ciattr[i].tattr_alias;
                var value = this.ciattr_data[alias];
                if (value == undefined) value = null;
                var type = this.ciattr[i].type;
                var disp_value = value;
                if (type.indexOf('ForeignKey') != -1) {
                    disp_value = $('#' + alias).find('option[value="' + value + '"]').html();
                } else if (type == 'PasswordField') {
                    disp_value = null;
                } else {
                    disp_value = value;
                }
                this.ciattr[i].value = value;
                this.ciattr[i].disp_value = disp_value;
                values.push(this.ciattr[i]);
            }
            return values;
        },
        get_fields_data: function (fields) {
            var fields_data = {};
            for (var i in fields) {
                var field_name = fields[i];
                fields_data[field_name] = this.ciattr_data[field_name];
            }
            return fields_data;
        }
    }
});


// 注册所有的组件
Vue.component('vueDynamicform', vueDynamicForm);

