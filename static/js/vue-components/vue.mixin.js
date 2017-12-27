/*
 @author :   wp
 @date   :   2016-08-31
 @desc   :   vue mixin
 @example:
 */


/*
 show modal dialog mixin
 you should call function show_dialog() launch a modal dialog
 @example:
 @exmpale.defination
 var vueDataTable = Vue.extend({
 template:'<table datatable class="table table-striped table-success"></table>',
 props:['view','options'],
 mixins: [dialogMixin],
 });
 @example.call the function of minxi
 _on_create:function(url){
 var self = this;
 var $modal = this.show_dialog('创建',url,function(e){
 self.set_form_action(url,$modal);
 });
 }
 */
var dialogMixin = {
    methods: {
        /*
         * 设置对话框标题
         */
        _set_title: function (title, $modal) {
            if (title) {
                $('.modal-title', $modal).html(title);
            }
        },
        /*
         * 设置对话内容
         */
        _set_content: function (content_or_ajax, $modal, manual, call_back) {
            // 解析content or ajax
            var ajax_url = '', ajax_params = {}, static_content = '';
            if (typeof content_or_ajax == "string") {
                if (/^(\/\w{0,40})+(\/?)$/.test(content_or_ajax)) {
                    // /cmdb/cti/create/
                    // only ajax url
                    ajax_url = content_or_ajax;
                } else {
                    static_content = content_or_ajax;
                }
            } else if (typeof content_or_ajax == "object") {
                if (content_or_ajax.url)
                    ajax_url = content_or_ajax.url;
                if (content_or_ajax.params)
                    ajax_params = content_or_ajax.params;
            }

            if (ajax_url) {
                $.get(ajax_url, ajax_params, function (response) {
                    //响应成功
                    if (response) {
                        if (!manual) $('.modal-body', $modal).html(response);
                        else $('.modal-dialog', $modal).html(response);
                        if (call_back) call_back();
                    }
                    //处理响应失败
                    // $('.modal-body',self.$modal).html('请求地址'+self.ajax.url+'失败');
                });
            } else if (static_content) {
                if (!manual) $('.modal-body', $modal).html(static_content);
                else $('.modal-dialog', $modal).html(static_content);
                if (call_back) call_back();
            }
        },
        _create_modal: function (manual) {
            var htmls = [], self = this;
            var dialog_id = 'modal_' + (new Date()).getTime();
            // data-backdrop="static" 
            // tabindex="-1" 此配置将导致select2下拉无法搜索,输入框被禁用
            // style="overflow:hidden;"
            htmls.push('<div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" id="' + dialog_id + '" class="modal fade" data-backdrop="static" style="display: none;">');
            htmls.push('  <div class="modal-dialog">');
            if (!manual) {
                htmls.push('    <div class="modal-content">');
                htmls.push('      <div class="modal-header">');
                htmls.push('        <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>');
                htmls.push('        <h4 id="myModalLabel" class="modal-title">Modal title</h4>');
                htmls.push('      </div>');
                htmls.push('      <div class="modal-body">');
                htmls.push('      </div>');
                htmls.push('    </div>');
            }
            htmls.push('  </div>');
            htmls.push('</div>');

            this.$modal_block.append(htmls.join(""));
            var $modal = $('#' + dialog_id, this.$modal_block);

            return $modal;
        },
        show_dialog: function (title, content_or_ajax, manual, show_callback, hidden_callback) {
            this.$modal_block = $('#modal_block');
            $.fn.modal.Constructor.prototype.enforceFocus = function () {
            };

            var $modal = this._create_modal(manual);
            if (!manual) this._set_title(title, $modal);
            this._set_content(content_or_ajax, $modal, manual, function () {
                if (show_callback) show_callback($modal);
            });
            $modal.modal('show');
            $modal.on('shown.bs.modal', function (e) {
                // if (shown_callback) shown_callback(e);
                // if (call_back) call_back(e);
            });
            $modal.draggable({
                handle: ".modal-header"
            });
            $modal.on('hidden.bs.modal', function (e) {
                if (hidden_callback) hidden_callback(e);
                $modal.remove();
            });

            return $modal;
        },
        set_form_action: function (url, $modal) {
            $('form', $modal).attr('action', url);
        }
    }
};

