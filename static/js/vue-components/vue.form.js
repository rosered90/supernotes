/*
 @author :   wp
 @date   :   2016-08-21
 @desc   :   vue components for form
 @example:
 */

/*
 自定义验证,email
 */
Vue.validator('email', {
    message: function (field) {
        return 'invalid "' + field + '" email format field';
    },
    check: function (val) { // define validator
        return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)
    }
});
Vue.validator('int', {
    message: function (field) {
        return 'invalid "' + field + '" int format field';
    },
    check: function (val) {
        return val ? /^[-+]?[0-9]+$/.test(val) : true;
    }
});
Vue.validator('word', {
    message: function (field) {
        return 'invalid "' + field + '" must be formed by letters numbers and underline';
    },
    check: function (val) {
        return /^\s*$|^\w+$/.test(val);
    }
});
Vue.validator('float', {
    message: function (field) {
        return 'invalid "' + field + '" float format field';
    },
    check: function (val) {
        return val ? /^[-+]?[0-9]+\.[0-9]+$/.test(val) : true;
    }
});
Vue.validator('url', {
    message: function (field) {
        return 'invalid "' + field + '" url format field';
    },
    check: function (val) {
        return /^(http\:\/\/|https\:\/\/)(.{4,})$/.test(val);
    }
});


/*
 vue.js and bootstrap datetime picker directive
 属性说明：
 @format：        format='datetime|date|custom format'
 当format='datatime',时间格式将为YYYY-MM-DD HH:mm:ss
 当format='date',时间格式将为YYYY-MM-DD
 当format未指定,时间格式为YYYY-MM-DD HH:mm:ss
 @readonly：        当readonly=true,则为只读状态

 示例：
 <vdatetime-picker
 id="cdatetime" name="cdatetime"
 :vmodel.sync="cdatetime" v-validate:cdatetime="{ required:true,minlength:8 }"
 v-on:change="datetime_changed">
 </vdatetime-picker>

 <vdatetime-picker
 id="cdate" name="cdate"
 :vmodel.sync="cdate" format='date'
 v-validate:cdate="{ required:true,minlength:8 }">
 </vdatetime-picker>
 */
Vue.directive('datetime-picker', {
    params: ['format', 'readonly'],
    twoWay: true,
    bind: function () {
        // 准备工作
        // 例如，添加事件处理器或只需要运行一次的高耗任务
        var self = this;
        this.$el = $(this.el);

        this._make_options();

        var event_name = this.$el.attr('v-on:change');
        if (event_name) {
            this.on_change = this.vm[event_name];
        }
        this.handler = function () {
            // 将数据写回 vm
            var c_dt = self.$el.val();
            if (c_dt != self.lastValue) {
                if (self.on_change)
                    self.on_change(c_dt);
                self.set(c_dt);
            }
        }.bind(this);

        this.$el.on('dp.change', this.handler);
        // this.el.addEventListener('input', this.handler)
    },
    update: function (newValue, oldValue) {
        // 值更新时的工作
        // 也会以初始值为参数调用一次
        if (this.lastValue != newValue)
            this.lastValue = newValue;

        this.$el.val(newValue);
        // console.log(newValue, oldValue);
    },
    unbind: function () {
        // 清理工作
        // 例如，删除 bind() 添加的事件监听器
        this.$el.parent().off('dp.change', this.handler);
        // this.el.removeEventListener('input', this.handler)
    },
    _make_options: function () {
        var self = this;
        var options = {
            locale: 'zh-cn',
            useCurrent: true,
            ignoreReadonly: true,
            showClear: true
            // showTodayButton:true,
        };
        // format
        if (this.params.format) {
            if (this.params.format == 'date')
                options['format'] = 'YYYY-MM-DD';
            else if (this.params.format == 'datetime')
                options['format'] = 'YYYY-MM-DD HH:mm:ss';
            else if (this.params.format == 'time')
                options['format'] = 'HH:mm:ss';
        } else {
            options['format'] = 'YYYY-MM-DD HH:mm:ss';
        }

        // set required html segement
        // this.$el.wrap("<div class='input-group date col-md-12'></div>");
        this.$el.after("<span class='glyphicon glyphicon-calendar form-control-feedback datepickerbutton' style='cursor:pointer;'></span>");
        // init datetime picker
        if (!this.params.readonly) {
            // console.log(this.$el,this.$el.parent(),$('div.date').parent());
            // this.$el.next().data("DateTimePicker").show()
            this.$el.datetimepicker(options);
            this.$el.next().on('click', function () {
                var $btn = self.$el.next();
                self.$el.data("DateTimePicker").toggle();
                $btn.on('mousedown', false);
            });
            this.$el.off('focus');
            this.$el.attr('readonly', 'readonly');
        }
        this.$el.css('background-color', 'white');
    }
});


