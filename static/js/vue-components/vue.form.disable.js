/*
 vue.js and select2.js component
 属性说明：
 @id,@name：		将id和name属性拷贝到select元素,这样在form表单提交时可以,单向绑定
 @vmodel：		组件value的双向绑定,必须是双向绑定,否则将导致组件的值无法同步到外部
 @readonly：		如果设置为true,组件将为只读状态
 @placeholder：	当数据为空时,组件将在主界面显示提示信息
 @ajax：			ajax异步模式的基础url,根据此参数将产生如下URL
 s2search_url：按照输入关键字查询数据,此查询URL对应的后台函数必须支持按照输入关键字过滤,并且支持分页
 s2read_url：ajax异步模式赋初始值时,需要首先查询数据库获得返回结果后,并将结果设置为select2的静态数据(options['data']),否则将赋值失败
 s2search_url和s2read_url必须拥有公共的URL前缀,且必须名称为/s2search/和/s2read/
 this.s2search_url = ajax_url+'/s2search/';
 this.s2read_url = ajax_url+'/s2read/';
 @name_field：	s2search_url必须指定搜索关键字对应的字段,非必填,默认=name
 @page_size：		s2search_url对应的分页的每页显示数据长度,非必填,默认=7
 @data：			select2静态数据,必须采用动态绑定语法,否则数据将变为字符串
 :data="[
 {'id':'1','text':'value1'},{'id':'2','text':'value2'},{'id':'3','text':'value3'},
 {'id':'4','text':'value4'},{'id':'5','text':'value5'},{'id':'6','text':'value6'}
 ]"

 @示例:
 静态模式
 <vselect2 id="m_book" name="m_book"
 :vmodel.sync="m_book" multiple="multiple"
 :data="[
 {'id':'1','text':'value1'},{'id':'2','text':'value2'},{'id':'3','text':'value3'},
 {'id':'4','text':'value4'},{'id':'5','text':'value5'},{'id':'6','text':'value6'}
 ]"
 v-validate:m_book="{ required:true }">
 ajax异步模式
 <vselect2 id="m_cti" name="m_cti"
 ajax='/cmdb/cti/' multiple="multiple"
 :vmodel.sync="m_cti"
 v-validate:m_cti="{ required:true }"
 v-on:change="m_cti_change"></vselect2>

 */