var DiffBackupMixin = {
    mixins: [dialogMixin],
    methods: {
        _set_d_backup_content: function ($modal, call_back) {
            var htmls = [];
            htmls.push('<div id="code_mirror_form">');
            htmls.push('    <div class="form-group">');
            htmls.push('         <table>');
            htmls.push('             <tr>');
            htmls.push('                 <td>');
            htmls.push('                     <div class="toggle toggle-success"></div>');
            htmls.push('                 </td>');
            htmls.push('                 <td>&nbsp;&nbsp;只显示差异</td>');
            htmls.push('             </tr>');
            htmls.push('         </table>');
            htmls.push('    </div>');
            htmls.push('    <hr style="margin-bottom: auto">');
            htmls.push('    <div class="panel panel-default panel-alt">');
            htmls.push('        <div class="panel-body nopadding">');
            htmls.push('            <textarea id="code_compare" name="code_compare"></textarea>');
            htmls.push('        </div>');
            htmls.push('    </div>');
            htmls.push('</div>');
            var static_content = htmls.join("");
            $('.modal-body', $modal).html(static_content);
            if (call_back) call_back();
        },
        show_diff_backup_dialog: function (title, url_and_ids, shown_callback, hidden_callback) {
            /*这个函数可以对比配置文件，其中在url_and_id中配置对比配置文件的url，和你需要传入到后台的id
             url：get请求，传入后台两个参数，
             1.ids,你配置的所需要传入后台的数据，可以是id当然也可以是其他的内容。
             2.action，取值（"all","diff"）前台加上的，含义是显示全部还是显示部分，默认显示部分
             url_and_ids：{
             "url": "/backup/query/compare/get_data/",      你的url
             "ids": "3_4"    你所需要传到后台的参数
             }
             */
            var self = this;
            self.url = url_and_ids.url ? url_and_ids.url : alert("请配置正确url");
            self.ids = url_and_ids.ids ? url_and_ids.ids : null;
            this.$modal_block = $('#modal_block');
            $.fn.modal.Constructor.prototype.enforceFocus = function () {
            };
            var $modal = this._create_modal();
            this._set_title(title, $modal);
            this._set_d_backup_content($modal, function () {
                if (shown_callback) shown_callback();
            });
            $modal.modal('show');
            $modal.draggable({
                handle: ".modal-header"
            });
            this._init_code_mirror();
            $modal.on('hidden.bs.modal', function (e) {
                if (hidden_callback) hidden_callback(e);
                $modal.remove();
            });
            return $modal;
        },
        _init_code_mirror: function () {
            var self = this;
            self.codeMirror = CodeMirror.fromTextArea(document.getElementById("code_compare"), {
                mode: {name: "diff", alignCDATA: false},
                lineNumbers: true,
                readOnly: true,
            });
            self.codeMirror.setSize("100%", "600px");
            setTimeout(function () {
                $('.toggle', self.$modal_block).toggles({on: true});
                self.action = "diff";
                self._show_text()
            }, 100);
            $('.toggle').on('toggle', function (e, active) {
                if (active) {
                    self.action = "diff";
                    self._show_text()
                } else {
                    self.action = "all";
                    self._show_text()
                }
            });
        },
        _show_text: function () {
            var self = this;
            var data = {
                "action": self.action,
                "ids": self.ids,
            };
            $.get(self.url, data, function (result) {
                result = JSON.parse(result);
                if (result.error_msg) {
                    alert(result.error_msg)
                } else {
                    var context = result.context;
                    var context_str = context.join("\n");
                    self.codeMirror.setValue(context_str);
                    self.codeMirror.refresh();
                }
            })
        },
    }
};

