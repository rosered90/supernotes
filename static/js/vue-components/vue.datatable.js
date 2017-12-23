/*
 @author	:	dj
 @date 	:	2016-08-20
 @desc 	:	vue components js
 @example:

 <vue-datatable view='{{dt_view}}' 
 :options="options" 
 csrftoken="{{ csrf_token }}" 
 v-ref:dt1
 v-on:row_click="row_click">
 </vue-datatable>

 */

/*
 vue.js and jquery.datatable.js
 */
var i18n_cn = {
    "sProcessing": "处理中...",
    "sLengthMenu": "_MENU_",
    "sZeroRecords": "没有匹配结果",
    "sInfo": "共 _TOTAL_ 显示 _START_ 至 _END_ ",
    "sInfoEmpty": "共 0 项 显示第 0 至 0 项结果",
    "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
    "sInfoPostFix": "",
    "sSearch": "",
    "sUrl": "",
    "sEmptyTable": "表中数据为空",
    "sLoadingRecords": "载入中...",
    "sInfoThousands": ",",
    "oPaginate": {
        "sFirst": "首页",
        "sPrevious": "上页",
        "sNext": "下页",
        "sLast": "末页"
    },
    "oAria": {
        "sSortAscending": ": 以升序排列此列",
        "sSortDescending": ": 以降序排列此列"
    }
};