var vueSelect2 = Vue.extend({
    template: [
        "<select class='form-control'></select>"
    ].join(""),
    props: ['id', 'name', 'vmodel', 'readonly', 'placeholder', 'ajax', 'name_field', 'page_size', 'data'],
    $dom: null,
    // created:function(){
    // 	console.log("created",this.$el,this.view);
    // },beforeCompile
    ready: function () {
        this.$dom = $(this.$el);
        this.$dom.attr('id', this.id).attr('name', this.name);
        this.s2search_url = '';
        this.s2read_url = '';
        if (this.ajax) {
            var temp_arr = this.ajax.split('/');
            var u_arr = [];
            for (var i = 0; i < temp_arr.length; i++) {
                if (temp_arr[i]) u_arr.push(temp_arr[i]);
            }
            ;
            var new_url = u_arr.join('/');
            this.s2search_url = '/' + new_url + '/s2search/';
            this.s2read_url = '/' + new_url + '/s2read/';
        }
        ;
        this._make_options(this.$dom);
    },
    watch: {
        vmodel: function (newValue, oldValue) {
            // model层数据(双向绑定的数据)发生变动

            // 若this.vmodel发生变更,且和当前界面不一致,显示代码赋值
            var cValue = this.$dom.val();
            var equals = this._value_equals(cValue, newValue);
            if (!equals)
                this.$dom.val(newValue).trigger("change");
            // 若this.vmodel新旧值发生变更,则触发本组件change事件
            if (newValue != oldValue) {
                var data = this.$dom.select2('data');
                this.$emit('change', newValue, data);
            }
            ;
        }
    },
    methods: {
        _make_options: function () {
            var self = this;
            var options = {
                language: 'zh-CN',
                // minimumResultsForSearch: 5, // at least 20 results must be displayed
                placeholder: this.placeholder || '请下拉选择',
                allowClear: true,
            };
            // ajax配置获取远程数据
            var ajax_setting = self._get_ajax_setting();
            if (ajax_setting) {
                options['ajax'] = ajax_setting;
                options['escapeMarkup'] = function (markup) {
                    return markup;
                }; // let our custom formatter work
            }
            ;
            if (this.readonly)
                options['disabled'] = true;

            // ajax方式初始化和静态数据初始化
            var _init_select2 = function (_options) {
                self.$dom.select2(options);
                self.$dom.on('change', function (evt) {
                    var cValue = self.$dom.val();
                    var equals = self._value_equals(cValue, self.vmodel);
                    // console.log('select2 change event');
                    if (!equals) {
                        self.vmodel = cValue;
                    }
                    ;
                });
                // view层赋予初始值
                if (self.vmodel) {
                    setTimeout(function () {
                        self.$dom.val(self.vmodel).trigger("change");
                    }, 200);
                }
                ;

            };

            if (this.s2search_url) {
                if (self.vmodel) {
                    this._get_ajax_init_data(self.vmodel, function (data) {
                        if (data) data = JSON.parse(data);
                        options['data'] = data;
                        _init_select2(options);
                    });
                } else {
                    _init_select2(options);
                }
            } else {
                if (this.data) options['data'] = this.data;
                _init_select2(options);
            }
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
                    ;
                    arr_str = new_arr.join(',');
                } else {
                    arr_str = arr.toString();
                }
                return arr_str;
            }
            var v1_str = _toString(v1);
            var v2_str = _toString(v2);

            return v1_str == v2_str;
        },
        _get_ajax_init_data: function (value, callback) {
            /*
             在使用Ajax异步数据时,初始值必须先行查询,获得结果设置为options['data'],否则页面初始化时设置初始值会失败
             根据ID数组查询查询数据,并翻译为select2可以失败的格式
             */
            if (this.s2read_url) {
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
                var page_size = parseInt(this.page_size) || 10;
                ajax_setting = {
                    url: self.s2search_url,
                    delay: 250,
                    data: function (params) {
                        var query = {
                            page_size: page_size,
                            page: params.page,
                            name_field: this.name_field || 'name',
                            term: params.term, // search term
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
    }
});


/*
 vue.js and bootstrap datetime picker component

 属性说明：
 @id,@name：		将id和name属性拷贝到select元素,这样在form表单提交时可以,单向绑定
 @vmodel：		组件value的双向绑定,必须是双向绑定,否则将导致组件的值无法同步到外部
 @format：		format='datetime|date|custom format'
 当format='datatime',时间格式将为YYYY-MM-DD HH:mm:ss
 当format='date',时间格式将为YYYY-MM-DD
 当format未指定,时间格式为YYYY-MM-DD HH:mm:ss
 @readonly：		当readonly=true,则为只读状态

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
var vueDatetimePicker = Vue.extend({
    template: [
        "<div class='input-group date col-md-12'>",
        "<input type='text' class='form-control'/>",
        "<span class='glyphicon glyphicon-calendar form-control-feedback datepickerbutton' style='cursor:pointer;width:auto;'></span>",
        "</div>"
    ].join(""),
    props: ['id', 'name', 'vmodel', 'format', 'readonly'],
    $dom: null,
    // created:function(){
    // 	console.log("created",this.$el,this.view);
    // },beforeCompile
    ready: function () {
        this.$dom = $(this.$el);
        this.$dom.find('input').attr('id', this.id).attr('name', this.name).val(this.vmodel);
        this._make_options(this.$dom);
    },
    watch: {
        vmodel: function (newValue, oldValue) {
            // model层数据(双向绑定的数据)发生变动

            // 若this.vmodel发生变更,且和当前界面不一致,显示代码赋值
            var cValue = this.$dom.find('input').val();
            if (newValue != cValue) {
                this.$dom.find('input').val(newValue);
            }
            ;
            // 若this.vmodel新旧值发生变更,则触发本组件change事件
            if (newValue != oldValue) {
                this.$emit('change', newValue);
            }
            ;
        }
    },
    methods: {
        _make_options: function ($el) {
            var self = this;
            var options = {
                locale: 'zh-cn',
                useCurrent: true,
                ignoreReadonly: true,
                showClear: true,
                // showTodayButton:true,
            };
            // format
            if (this.format) {
                if (this.format == 'date')
                    options['format'] = 'YYYY-MM-DD';
                else if (this.format == 'datetime')
                    options['format'] = 'YYYY-MM-DD HH:mm:ss';
            } else {
                options['format'] = 'YYYY-MM-DD HH:mm:ss';
            }
            // set required html segement

            // init select2
            if (!this.readonly) {
                $el.datetimepicker(options).on('dp.change', function () {
                    var c_date = $el.find('input').val();
                    if (self.vmodel != c_date) {
                        self.vmodel = c_date;
                    }
                    ;
                });
                $el.find('input').attr('readonly', 'readonly');

            }
            $el.find('input').css('background-color', 'white');

        }
    }
});


// 注册所有的组件
Vue.component('vdatetimePicker', vueDatetimePicker);
Vue.component('vselect2', vueSelect2);