var CIdialogMixin = {
    mixins: [dialogMixin],
    methods: {
        _set_ci_content: function (dt_options, $modal, call_back) {
            var self = this;
            $.get('/model/ci_modal/', {}, function (res) {
                $('.modal-body', $modal).html(res ? res : '请求失败!');
                self._init_ci_model(dt_options, $modal);
                if (call_back) call_back();
            })
        },

        _init_ci_model: function (dt_options, $modal) {
            var self = this;
            if (!dt_options) throw Error('请指定至少一个条件！');
            this.ci_app = new Vue({
                el: '#ci_modal',
                data: {ci_options: dt_options},
                methods: {
                    submit: function () {
                        this.selected_ids = this.$refs.ci_table.get_selected_ids();
                        $modal.find('.close').click();
                    }
                }
            })
        },

        _create_modal_ci: function () {
            var htmls = [], self = this;
            var dialog_id = 'modal_' + (new Date()).getTime();
            // data-backdrop="static" 
            // tabindex="-1" 此配置将导致select2下拉无法搜索,输入框被禁用
            // style="overflow:hidden;"
            htmls.push('<div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" id="' + dialog_id + '" class="modal fade" data-backdrop="static" style="display: none;">');
            htmls.push('  <div class="modal-dialog" style="min-width:1000px">');
            htmls.push('    <div class="modal-content">');
            htmls.push('      <div class="modal-header">');
            htmls.push('        <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>');
            htmls.push('        <h4 id="myModalLabel" class="modal-title">Modal title</h4>');
            htmls.push('      </div>');
            htmls.push('      <div class="modal-body">');
            htmls.push('      </div>');
            htmls.push('    </div>');
            htmls.push('  </div>');
            htmls.push('</div>');

            this.$modal_block.append(htmls.join(""));
            var $modal = $('#' + dialog_id, this.$modal_block);

            return $modal;
        },

        show_ci_dialog: function (title, dt_options, shown_callback, hidden_callback) {
            this.$modal_block = $('#modal_block');
            $.fn.modal.Constructor.prototype.enforceFocus = function () {
            };

            var $modal = this._create_modal_ci(), self = this;
            this._set_title(title, $modal);
            this._set_ci_content(dt_options, $modal, function () {
                if (shown_callback) shown_callback();
            });
            $modal.modal('show');
            $modal.draggable({
                handle: ".modal-header"
            });
            $modal.on('hidden.bs.modal', function (e) {
                if (hidden_callback) hidden_callback(self.ci_app.selected_ids, e);
                delete self.ci_app;
                $modal.remove();
            });
            return $modal;
        }
    }
};

var fileUploadMixin = {
    mixins: [dialogMixin],
    methods: {
        _set_upload_content: function (upload_options, $modal, call_back) {
            var self = this;
            var file_input_id = 'fileupload' + (new Date()).getTime();
            var template_url = upload_options.template_url ? upload_options.template_url : '';
            var template_title = upload_options.template_title ? upload_options.template_title : '下载模板';
            var data = {
                file_input_id: file_input_id,
                template_url: template_url,
                template_title: template_title
            };
            $.get('/feature/attach/mixin_form/', data, function (res) {
                $('.modal-body', $modal).html(res);
                if (call_back) call_back();
            });
        },
        _init_fileupload: function (upload_options, $modal, call_back) {
            var f_input = $("[type='file']", $modal);
            var limit = upload_options.limit ? upload_options.limit : 1;
            var folder_alias = upload_options.folder_alias ? upload_options.folder_alias : '';
            f_input.fileupload({
                url: '/feature/attach/upload/',
                singleFileUploads: false,
                formData: function () {
                    return ([{name: 'w_replace', value: $("#replace", $modal)[0].checked}, {
                        name: 'csrfmiddlewaretoken',
                        value: $("input[name='csrfmiddlewaretoken']").val()
                    }])
                },
                add: function (e, data) {
                    if (data.files.length > parseInt(limit)) {
                        alert('上传文件数量超过要求的数量')
                    } else {
                        $('#list_files', $modal).html('');
                        var f_name_list = [];
                        for (var i = 0; i < data.files.length; i++) {
                            var list_filename = '<p>' + data.files[i].name + '</p>';
                            $('#list_files', $modal).prepend(list_filename);
                            f_name_list.push(data.files[i].name)
                        }
                        data['csrfmiddlewaretoken'] = $("input[name='csrfmiddlewaretoken']").val();
                        var get_data = {
                            'f_name_list': JSON.stringify(f_name_list),
                            'default_folder': folder_alias
                        };
                        $('.btn-upload-file-submit', $modal).unbind().bind('click', function () {
                            $('.btn-upload-file-submit', $modal).attr("disabled", "disabled");
                            get_data["w_replace"] = $("#replace", $modal)[0].checked;
                            $.get('/feature/attach/upload/', get_data, function (result) {
                                var result = JSON.parse(result);
                                if (!result.is_success) {
                                    $('.btn-upload-file-submit', $modal).removeAttr("disabled");
                                    alert(result.error_msg);
                                    console.log(result.traceback);
                                } else {
                                    data.submit().success(function (result, textStatus, jqXHR) {
                                        $('.btn-upload-file-submit', $modal).removeAttr("disabled");
                                        if (call_back) call_back(result);
                                    })
                                }
                            });
                        })
                    }
                }
            });
        },
        // @upload_options:{
        //     template_url:模板文件下载URL地址,必填
        //     template_title:模板文件标题,非必填
        //     limit:默认=1,非必填
        //     folder_alias:'',非必填
        // }
        show_upload_dialog: function (title, upload_options, shown_callback, upload_callback) {
            this.$modal_block = $('#modal_block');
            $.fn.modal.Constructor.prototype.enforceFocus = function () {
            };
            var $modal = this._create_modal(), self = this;
            this._set_title(title, $modal);
            this._set_upload_content(upload_options, $modal, function () {
                self._init_fileupload(upload_options, $modal, upload_callback);
                if (shown_callback) shown_callback();
            });
            $modal.modal('show');
            $modal.draggable({
                handle: ".modal-header"
            });
            $modal.on('hidden.bs.modal', function (e) {
                $modal.remove();
            });
            return $modal;
        },
    }

};