/*
 vue.js and select2.js component
 属性说明：
 @readonly：        如果设置为true,组件将为只读状态
 @placeholder：    当数据为空时,组件将在主界面显示提示信息
 @ajax：            ajax异步模式的基础url,根据此参数将产生如下URL
 s2search_url：按照输入关键字查询数据,此查询URL对应的后台函数必须支持按照输入关键字过滤,并且支持分页
 s2read_url：ajax异步模式赋初始值时,需要首先查询数据库获得返回结果后,并将结果设置为select2的静态数据(options['data']),否则将赋值失败
 s2search_url和s2read_url必须拥有公共的URL前缀,且必须名称为/s2search/和/s2read/
 this.s2search_url = ajax_url+'/s2search/';
 this.s2read_url = ajax_url+'/s2read/';
 @name_field：    s2search_url必须指定搜索关键字对应的字段,非必填,默认=name
 @page_size：        s2search_url对应的分页的每页显示数据长度,非必填,默认=7
 @data：            select2静态数据,必须采用动态绑定语法,否则数据将变为字符串
 :data="[
 {'id':'1','text':'value1'},{'id':'2','text':'value2'},{'id':'3','text':'value3'},
 {'id':'4','text':'value4'},{'id':'5','text':'value5'},{'id':'6','text':'value6'}
 ]"
 @filters:       select2过滤器，排除在选项里面的内容
 :filters="{'app_label__in':['auth','admin','sessions','contenttypes']}"
 @示例:
 静态模式
 <select id="book" name="book" v-model="book" v-select2="book"
 class="form-control" style="width:100%"
 v-validate:book="{ required:true }"
 v-on:change="book_changed">
 <option value='1'>value1</option>
 <option value='2'>value2</option>
 <option value='3'>value3</option>
 <option value='4'>value4</option>
 <option value='5'>value5</option>
 <option value='6'>value6</option>
 </select>
 ajax异步模式
 <select id="m_cti" name="m_cti" v-model="m_cti" v-select2="m_cti"
 class="form-control" style="width:100%" multiple="multiple"
 v-validate:m_cti="{ required:true }"
 ajax='/cmdb/cti/' v-on:change="m_cti_changed">
 </select>
 filters过滤器
 <select id="f_exam" name="f_exam" v-model="f_example" v-select2="f_example"
 class="form-control" style="width:100%" multiple="multiple"
 v-validate:f_example="{required:true}"
 ajax='/cmdb/cti/'
 filters="{'app_label__in':['auth','admin','sessions','contenttypes']}"
 </select>
 */
