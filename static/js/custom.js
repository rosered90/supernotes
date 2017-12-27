/*
自定义js，用于加载一些界面上自定义的js事件及其驱动。
 */

var nav_app = new Vue({
    el: '#nav_app',
    mixins: [dialogMixin],
    methods: {
        login: function (e) {
            var $modal = this.show_dialog('登陆', '/login', true, function () {
                var login_app = new Vue({
                    el: '#login_module',
                    data: {
                        username: '',
                        password: ''
                    },
                    methods: {
                        login: function (e) {
                            var data = {
                                'csrfmiddlewaretoken': $('input[name="csrfmiddlewaretoken"]').val(),
                                'username': this.username,
                                'password': this.password
                            };
                            // todo 加上必填等表单校验，校验通过则发起请求
                            $.post('/login/', data, function (res) {
                                var result = JSON.parse(res);
                                if (!result.is_success) {
                                    alert(result.error_msg);
                                    console.log(result.traceback);
                                }
                            })
                        }
                    }
                })
            })
        }

    }
});