var showDTDialogMixin = {
    mixins: [dialogMixin],
    methods: {
        _set_model_content: function (dt_view, dt_options, $modal, call_back) {
            var self = this;
            $.get('/model/modal/', function (response) {
                //响应成功
                if (response) {
                    $('.modal-body', $modal).html(response);
                    self._init_vue(dt_view, dt_options, $modal);
                    if (call_back) call_back();
                } else {
                    if (call_back) call_back();
                }
            });


        },
        _create_modal: function () {
            var htmls = [], self = this;
            var dialog_id = 'modal_' + (new Date()).getTime();
            // data-backdrop="static" 
            // tabindex="-1" 此配置将导致select2下拉无法搜索,输入框被禁用
            // style="overflow:hidden;"
            htmls.push('<div aria-hidden="true" aria-labelledby="myModalLabel" role="dialog" id="' + dialog_id + '" class="modal fade" data-backdrop="static" style="display: none;">');
            htmls.push('  <div class="modal-dialog" style="min-width:1000px">');
            htmls.push('    <div class="modal-content">');
            htmls.push('      <div class="modal-header">');
            htmls.push('        <button aria-hidden="true" data-dismiss="modal" class="close" type="button">×</button>');
            htmls.push('        <h4 id="myModalLabel" class="modal-title">Modal title</h4>');
            htmls.push('      </div>');
            htmls.push('      <div class="modal-body">');
            htmls.push('      </div>');
            htmls.push('    </div>');
            htmls.push('  </div>');
            htmls.push('</div>');

            this.$modal_block.append(htmls.join(""));
            var $modal = $('#' + dialog_id, this.$modal_block);

            return $modal;
        },
        _init_vue: function (dt_view, dt_options, $modal) {
            var self = this;
            self.selected_rows = [];
            self.selected_ids = [];
            self.dt_app = new Vue({
                el: '#modal_dt_template',
                data: {
                    'dt_options': dt_options,
                    'dt_view': dt_view
                },
                methods: {
                    on_add: function () {
                        self.selected_ids = this.$refs.dt_table.get_selected_ids();
                        $modal.find(".close").click()
                    },
                }
            });
        },
        show_dt_dialog: function (title, dt_options, shown_callback, hidden_callback, dt_view) {
            if (!dt_view) dt_view = "WRITE";
            var self = this;
            this.$modal_block = $('#modal_block');
            $.fn.modal.Constructor.prototype.enforceFocus = function () {
            };

            var $modal = this._create_modal();
            this._set_title(title, $modal);
            this._set_model_content(dt_view, dt_options, $modal, function () {
                if (shown_callback) shown_callback(self.dt_app.$refs.dt_table, self.dt_app);
            });
            $modal.modal('show');
            $modal.draggable({
                handle: ".modal-header"
            });
            $modal.on('hidden.bs.modal', function (e) {
                if (hidden_callback) hidden_callback(e, self.selected_ids);
                delete self.dt_app;
                $modal.remove();
            });

            return $modal;
        }
    }
};