var vueDataTable = Vue.extend({
    template: '<div class="table-responsive"><table datatable class="table table-striped table-hover table-success" width="100%"></table></div>',
    props: ['view', 'options', 'csrftoken'],
    mixins: [utilsMixin, dialogMixin, fileUploadMixin],
    $dt: null, //datatable base dom(jquery)
    fields: [], //datatable fields
    searchable_fields: [], //datatable searchable fields
    columns: [], //datatable columns that convertec from fields
    dataTable: null,
    url_prefix: '',
    ajax_action: 'search',
    default_filters: {},
    final_filters: {},
    ajax_args: [],
    black_list: [],
    // created:function(){
    // 	console.log("created",this.$el,this.view);
    // },beforeCompile
    // compiled:function(){
    // 	console.log("compiled",this.$el,this.view);
    // },
    // ready:function(){
    // 	console.log("ready",this.$el,this.view);
    // },
    ready: function () {
        this.$dt = $(this.$el).find('table');
        // CRUD事件
        this.on_create = this.options.on_create ? this.options.on_create : this._on_create;
        this.on_update = this.options.on_update ? this.options.on_update : this._on_update;
        this.on_delete = this.options.on_delete ? this.options.on_delete : this._on_delete;
        this.on_batch_delete = this.options.on_batch_delete ? this.options.on_batch_delete : this._on_batch_delete;
        this.on_batch_import = this.options.on_batch_import ? this.options.on_batch_import : this._on_batch_import;
        this.create_columns = [];
        if (this.options.create_columns) this.create_columns = this.options.create_columns;
        this.update_columns = [];
        if (this.options.update_columns) this.update_columns = this.options.update_columns;
        this.comm_buttons = null;
        if (this.options.comm_buttons && this.options.comm_buttons.length >= 0) this.comm_buttons = this.options.comm_buttons;
        this.more_buttons = null;
        if (this.options.more_buttons && this.options.more_buttons.length >= 0) this.more_buttons = this.options.more_buttons;
        this.row_buttons = null;
        if (this.options.row_buttons && this.options.row_buttons.length >= 0) this.row_buttons = this.options.row_buttons;
        this.disable_init = false;
        //diable datatable load data after initialized.
        if (this.options.disable_init === true) this.disable_init = true;
        // if url prefix is exist then
        this.url_prefix = '';
        if (this.options.url_prefix)
            this.url_prefix = this.options.url_prefix;
        if (this.url_prefix && !this.ajax_action)
            this.ajax_action = 'search';
        else this.ajax_action = null;
        // finally filters
        this.default_filters = {};
        if (this.options.filters) this.default_filters = this.options.filters;
        this.final_filters = this.default_filters;
        // black_list
        this.black_list = [];
        if (this.options.black_list) this.black_list = this.options.black_list;
        // ajax args defination
        this.ajax_args = [];
        if (this.options.ajax_args) this.ajax_args = this.options.ajax_args;
        this.create_context = [];
        // 初始化datatable
        if (this._set_default) {
            var self = this;
            this._set_default(function () {
                var dt_options = self._make_options(self.options);
                self.dataTable = self.$dt.dataTable(dt_options).api();
                self._extend_dt();
            })
        } else {
            var dt_options = this._make_options(this.options);
            this.dataTable = this.$dt.dataTable(dt_options).api();
            this._extend_dt();
        }

    },
    methods: {
        refresh: function (temp_filters_or_data, black_list, args) {
            // 目前仅支持and
            var self = this;
            // 合并默认过滤条件和临时传入的过滤条件
            // 当temp_filters为null时或不传时,不会对当前查询条件有任何影响
            // 当temp_filters存在({}空对象也算存在)，则覆盖当前查询条件
            if (this.url_prefix) {
                if (temp_filters_or_data && temp_filters_or_data instanceof Object) {
                    var f_filters = this._deep_copy(this.default_filters);
                    $.extend(f_filters, temp_filters_or_data);
                    this.final_filters = f_filters;
                }
            } else {
                self.dataTable.clear();
                if (temp_filters_or_data && temp_filters_or_data instanceof Array) {
                    for (var i in temp_filters_or_data) {
                        var newLine = self.dataTable.row.add(temp_filters_or_data[i]);
                        var index = newLine.index();
                        var $rowNode = $(self.dataTable.row(index).node());
                        $rowNode.css('cursor', 'pointer');
                        self.dataTable.order(self.options["order"][0][0])
                    }
                }
            }
            // 黑名单一旦输入则覆盖,且必须是数组
            if (black_list && black_list instanceof Array) {
                this.black_list = black_list;
            }

            if (args && args instanceof Array && args.length > 0)
                this.ajax_args = args;

            this.dataTable.draw();
        },
        set_create_context: function (context) {
            // context 格式必须为{'parent':5,'flags':'wewe'}
            if (context && context instanceof Object) {
                this.create_context = this._deep_copy(this.create_columns);
                this.create_context = this._inspect_fields_value(this.create_context, context);
            } else {
                throw new Error('context必须为json对象.');
            }
        },
        _make_options: function (options) {
            var self = this;

            var new_options = {
                'dom': '<"top row mb5"<"col-md-12"<"dt_ops">fl>>rt<"bottom"ip><"clear">',
                'language': i18n_cn,
                "sPaginationType": "full_numbers"
            };
            new_options["order"] = options["order"];
            if (!new_options["order"]) {
                new_options["order"] = [[1, "desc"]];
            }
            // new_options["aaSorting"] = options["aaSorting"];
            // if (!new_options["aaSorting"]) {
            //     new_options["aaSorting"] = [[1, "desc"]];
            // }
            // new_options["stateSave"] = true;
            // 获取所有要显示的字段
            var fields = [], searchable_fields = [];
            if (!options.columns || options.columns.length == 0)
                throw new Error('请为datatable配置需要显示字段.');
            for (var i = 0; i < options.columns.length; i++) {
                var f_def = options.columns[i];
                var field_name = f_def.name;
                if (!field_name) throw new Error('datatable第' + (i + 1) + '列没有配置需要显示的字段.');
                fields.push(field_name);

                if (f_def.searchable)
                    searchable_fields.push(f_def.name);
            }
            this.fields = fields;
            this.searchable_fields = searchable_fields;
            // 设置ajax
            if (this.url_prefix) {
                new_options["processing"] = true;
                new_options["serverSide"] = true;
                var ajax_url = self._concat_url(this.url_prefix, this.ajax_action);
                new_options["ajax"] = function (data, callback, settings) {
                    settings.ajax_url = ajax_url;
                    self._set_ajax(data, callback, settings, new_options["order"])
                }
            }
            // 设置列
            var columns_arr = [];
            if (this.view == "MUL_SELECT" || this.view == "WRITE") {
                columns_arr.push({
                    "title": "<input type='checkbox' class='check_all'/>",
                    "class": "center",
                    "width": "40px",
                    "orderable": false,
                    "data": null,
                    "defaultContent": "<input type='checkbox' class='check_item'/>",
                });
            }
            if (this.view == "SINGLE_SELECT") {
                var radio_name = "check_radio_item_" + (new Date()).getTime();
                columns_arr.push({
                    "title": "",
                    "class": "center",
                    "width": "40px",
                    "orderable": false,
                    "data": null,
                    "defaultContent": "<input type='radio' name='" + radio_name + "' class='check_radio_item'/>",
                });
            }
            columns_arr = columns_arr.concat(options.columns);
            if (this.view == "WRITE" && (!this.row_buttons || this.row_buttons.length > 0)) {
                columns_arr.push({
                    "title": "操作",
                    "orderable": false,
                    "width": "100px",
                    "render": function (data, type, row) {
                        var btn_htmls = [];
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            var title = item.title;
                            var url = self._concat_url(options.url_prefix, item.action);
                            var css_class = item.class;
                            btn_htmls.push("<a href='javascript:void(0)' class='row-btn' action='" + item.action + "' url='" + url + "' title='" + title + "'><span class='" + css_class + "'>" + (css_class ? '' : title) + "</span></a>");
                        }
                        return btn_htmls.join(" ");
                    }
                });
            }
            new_options["columns"] = columns_arr;
            this.columns = columns_arr;

            // 行创建事件
            var ori_createdRow = options["createdRow"];
            new_options["createdRow"] = function (row, data, dataIndex) {
                if (data && data.length > 0) $(row).attr("id", data[data.length - 1]);
                if (ori_createdRow) ori_createdRow(row, data, dataIndex);
                self._bind_row_events($(row), data);
            };

            // 冻结列操作
            if (options["scrollX"]) new_options["scrollX"] = options["scrollX"];
            if (options["scrollXInner"]) new_options["scrollXInner"] = options["scrollXInner"];
            if (options["fixedColumns"]) new_options["fixedColumns"] = options["fixedColumns"];
            if (options["scrollCollapse"]) new_options["scrollCollapse"] = options["scrollCollapse"];
            if (options["paging"] != undefined) new_options["paging"] = options["paging"];

            // 合并后将以后面配置为准
            $.extend(options, new_options);
            // console.log("new_options",new_options);

            return new_options
        },
        _extend_dt: function () {
            var self = this;
            // 绑定批量选择checkbox事件
            $('input.check_all', $(this.$el)).die().live("change", function () {
                var all_checked = $(this)[0].checked;
                $('input.check_item', $(self.$el)).each(function (i) {
                    if ($(this).prop('checked') != all_checked) {
                        $(this).attr('checked', all_checked).change();
                    }
                    if (all_checked)
                        $(this).parent().parent().addClass('selected');
                    else
                        $(this).parent().parent().removeClass('selected');
                });
            });
            // 绑定选择checkbox事件到全选checkbox
            $('input.check_item', $(this.$el)).die().live('change', function () {
                var all_checked = true;
                $('input.check_item', $(self.$el)).each(function (index) {
                    if (!$(this).prop('checked')) all_checked = false;
                });
                $('input.check_all', $(self.$el)).attr('checked', all_checked);
            })
        },
        _init_toolbar: function (comm_buttons, more_btns) {
            if (this.view == 'WRITE' && $(this.$el).find("div.top .dt_ops").html() == '') {
                var self = this;
                // 创建按钮
                var comm_btn_htmls = [];
                if (comm_buttons && comm_buttons.length > 0) {
                    for (var i = 0; i < 2; i++) {
                        var comm_btn = comm_buttons[i];
                        if (comm_btn) {
                            var url = self._concat_url(self.url_prefix, comm_btn.action);
                            comm_btn_htmls.push("<a href='javascript:void(0)' class='btn btn-success btn-sm btn-comm " + comm_btn.class + "' action='" + comm_btn.action + "' url='" + url + "' title='" + comm_btn.title + "'><span class='" + comm_btn.icon + "'>" + comm_btn.title + "</span></a>");
                        }
                    }
                }

                // 更多按钮
                var more_btn_htmls = [];
                if (more_btns && more_btns.length > 0) {
                    more_btn_htmls.push("   <div class='btn-group' style='margin:0;'> ");
                    more_btn_htmls.push("       <a data-toggle='dropdown' class='btn btn-success btn-sm dropdown-toggle' type='button'> ");
                    more_btn_htmls.push("           更多 <span class='caret'></span> ");
                    more_btn_htmls.push("       </a> ");
                    more_btn_htmls.push("       <ul role='menu' class='dropdown-menu'> ");

                    for (var j = 0; j < more_btns.length; j++) {
                        var more_btn = more_btns[j];
                        var url = self._concat_url(self.url_prefix, more_btn.action);
                        more_btn_htmls.push("<li><a href='javascript:void(0)' class='btn-more " + more_btn.class + "' action='" + more_btn.action + "' url='" + url + "' title='" + more_btn.title + "'><span class='" + more_btn.icon + "'>" + more_btn.title + "</span></a></li>");
                    }
                    more_btn_htmls.push("       </ul>");
                    more_btn_htmls.push("    </div>");
                }

                var htmls = [];
                htmls.push("<div class='btn-group' style='float:left;margin-bottom:0;margin-right:5px;'> ");
                if (comm_btn_htmls.length > 0)
                    htmls = htmls.concat(comm_btn_htmls);
                if (more_btn_htmls.length > 0)
                    htmls = htmls.concat(more_btn_htmls);
                htmls.push("</div>");
                // console.log(this.$dt,this.$dt.find("div.top .dt_ops"));
                $(this.$el).find("div.top .dt_ops").prepend(htmls.join(""));
                // 绑定通用按钮点击事件
                $(this.$el).find("a.btn-comm").click(function () {
                    var action_name = $(this).attr("action");
                    var event_name = 'on_' + action_name;
                    var url = $(this).attr("url");
                    var event_callback = self.$emit('on_pre_' + action_name, url);
                    if (!event_callback) return;
                    if (action_name == 'create') {
                        if (self[event_name])
                            self[event_name](url);
                    } else {
                        var datatable = self;
                        self.$emit(event_name, datatable, url);
                    }
                });

                // 绑定更多中按钮的点击事件
                $(this.$el).find("a.btn-more").click(function () {
                    var action_name = $(this).attr("action");
                    var event_name = 'on_' + action_name;
                    var url = $(this).attr("url");
                    var ids = self.get_selected_ids();
                    var event_callback = self.$emit('on_pre_' + action_name, ids, url);
                    if (!event_callback) return;
                    if (action_name == 'batch_delete' || action_name == 'batch_import') {
                        if (self[event_name])
                            self[event_name](ids, url);
                    } else {
                        var datatable = self;
                        self.$emit(event_name, datatable, ids, url);
                    }
                });
            }
        },
        _set_ajax: function (data, callback, settings, order) {
            var self = this;
            if (this.fields.length > 0)
                data.fields = JSON.stringify(this.fields);
            if (this.searchable_fields.length > 0)
                data.searchable_fields = JSON.stringify(this.searchable_fields);
            if (this.comm_buttons && this.comm_buttons.length >= 0)
                data.comm_buttons = JSON.stringify(this.comm_buttons);
            if (this.more_buttons && this.more_buttons.length >= 0)
                data.more_buttons = JSON.stringify(this.more_buttons);
            if (this.row_buttons && this.row_buttons.length >= 0)
                data.row_buttons = JSON.stringify(this.row_buttons);
            data.page = data.start / data.length + 1;
            data.q_list = JSON.stringify(this.final_filters);
            data.ext_args = JSON.stringify(this.ajax_args);
            data.black_list = JSON.stringify(this.black_list);
            // data.order[i][column]
            // data.order = [{ 'column':3,'dir':'desc' }]
            // console.log(data);
            if (!this.disable_init) {
                $.get(settings.ajax_url, data, function (response) {
                    if (response) {
                        response = JSON.parse(response);
                        // console.log(response);
                        self._init_toolbar(response.buttons, response.more_buttons);
                        callback(response);
                    }
                });
            } else {
                this.disable_init = false;
            }
        },
        _bind_row_events: function ($row, data) {
            var self = this;
            $row.css("cursor", "pointer");
            // 绑定行按钮事件
            // 如果固定操作列，那么将操作列的事件触发给下面一层
            $(this.$el).find('div.DTFC_RightBodyWrapper a.row-btn').die().live('click', function () {
                var index = $(this).parent().parent()[0].rowIndex;
                var action = $(this).attr('action');
                self.$dt.find('a.row-btn[action="' + action + '"]')[index - 1].click();
            });
            $row.find('a.row-btn').die().live('click', function () {
                var $row = $(this).parent().parent();
                var action_name = $(this).attr("action");
                var event_name = 'on_' + action_name;
                var url = $(this).attr("url");
                var event_callback = self.$emit('on_pre_row_' + action_name, $row, url);
                if (!event_callback) return;
                if (action_name == 'update' || action_name == 'delete') {
                    if (self[event_name])
                        self[event_name]($row, url);
                } else {
                    var datatable = self;
                    self.$emit(event_name, datatable, $row, url);
                }
            });
            // 绑定行点击事件
            $row.find('td:gt(0):lt(' + (this.columns.length - 2) + ')').die().live('click', function () {
                self.$emit('row_click', $row.attr('id'), $row);
            });
            // 绑定行checkbox事件
            // 如果固定左侧列，将左侧的checkbox的change事件赋给下面一层
            $(this.$el).find('div.DTFC_LeftBodyWrapper input.check_item').die().live('change', function (e) {
                var index = $(self.$el).find('div.DTFC_LeftBodyWrapper input.check_item').index(this);
                var checked = $(this)[0].checked;
                self.$dt.find('input.check_item')[index].checked = checked;
                if (!checked) {
                    $(self.$el).find('input.check_all').prop('checked', false);
                }
            });
            $row.find('input.check_item').change(function () {
                if (!$(this)[0].checked) {
                    var $dt = $row.parent().parent();
                    $dt.find('input.check_all')[0].checked = false;
                }
            });
        },

        get_selected_ids: function () {
            var selected_ids = [];
            var rows = this.get_selected_rows();
            for (var i = 0; i < rows.length; i++) {
                var $row = rows[i];
                var id = $row.attr('id');
                id = parseInt(id);
                selected_ids.push(id);
            }
            if (this.view == "SINGLE_SELECT") {
                if (selected_ids.length > 0)
                    return selected_ids[0];
                else
                    return false;
            }
            if (this.view == "MUL_SELECT" || this.view == "WRITE") {
                if (selected_ids.length > 0)
                    return selected_ids;
                else
                    return false;
            }
        },
        get_selected_rows: function () {
            var rows = [];
            $(this.$el).find('input.check_item').each(function () {
                if ($(this)[0].checked) {
                    var $row = $(this).parent().parent();
                    if ($row.attr('id')) rows.push($row);
                }
            });
            $(this.$el).find('input.check_radio_item').each(function () {
                if ($(this)[0].checked) {
                    var $row = $(this).parent().parent();
                    if ($row.attr('id')) rows.push($row);
                }
            });
            return rows;
        },

        get_page_rows: function () {
            var rows = [];
            $(this.$el).find('tbody tr').each(function () {
                var $row = $(this);
                if ($row.attr('id')) rows.push($row);
            });
            return rows;
        },
        get_page_ids: function () {
            var page_ids = [];
            var rows = this.get_page_rows();
            for (var i = 0; i < rows.length; i++) {
                var $row = rows[i];
                var id = $row.attr('id');
                id = parseInt(id);
                if (id)
                    page_ids.push(id);
            }
            return page_ids;
        },
        /*
         datatable 默认CRUD事件绑定
         */
        __get_row_id: function ($row) {
            var id_str = $row.attr("id");
            var id = parseInt(id_str);
            return id;
        },
        _init_v_form: function (action, form_url, $modal) {
            var self = this;
            var form_data = {};
            var form_data_str = $modal.find('form').attr('form_data');
            if (form_data_str)
                form_data = JSON.parse(form_data_str);
            var form_app = new Vue({
                el: '#form_wrapper_' + action,
                data: form_data,
                ready: function () {
                    // TODO:优化select2异步验证问题
                    setTimeout(function () {
                        form_app.$resetValidation();
                    }, 1000);
                },
                methods: {
                    submit: function (e) {
                        e.preventDefault();
                        var data = this._data;
                        data['csrfmiddlewaretoken'] = $("input[name='csrfmiddlewaretoken']", $modal).val();
                        data['fields'] = JSON.stringify(self[action + '_columns']);
                        var $SubBtn = $(form_app.$el).find('.modal-footer button');
                        if (this.$validation.valid && form_url) {
                            $SubBtn.attr('disabled', true);
                            $.post(form_url, data, function (res) {
                                if (res)
                                    res = JSON.parse(res);
                                if (res.error_msg) {
                                    alert(res.error_msg);
                                    $SubBtn.attr('disabled', false)
                                } else {
                                    // 刷新表格
                                    self.refresh();
                                    self.$emit('on_' + action + '_done', res);
                                    $modal.modal('hide');
                                }
                            });
                            // console.log(this.$validation,this._data);
                        }
                    }
                }
            });
            if (form_app) {
                self.$parent[action + '_form_app'] = form_app;
            }
        },
        _destroy_v_form: function (action) {
            delete this.$parent[action + '_form_app'];
        },
        _on_create: function (url) {
            var self = this;
            var create_columns = this.create_context.length ? this.create_context : this.create_columns;
            var ajax = {
                url: url,
                params: {
                    'fields': JSON.stringify(create_columns)
                }
            };
            var $modal = this.show_dialog('创建', ajax, function (e) {
                self.set_form_action(url, $modal);
                self._init_v_form('create', url, $modal);
                self.$emit('on_create_shown', $modal);
            }, function (e) {
                self._destroy_v_form('create');
            });
        },
        _on_update: function ($row, url) {
            var self = this;
            this.id = this.__get_row_id($row);
            var new_url = url + this.id + '/';
            var ajax = {
                url: new_url,
                params: {
                    'fields': JSON.stringify(this.update_columns)
                }
            };
            var $modal = this.show_dialog('编辑', ajax, function (e) {
                self.set_form_action(new_url, $modal);
                self._init_v_form('update', new_url, $modal);
                self.$emit('on_update_shown', $modal);
            }, function (e) {
                self._destroy_v_form('update');
            });
        },
        _on_delete: function ($row, url) {
            var self = this;
            var id = this.__get_row_id($row);

            var temp_arr = url.split('/');
            var u_arr = [];
            for (var i = 0; i < temp_arr.length; i++) {
                if (temp_arr[i]) u_arr.push(temp_arr[i]);
            }
            u_arr.push(id);
            var new_url = '/' + u_arr.join('/') + '/';

            var data = {'csrfmiddlewaretoken': this.csrftoken};
            // data['csrfmiddlewaretoken'] = $("input[name='csrfmiddlewaretoken']",$modal).val()
            if (confirm('确认删除？')) {
                $.post(new_url, data, function (res) {
                    if (res)
                        res = JSON.parse(res);
                    if (res.error_msg) {
                        alert(res.error_msg)
                    } else {
                        // 刷新表格
                        self.refresh();
                        self.$emit('on_delete_done', res);
                    }
                })
            }
        },
        _on_batch_delete: function (ids, url) {
            // console.log(ids,url);
            var self = this;
            if (ids.length) {
                var data = {'ids': JSON.stringify(ids), 'csrfmiddlewaretoken': this.csrftoken};
                if (confirm('确认删除？')) {
                    $.post(url, data, function (res) {
                        if (res)
                            res = JSON.parse(res);
                        if (res.error_msg) {
                            alert(res.error_msg)
                        } else {
                            // 刷新表格
                            self.refresh();
                            self.$emit('on_batch_delete_done', res, ids);
                        }
                    })
                }
            } else {
                alert('请选择需要删除的记录!');
            }
        },
        _on_batch_import: function (ids, url) {
            var self = this;
            var upload_options = {
                limit: 1,
                'template_url': url
            };
            var $model = this.show_upload_dialog('批量导入', upload_options, null, function (result) {
                $("#attach_submit").attr("disabled", "disabled");
                result = JSON.parse(result);
                if (result.error_msg) {
                    alert(result.error_msg)
                } else {
                    var data = {'path': result[0]};
                    data['csrfmiddlewaretoken'] = self.csrftoken;
                    $.post(url, data, function (res) {
                        res = JSON.parse(res);
                        if (res.error_msg) {
                            $("#attach_submit").removeAttr("disabled");
                            alert(res.error_msg);
                        } else {
                            $model.modal('hide');
                            self.refresh();
                            self.$emit('on_batch_import_done', res);
                        }
                    })
                }
            })
        },
        reload: function (columns, callback) {
            if (this.dataTable) {
                this.dataTable.destroy();
            }
            this.$dt.empty();
            this.options.columns = columns;
            if (this.options.disable_init) this.disable_init = (this.options.disable_init === true);
            // 初始化datatable
            if (this._set_default) {
                var self = this;
                this._set_default(function () {
                    var dt_options = self._make_options(self.options);
                    self.dataTable = self.$dt.dataTable(dt_options).api();
                    self._extend_dt();
                    if (callback) callback();
                });
            } else {
                var dt_options = this._make_options(this.options);
                this.dataTable = this.$dt.dataTable(dt_options).api();
                this._extend_dt();
                if (callback) callback();
            }
        }
    }
});


// 注册所有的组件
Vue.component('vueDatatable', vueDataTable);