Vue.directive('select2', {
    twoWay: true,
    // priority: 1000,
    params: ['readonly', 'placeholder', 'ajax', 'name_field', 'page_size', 'data', 'filters', 'black_list'],
    paramWatchers: {
        data: function (newVal, oldVal) {
            this.refresh(newVal);
            // console.log('data is change,new %s,old %s',newVal,oldVal);
        },
        ajax: function (newVal, oldVal) {
            this.refresh(newVal);
            //  console.log('ajax is change,new %s,old %s',newVal,oldVal);
        },
        name_field: function (newVal, oldVal) {
            this.refresh(newVal);
            //  console.log('name_field is change,new %s,old %s',newVal,oldVal);
        },
        page_size: function (newVal, oldVal) {
            this.refresh(newVal);
            // console.log('page_size is change,new %s,old %s',newVal,oldVal);
        }
    },
    bind: function () {
        // 准备工作
        // 例如，添加事件处理器或只需要运行一次的高耗任务
        this.$el = $(this.el);
        this.s2search_url = '';
        this.s2read_url = '';
        if (this.params.ajax) {
            var temp_arr = this.params.ajax.split('/');
            var u_arr = [];
            for (var i = 0; i < temp_arr.length; i++) {
                if (temp_arr[i]) u_arr.push(temp_arr[i]);
            }
            var s2search_u_arr = u_arr.concat(['s2search']);
            var s2read_u_arr = u_arr.concat(['s2read']);

            this.s2search_url = '/' + s2search_u_arr.join('/') + '/';
            this.s2read_url = '/' + s2read_u_arr.join('/') + '/';
        }
        this._init_select2();
    },
    update: function (newValue, oldValue) {
        // 值更新时的工作,即通过外部修改modelValue
        // 也会以初始值为参数调用一次
        // console.log('update',newValue, oldValue);
        var self = this;
        if (this.lastValue !== newValue)
            this.lastValue = newValue;
        if (this.s2search_url) {
            this._get_ajax_init_data(newValue, function (data) {
                if (data) data = JSON.parse(data);
                if (data) {
                    var options = self._make_options();
                    options['data'] = data;
                    self.$el.select2(options);
                    self.$el.removeAttr('tabindex');
                    self.$el.val(newValue).trigger('change');
                }
            });
        } else {
            self.$el.val(newValue).trigger('change');
        }
    },
    unbind: function () {
        // 清理工作
        // 例如，删除 bind() 添加的事件监听器
        this.$el.off().select2('destroy')
    },
    refresh: function () {
        this.$el.select2().empty();
        var options = this._make_options();
        this.$el.removeAttr('tabindex');
        // if (data) options['data'] = data;
        this.$el.select2(options);
    },
    _init_select2: function () {
        var self = this;
        var options = self._make_options();
        // ajax方式初始化和静态数据初始化
        self.$el.select2(options);
        self.$el.removeAttr('tabindex');
        var event_name = self.$el.attr('v-on:change');
        if (event_name) {
            this.on_change = this.vm[event_name];
        }
        self.$el.on('change', function () {
            var value = self.$el.val();
            var data = self.$el.select2('data');
            // var is_equal = self._value_equals(self.lastValue,value);
            // console.log(self.lastValue,value);
            // if (!is_equal) {

            // };
            self.set(self.$el.val());
            if (self.on_change) {
                self.on_change(self.$el.val(), data);
            }
        });
    },
    _make_options: function () {
        var self = this;
        var options = {
            language: 'zh-CN',
            // minimumResultsForSearch: 5, // at least 20 results must be displayed
            placeholder: this.params.placeholder || '请下拉选择',
            allowClear: true,
            theme: "bootstrap"
        };
        // ajax配置获取远程数据
        var ajax_setting = self._get_ajax_setting();
        if (ajax_setting) {
            options['ajax'] = ajax_setting;
            options['escapeMarkup'] = function (markup) {
                return markup;
            }; // let our custom formatter work
        }
        if (this.params.readonly)
            options['disabled'] = true;
        if (this.params.data) options['data'] = this.params.data;

        return options;
    },
    _value_equals: function (v1, v2) {
        var _toString = function (arr) {
            var arr_str = '';
            if (!arr) arr = '';
            if (arr instanceof Array) {
                var new_arr = [];
                for (var i = 0; i < arr.length; i++) {
                    var item = arr[i].toString();
                    new_arr.push(item);
                }
                arr_str = new_arr.join(',');
            } else {
                arr_str = arr.toString();
            }
            return arr_str;
        };
        var v1_str = _toString(v1);
        var v2_str = _toString(v2);

        return v1_str === v2_str;
    },
    _get_ajax_init_data: function (value, callback) {
        /*
        在使用Ajax异步数据时,初始值必须先行查询,获得结果设置为options['data'],否则页面初始化时设置初始值会失败
        根据ID数组查询查询数据,并翻译为select2可以失败的格式
        */
        if (this.s2read_url) {
            if (!value) value = [];
            if (!(value instanceof Array)) value = [value];
            $.get(this.s2read_url, {'ids': JSON.stringify(value)}, function (response) {
                //响应成功
                if (response) {
                    callback(response);
                }
            });
        } else {
            callback([]);
        }
    },
    _get_ajax_setting: function () {
        /*
         获取select2 ajax settings
         此段代码基本可以满足大多数情况
         */
        var self = this, ajax_setting = null;
        if (self.s2search_url) {
            var page_size = parseInt(this.params.page_size) || 10;
            ajax_setting = {
                url: self.s2search_url,
                delay: 250,
                data: function (params) {
                    var query = {
                        page_size: page_size,
                        page: params.page,
                        name_field: self.params.name_field || 'name',
                        term: params.term, // search term
                        filters: JSON.stringify(self.params.filters),
                        black_list: JSON.stringify(self.params.black_list)
                    };
                    return query;
                },
                processResults: function (data, params) {
                    // parse the results into the format expected by Select2
                    // since we are using custom formatting functions we do not need to
                    // alter the remote JSON data, except to indicate that infinite
                    // scrolling can be used
                    data = JSON.parse(data);
                    params.page = params.page || 1;
                    // console.log(data);
                    return {
                        results: data.items,
                        pagination: {
                            more: (params.page * page_size) < data.total_count
                        }
                    };
                },
                cache: true
            };
        }
        return ajax_setting;
    }
});