var chartDialogMixin = {
    mixins: [],
    methods: {
        view_history: function (formData, selector, history_options) {
            var self = this;
            if (selector) {
                self._set_chart_dom(selector, function () {
                    self._init_history_form(formData, selector, history_options)
                })
            } else {
                self._init_history_form(formData, selector, history_options)
            }
        },
        _init_history_form: function (formData, selector, history_options) {
            var self = this;
            var form_data = formData;
            if (formData === undefined || formData === null || formData === "") {
                var form_data_str = $("#sing_view_form", selector).attr("form_data");
                form_data = JSON.parse(form_data_str);
            } else {
                form_data = formData
            }
            history_options = $.extend(true, history_options, {});
            history_options.update_time = null;
            form_data["history_options"] = history_options;
            if (selector === null || selector === undefined)
                selector = "#";
            var $el = selector + "history_chart_form";

            self.his_form = new Vue({
                el: $el,
                data: form_data,
                ready: function () {
                },
                methods: {
                    refresh_chart: function (new_options) {
                        var vself = this;
                        if (selector !== "#")
                            vself.v_echart = echarts.getInstanceById($("#history_chart", selector).attr('_echarts_instance_'));
                        else
                            vself.v_echart = echarts.getInstanceById($("#history_chart").attr('_echarts_instance_'));
                        vself.v_echart.showLoading();
                        vself.get_chart_data(function () {
                            vself.v_echart.hideLoading()
                        });
                    },
                    get_chart_data: function (callback) {
                        var vself = this;
                        var new_req_data = $.extend(true, history_options.req_data, {});
                        new_req_data.start_date = vself.start_date;
                        new_req_data.end_date = vself.end_date;
                        var data = {
                            "req_data": JSON.stringify(new_req_data)
                        };
                        data['csrfmiddlewaretoken'] = $("input[name='csrfmiddlewaretoken']").val();
                        $.post("/dev_monitor/mt_custom_view/history_data/get_chart_options/", data, function (req_opt) {
                            req_opt = JSON.parse(req_opt);
                            if (req_opt.error_msg) {
                                alert(req_opt.error_msg)
                            } else {
                                var options = {
                                    "legend_dict": req_opt.legend_dict,
                                    "query": req_opt.query,
                                    "db_name": req_opt.db_name,
                                    "db_type": req_opt.db_type
                                };
                                vself.$refs.history_chart._get_chart_data("/echart/get_echart_ts_data/", options, function (new_options) {
                                    //ToDo:这里的注释不要删除，如果echart出现闪一下，或者折线乱飞的情况修改这里
                                    var old_option = vself.v_echart.getOption();
                                    old_option.series = new_options.series;
                                    old_option.yAxis = new_options.yAxis;
                                    old_option.new_units = new_options.new_units;
                                    old_option.legend.data = new_options.legend.data;
                                    //使用extend合并配置会丢失部分配置，所以再用逐个赋值的方法合并配置！
                                    // new_options = $.extend(old_option, new_options);
                                    vself.v_echart.clear();
                                    vself.v_echart.setOption(old_option);
                                    if (callback)
                                        callback()
                                });
                            }
                        })
                    }
                }
            });
        },
        _set_chart_dom: function (selector, callback) {
            var self = this;
            $.get("/dev_monitor/mt_custom_view/history_data/get_form/", {"selector": selector}, function (res) {
                if (self.his_form)
                    self.his_form.$destroy(true);
                $(selector).html(res);
                if (callback) callback()
            })
        }
    }
};

