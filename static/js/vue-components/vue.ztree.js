var vueZtree = Vue.extend({
    template: '<ul class="ztree"></ul>',
    props: ['options', "csrftoken", 'id'],
    check: false,
    mixins: [utilsMixin, dialogMixin],
    ready: function () {
        $(this.$el).attr('id', this.id);
        this.create_fields = this.options.create_columns ? this.options.create_columns : [];
        this.update_fields = this.options.update_columns ? this.options.update_columns : [];
        if (this.options.check === true) this.check = true;
        this.buttons = [];
        if (this.options.buttons && this.options.buttons.length >= 0) this.buttons = this.options.buttons;
        this._make_options(this.options);
    },
    methods: {
        _make_options: function (options) {
            var self = this;
            // analy the initial pramas
            this.update_title = '修改';
            this.delete_title = '删除';
            this.custom_btn = [];
            for (var i = self.buttons.length - 1; i >= 0; i--) {
                var action = self.buttons[i].action;
                if (action != 'update' && action != 'delete') {
                    this.custom_btn.push(self.buttons[i])
                } else {
                    self.update_title = self.buttons[i].title && action == 'update' ? self.buttons[i].title : self.update_title;
                    self.delete_title = self.buttons[i].title && action == 'delete' ? self.buttons[i].title : self.delete_title
                }
            }
            this.url_prefix = '';
            if (this.options && this.options.url_prefix)
                this.url_prefix = this.options.url_prefix;
            this.virtualroot = this.options.virtualroot;
            this.readonly = this.options.readonly;

            this._get_init_nodes(function (initNodes) {
                self._init_ztree(initNodes);
                self._expend_default();
                self.$emit('on_init_done', self.$ztree, initNodes);
            })
        },
        _init_ztree: function (initNodes) {
            var self = this;
            this.setting = {
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "pid"
                    }
                },
                callback: {
                    onClick: this._on_click,
                    onDblClick: this.ztree_on_dblclick,
                    beforeExpand: this._on_expand
                }
            };
            if (this.readonly) {
                this.setting.edit = {
                    enable: false
                };
                this.setting.view = {
                    addHoverDom: null,
                    removeHoverDom: null
                };
            } else {
                this.setting.callback.beforeEditName = this._on_update;
                this.setting.callback.beforeRemove = this._on_delete;
                this.setting.edit = {
                    enable: true,
                    drag: {
                        isCopy: false,
                        isMove: false
                    },
                    showRemoveBtn: this.showRemoveBtn,
                    showRenameBtn: this.showEditBtn,
                    selectedMulti: false,
                    removeTitle: this.delete_title,
                    renameTitle: this.update_title,
                };
                this.setting.view = {
                    addHoverDom: this.addHoverDom,
                    removeHoverDom: this.removeHoverDom
                };
                if (this.check === true) this.setting.check = {enable: true};
            }
            self.$ztree = $.fn.zTree.init($(self.$el), this.setting, initNodes);
        },
        _get_init_nodes: function (call_back) {
            // by default get the initial data that level<3
            var s_path = $.cookie('z_selected_path');
            var url = this._concat_url(this.url_prefix, 'get_init_nodes');
            var data = {'selected_path': s_path ? s_path : '', 'buttons': JSON.stringify(this.buttons)};
            if (this.virtualroot)
                data['virtualroot'] = this.virtualroot;
            $.get(url, data, function (res) {
                if (res)
                    res = JSON.parse(res);
                if (res.error_msg) {
                    alert(res.error_msg);
                    console.log(res.traceback)
                } else if (res.length > 0 && call_back) {
                    call_back(res);
                }
            });
        },
        _get_sub_nodes: function (treeId, treeNode) {
            var self = this;
            var url = this._concat_url(this.url_prefix, ['get_sub_nodes', treeNode.id.toString()]);
            $.get(url, {'buttons': JSON.stringify(this.buttons)}, function (res) {
                var subNodes = [];
                if (res)
                    res = JSON.parse(res);
                if (res.error_msg) {
                    alert(res.error_msg)
                } else if (res.length > 0) {
                    self.$ztree.addNodes(treeNode, res);
                    treeNode.loaded = true;
                    self.$emit('on_get_sub_nodes', treeNode, res);
                }
            });
        },
        _on_expand: function (treeId, treeNode) {
            if (treeNode.level > 1 && treeNode.isParent && !treeNode.loaded && treeNode.check_Child_State) {
                this._get_sub_nodes(treeId, treeNode);
            } else {
                this.$emit("on_expand", treeId, treeNode);
            }
        },
        _expend_default: function () {
            var self = this;
            var s_path = $.cookie('z_selected_path');
            if (s_path) {
                var items = s_path.split('_');
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var int_item = parseInt(item);
                    if (int_item) {
                        var node = self.$ztree.getNodeByParam('id', int_item, null);
                        if (!node) return;
                        if (i == items.length - 1) {
                            self.$ztree.selectNode(node);
                            self.$ztree.setting.callback.onClick(null, self.$ztree.setting.treeId, node);
                        } else {
                            self.$ztree.expandNode(node, true, false, true);
                        }
                    }
                }
            } else {
                var root_nodes = self.$ztree.getNodesByParam("level", 0, null);
                for (var i = 0; i < root_nodes.length; i++) {
                    self.$ztree.expandNode(root_nodes[i], true, false, true);
                    if (i == 0) {
                        $.cookie('z_selected_path', root_nodes[i].path);
                        self.$ztree.selectNode(root_nodes[i]);
                        self.$ztree.setting.callback.onClick(null, self.$ztree.setting.treeId, root_nodes[i]);
                    }
                }
            }
        },
        // this segement control the buttons' visibility of znodes
        showRemoveBtn: function (treeId, treeNode) { // 根节点不显示删除按钮
            return treeNode.deleteable;                   // return treeNode.level==0?false:true; 这样写比较规范
        },
        showEditBtn: function (treeId, treeNode) { // 根节点不显示删除按钮
            return treeNode.updateable;                   // return treeNode.level==0?false:true; 这样写比较规范
        },
        addHoverDom: function (treeId, treeNode) {
            var self = this;
            var sObj = $("#" + treeNode.tId + "_span");
            for (var i = self.custom_btn.length - 1; i >= 0; i--) {
                var action = self.custom_btn[i].action;
                var able_name = action + 'able';
                if (treeNode.editName0Flag || $("#btn_" + treeNode.tId + "_" + action).length > 0) return;
                if (treeNode[able_name]) {// 自定义btn图标显示
                    var addStr = "<span action=" + action +
                        " class='add-comm-btn " + self.custom_btn[i].class + "' " +
                        "id='btn_" + treeNode.tId + "_" + action + "' " +
                        "title='" + self.custom_btn[i].title + "' " +
                        "onfocus='this.blur();'></span>";
                    sObj.after(addStr);
                }
            }
            // 自定义btn事件绑定
            var addBtn = $("[id^='btn_" + treeNode.tId + "_']");
            if (addBtn) addBtn.bind("click", function (event) {
                event.stopPropagation();
                var action = $(this).attr("action");
                var event_name = 'on_' + action;
                if (action == 'create') {
                    self._on_create(treeId, treeNode);
                } else {
                    self.$emit(event_name, treeId, treeNode);
                }
            });
        },
        removeHoverDom: function (treeId, treeNode) {
            for (var i = this.custom_btn.length - 1; i >= 0; i--) {
                var action = this.custom_btn[i].action;
                var $target = $("span#btn_" + treeNode.tId + "_" + action);
                if($target.length) $target.unbind().remove();
            }
        },
        // other events
        _on_click: function (event, treeId, treeNode) {
            // console.log(treeNode.path);
            if (treeNode && treeNode.path)
                $.cookie('z_selected_path', treeNode.path, {expires: 7});
            else
                $.cookie('z_selected_path', '', {expires: -1});
            this.$emit('node_click', treeId, treeNode);
        },
        ztree_on_dblclick: function (event, treeId, treeNode) {
            if (treeNode && treeNode.path)
                $.cookie('z_selected_path', treeNode.path, {expires: 7});
            else
                $.cookie('z_selected_path', '', {expires: -1});
            this.$emit("dblclick", treeId, treeNode)
        },
        // crud events
        _on_create: function (treeId, treeNode) {
            var self = this;
            var event_callback = this.$emit('on_pre_create', treeId, treeNode);
            if (!event_callback) return;
            var url = this._concat_url(this.url_prefix, 'create');
            var context = {'parent': treeNode.id};
            var create_fields = this._inspect_fields_value(this.create_fields, context);

            var ajax = {
                url: url,
                params: {
                    'fields': JSON.stringify(create_fields)
                }
            };
            var $modal = this.show_dialog('创建', ajax, function (e) {
                self.set_form_action(url, $modal);
                self._init_ztree_form('create', url, $modal, function (node, res) {
                    self.$ztree.addNodes(treeNode, [node]);
                    treeNode.isParent = true;
                    treeNode.deleteable = false;
                    self.$ztree.selectNode(treeNode)
                    self.$emit('on_create_done', res);
                });
            }, function (e) {
                self._destroy_ztree_form('create');
            });
        },
        _on_update: function (treeId, treeNode) {
            var self = this;
            var event_callback = this.$emit('on_pre_update', treeId, treeNode);
            if (!event_callback) return;
            var url = this._concat_url(this.url_prefix, ['update', treeNode.id.toString()]);
            var ajax = {
                url: url,
                params: {
                    'fields': JSON.stringify(this.update_fields)
                }
            };
            var $modal = this.show_dialog('更新', ajax, function (e) {
                self.set_form_action(url, $modal);
                self._init_ztree_form('update', url, $modal, function (node, res) {
                    treeNode.name = node.name;
                    self.$ztree.updateNode(treeNode);
                    self.$emit('on_update_done', res);
                });
            }, function (e) {
                self._destroy_ztree_form('update');
            });
            return false;
        },
        _on_delete: function (treeId, treeNode) {
            var self = this;
            var event_callback = this.$emit('on_pre_delete', treeId, treeNode);
            if (!event_callback) return;
            var url = this._concat_url(this.url_prefix, ['delete', treeNode.id.toString()]);
            var data = {'csrfmiddlewaretoken': this.csrftoken};
            // data['csrfmiddlewaretoken'] = $("input[name='csrfmiddlewaretoken']",$modal).val()
            if (confirm('确认删除？')) {
                $.post(url, data, function (res) {
                    var res = JSON.parse(res);
                    if (res.error_msg) {
                        alert(res.error_msg)
                    } else {
                        self.$emit('on_delete_done', treeId, treeNode, res);
                        var parent_node = treeNode.getParentNode()
                        self.$ztree.removeNode(treeNode);
                        if (parent_node.children.length == 0) {
                            parent_node.deleteable = true;
                            parent_node.isParent = false;
                        }
                        self.$ztree.selectNode(parent_node)
                        self.$ztree.setting.callback.onClick(null, self.$ztree.setting.treeId, parent_node);
                    }
                })
            }
            return false;
        },
        _init_ztree_form: function (action, form_url, $modal, call_back) {
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
                        data['fields'] = JSON.stringify(self[action + '_fields']);
                        data['buttons'] = JSON.stringify(self.buttons);
                        if (this.$validation.valid && form_url) {
                            $.post(form_url, data, function (res) {
                                if (res)
                                    res = JSON.parse(res);
                                if (res.error_msg) {
                                    alert(res.error_msg);
                                    console.log(res.traceback);
                                } else {
                                    if (call_back)
                                        call_back(res.node, res);
                                    $modal.modal('hide');
                                }
                            });
                        }
                    }
                }
            });
            if (form_app) {
                self.$parent[action + '_form_app'] = form_app;
            }
        },
        _destroy_ztree_form: function (action) {
            delete this.$parent[action + '_form_app'];
        },
        _concat_url: function (url_prefix, sub_urls) {
            // concat url
            var temp_arr = url_prefix.split('/');
            var u_arr = [];
            for (var i = 0; i < temp_arr.length; i++) {
                if (temp_arr[i]) u_arr.push(temp_arr[i]);
            }
            if (sub_urls instanceof Array) {
                u_arr = u_arr.concat(sub_urls);
            } else if (typeof(sub_urls) == "string") {
                u_arr.push(sub_urls);
            }
            return '/' + u_arr.join('/') + '/';
        },
    }
});

Vue.component('vueZtree', vueZtree);