var LineDialogMixin = {
    mixins: [dialogMixin, chartDialogMixin],
    methods: {
        _set_line_content: function (line_ops, $modal, call_back) {
            var self = this;
            // var file_input_id = 'fileupload' + (new Date()).getTime();
            // var template_url = upload_options.template_url ? upload_options.template_url : '';
            // var template_title = upload_options.template_title ? upload_options.template_title : '下载模板';
            // var data = {
            //     file_input_id: file_input_id,
            //     template_url: template_url,
            //     template_title: template_title
            // };
            $.get('/dev_monitor/special_line/mixin_form/', line_ops, function (res) {
                $('.modal-body', $modal).html(res);
                if (call_back) call_back();
            });
        },
        show_line_dialog: function (title, line_ops, shown_callback, hidden_callback) {
            this.$modal_block = $('#modal_block');
            $.fn.modal.Constructor.prototype.enforceFocus = function () {
            };
            var $modal = this._create_modal(), self = this;
            this._set_title(title, $modal);
            this._set_line_content(line_ops, $modal, function () {
                self._init_line_form(line_ops, $modal);
                if (shown_callback) shown_callback();
            });
            $modal.modal('show');
            $modal.draggable({
                handle: ".modal-header"
            });
            $modal.on('hidden.bs.modal', function (e) {
                $modal.remove();
            });
            return $modal;

        },
        _init_line_form: function (line_ops, $modal) {
            var self = this;
            var line_list_fields = [
                {'name': 'tattr', 'title': '名称', 'orderable': true, 'searchable': true},
                {'name': 'value', 'title': '值', 'orderable': true, 'searchable': true},
                {'name': 'priority', 'title': '优先级', 'orderable': true, 'visible': false}
            ];
            var line_form = new Vue({
                el: '#line_tab',
                mixins: [utilsMixin],
                data: {
                    line_details_options: {
                        "columns": line_list_fields,
                        "order": [[1, 'desc']],
                        'disable_init': true
                    }
                },
                ready: function () {
                    var vself = this;
                    vself._active_tab($("#his_line"), "his_line");
                    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                        vself.on_tab_active($(e.target))
                    });

                },
                methods: {
                    on_tab_active: function ($a) {
                        var vself = this;
                        var target = $a.attr('href');
                        $.cookie('his_line', target);
                        if (target === "#line_details") {
                            vself.refresh_line_details()
                        } else if (target === "#port_flow") {
                            vself.refresh_port_flow()
                        } else if (target === "#ping_res") {
                            vself.refresh_ping_res()
                        } else if (target === "#ping_loss") {
                            vself.refresh_ping_loss()
                        } else if (target === "#ping_rtt") {
                            vself.refresh_ping_rtt()
                        }
                    },

                    refresh_line_details: function () {
                        var vself = this;
                        var form_data_str = $("#line_details", $modal).attr("form_data");
                        var form_data = JSON.parse(form_data_str);
                        $.get('/cmdb/ci/ciattr/get_data/', {'ci': form_data.ci_id}, function (result) {
                            result = JSON.parse(result);
                            vself.$refs.line_details_table.refresh(result);
                        })
                    },

                    refresh_port_flow: function () {
                        var vself = this;

                        var req_data = {
                            "dev": line_ops.dev,
                            "keys": line_ops.keys
                        };
                        this._init_hischart(req_data, "#port_flow");
                    },

                    refresh_ping_res: function () {
                        var items = [line_ops.ci_id + "_ping"];
                        var req_data = {
                            "dev": line_ops.dev,
                            "items": items
                        };
                        this._init_hischart(req_data, "#ping_res")
                    },

                    refresh_ping_loss: function () {
                        var items = [line_ops.ci_id + "_loss"];
                        var req_data = {
                            "dev": line_ops.dev,
                            "items": items
                        };
                        this._init_hischart(req_data, "#ping_loss")
                    },

                    refresh_ping_rtt: function () {
                        var items = [line_ops.ci_id + "_rtt"];
                        var req_data = {
                            "dev": line_ops.dev,
                            "items": items
                        };
                        this._init_hischart(req_data, "#ping_rtt")
                    },

                    _init_hischart: function (req_data, selector) {
                        var data = {"data": JSON.stringify(req_data)};
                        $.get("/dev_monitor/mt_custom_view/topn/gert_topn_his_options", data, function (result) {
                            result = JSON.parse(result);
                            if (result.error_msg) {
                                alert(result.error_msg)
                            } else {
                                var options = result.options;
                                var start_date = options.req_data ? options.req_data.start_date : "2017-08-02";
                                var end_date = options.req_data ? options.req_data.end_date : "2017-08-03";
                                var FormData = {
                                    "end_date": end_date,
                                    "start_date": start_date
                                };
                                self.view_history(FormData, selector, options)
                            }
                        })
                    }
                }
            })
        }
    }
};

var utilsMixin = {
    methods: {
        _show_overlay: function () {
            $.LoadingOverlay("show", {
                size: '10%'
            });
        },
        _close_overlay: function () {
            $.LoadingOverlay("hide");
        },
        _concat_url: function (prefix_url, sub_url) {
            if (prefix_url && sub_url) {
                var url_arr = [];
                var temp_arr = prefix_url.split('/');
                for (var i = 0; i < temp_arr.length; i++) {
                    if (temp_arr[i]) url_arr.push(temp_arr[i]);
                }
                var temp_arr = sub_url.split('/');
                for (var i = 0; i < temp_arr.length; i++) {
                    if (temp_arr[i]) url_arr.push(temp_arr[i]);
                }
                var full_url = '/' + url_arr.join('/') + '/'
                return full_url;
            }

        },
        _deep_copy: function (s_obj) {
            if (s_obj instanceof Object) {
                if (typeof s_obj.length === 'number') {
                    var new_obj = [];
                    if (s_obj) {
                        for (var i = 0; i < s_obj.length; i++) {
                            new_obj[i] = typeof s_obj[i] === 'object' ? this._deep_copy(s_obj[i]) : s_obj[i];
                        }
                    }
                    return new_obj;
                } else {
                    var new_obj = {};
                    if (s_obj) {
                        for (var key in s_obj) {
                            new_obj[key] = typeof s_obj[key] === 'object' ? this._deep_copy(s_obj[key]) : s_obj[key];
                        }
                    }
                    return new_obj;
                }

            }
        },
        _inspect_fields_value: function (fields, v_obj) {
            // inspect the field default value to field defines list
            // @fields = ['name','desc',{'name':'parent','title':'父节点','readonly':true}]
            // @v_obj = {'parent':1}
            // @return ['name','desc',{'name':'parent','title':'父节点','readonly':true,'default':1}]
            var tmp_arr = fields;
            for (var i = 0; i < tmp_arr.length; i++) {
                if (tmp_arr[i] && tmp_arr[i] instanceof Object) {
                    var name = tmp_arr[i].name;
                    if (v_obj[name]) {
                        tmp_arr[i].default = v_obj[name]
                    }
                }
            }
            return tmp_arr;
        },
        _active_tab: function ($ul, cookie_name) {
            // 获取cookie值
            var $cookie = $.cookie(cookie_name);
            var target = null;
            var $oriActive = $ul.find('li.active a');
            //根据cookie获取需要被激活的标签页
            if ($cookie)
                target = $ul.find('a[href="' + $cookie + '"]');
            // 如果根据cookie没有找到相关元素,或者没有cookie，则取第一标签页
            if ((target && target.length === 0) || !$cookie)
                target = $("li:first", $ul).find("a");
            if (target.length > 0)
                target.tab('show');
            // 如果当前激活标签页和初始化时激活的标签页相同,则证明激活的是同一个标签页，需要手工触发事件
            if ($oriActive.attr('href') === target.attr('href'))
                this.on_tab_active(target);
        },
        _check_list_fields: function (list_fields, direction) {
            var new_list_fields = [];
            if (!direction) direction = 'left';
            if (direction == 'left') {
                for (var i = 0; i < list_fields.length; i++) {
                    var item = list_fields[i];
                    for (var j = i + 1; j < list_fields.length; j++) {
                        var tmp_item = list_fields[j];
                        if (tmp_item.name.toLowerCase() == item.name.toLowerCase()) {
                            $.extend(item, tmp_item);
                            list_fields.splice(j, 1);
                            break;
                        }
                    }
                    new_list_fields.push(item);
                }
            } else {
                for (var i = list_fields.length; i > 0; i--) {
                    var item = list_fields[i];
                    for (var j = i - 1; j >= 0; j--) {
                        var tmp_item = list_fields[j];
                        if (tmp_item.name.toLowerCase() == item.name.toLowerCase()) {
                            $.extend(item, tmp_item);
                            list_fields.splice(j, 1);
                            break;
                        }
                    }
                    new_list_fields.push(item);
                }
            }
            return new_list_fields;
        }
    }
};

