/**
 * @class   Jframe.Tool
 * 工具函数集合
 * @singleton
 */
Jframe.define('Jframe.Tool', function () {
    'use strict';

    return {
        /**
         * @method
         * 日期格式化
         * @param   {Object/number} date        日期对象或毫秒
         * @param   {string}        [format]    格式化字符串
         * @param   {number}        [range]     返回值根据此参数向前或向后计算日期，以“天”为单位
         *
         * @return  {string}    根据格式化字符串格式化之后的日期
         */
        formatDate: function (date, format, range) {
            var ms, sourceDate = date;
            if (date) {
                date = new Date(date);
                if (isNaN(date - 0)) {
                    ms = Number(sourceDate);
                    if (!isNaN(ms)) {
                        date = new Date(ms);
                    } else {
                        date = new Date();
                    }
                }
            } else if (typeof date === 'undefined' || date === null) {
                return '-';
            } else {
                date = new Date();
            }
            // 数据容错
            if (typeof format === 'number') {
                range = format;
                format = null;
            }
            format = format || 'YYYY/MM/DD hh:mm:ss';
            if (typeof range === 'number') {
                date = new Date(date - 0 + (range * 24 * 60 * 60 * 1000));
            }
            // 补充0
            function prefixZero(num) {
                if (num < 10) {
                    return 0 + num;
                }
                return num;
            }

            var year = date.getFullYear() + '', month = date.getMonth() + 1 + '', day = date.getDate() + '', hours = date.getHours() + '', minutes = date.getMinutes() + '', seconds = date.getSeconds() + '', pY = /Y+/.exec(format), // 匹配年份
                pM = /M+/.exec(format), // 匹配月份
                pD = /D+/.exec(format), // 匹配日期
                ph = /h+/.exec(format), // 匹配小时
                pm = /m+/.exec(format), // 匹配分钟
                ps = /s+/.exec(format); // 匹配秒
            // 年份替换
            if (pY) {
                if (pY[0].length === 2) {
                    year = year.slice(2);
                }
                format = format.replace(pY[0], year);
            }
            // 月份替换
            if (pM) {
                if (pM[0].length === 2) {
                    month = prefixZero(month);
                }
                format = format.replace(pM[0], month);
            }
            // 日期替换
            if (pD) {
                if (pD[0].length === 2) {
                    day = prefixZero(day);
                }
                format = format.replace(pD[0], day);
            }
            // 小时替换
            if (ph) {
                if (ph[0].length === 2) {
                    hours = prefixZero(hours);
                }
                format = format.replace(ph[0], hours);
            }
            // 分钟替换
            if (pm) {
                if (pm[0].length === 2) {
                    minutes = prefixZero(minutes);
                }
                format = format.replace(pm[0], minutes);
            }
            // 秒数替换
            if (ps) {
                if (ps[0].length === 2) {
                    seconds = prefixZero(seconds);
                }
                format = format.replace(ps[0], seconds);
            }
            return format;
        },
        /**
         * @method
         * 获取目标元素光标位置
         * @param   {HTMLElement}   area    要获取光标位置的元素
         *
         * @return  {number}    [return='0']    光标位置，默认为0
         */
        getAreaCursorPos: function (area) {
            var pos = 0;
            // ie
            if (document.selection) {
                area.focus();
                var sel = document.selection.createRange();
                sel.moveStart('character', -area.value.length);
                pos = sel.text.length;
                // standard browsers
            } else if (area.selectionStart || area.selectionStart == '0') {
                pos = area.selectionStart;
            }
            return parseInt(pos);
        },
        /**
         * @method
         * 设置目标元素光标位置
         *
         * @param   {HTMLElement}   area    设置光标位置的元素
         * @param   {Number}        pos     设置的光标位置
         */
        setAreaCursorPos: function (area, pos) {
            // 容错，默认值为0
            pos = parseInt(pos) || 0;
            var range;
            // ie
            if (area.setSelectionRange) {
                area.focus();
                area.setSelectionRange(pos, pos);
                // standard browsers
            } else if (area.createTextRange) {
                range = document.createRange();
                range.collapse(true);
                range.setStart(area, pos);
                range.setEnd(area, pos);
                range.select();
            }
        },
        /**
         * @method
         * 判断字符串小数点后面的长度
         */
        getDotLen: function (val) {
            var p = (val + '').split('.')[1];
            return p ? p.length : 0;
        },
        /**
         * @method
         * 将指定的值转化为符合条件的字符
         * @author  lixiaochen
         * @param   {string}    val                 需要转换的值
         * @param   {string/
         *			 Object}    [rule]              转换条件，条件中应包含“\_VAL\_”以做替换
         * @param   {string}    [rule.rule]         如果为对象，此参数则为转换条件对应参数
         * @param   {string}    [rule.rate]         如果为对象，此参数则为转换倍数对应参数
         * @param   {boolean}   [rule.isComma=true] 是否为千分位
         * @param   {number}    [rate]              转换倍数。传递该值，则会对 val 乘以相应倍数后再进行计算
         * @return  {string}    转换后的值
         */
        getValueByRule: function (val, rule, rate) {
            var formatRule = '#,##0', fixedRule, result,
                o = {
                    rule: null,
                    rate: null,

                    isComma: true
                };
            // 数据验证
            if (val === null || typeof val === 'undefined') {
                return '-';
            }
            // 参数容错
            if (typeof rule === 'object') {
                $.extend(o, rule);
            } else {
                o.rule = rule;
                o.rate = rate;
            }
            // 去除千分位格式
            if (!o.isComma) {
                formatRule = '0';
            }
            // 如果有比率参数，则乘其比率
            if (o.rate) {
                o.rate = parseFloat(o.rate);
                if (!isNaN(o.rate)) {
                    val = val * o.rate;
                }
            }


            // 验证过滤小数规则
            if (o.rule && typeof o.rule === 'string') {
                // 过滤小数规则
                fixedRule = o.rule.match(/_VAL_(\.[#0]+)?/);

                if (fixedRule && fixedRule[1]) {
                    fixedRule = fixedRule[1];
                }

                // 如果有小数位，则修正千分位规则
                if (fixedRule) {
                    formatRule = formatRule + '.' + fixedRule;
                }
            }
            // 以千分位形式格式化指定值
            result = $.formatNumber(val, {
                format: formatRule
            });


            // 将计算出的值修正为指定格式
            if (o.rule && typeof o.rule === 'string' && o.rule.indexOf('_VAL_') > -1) {
                result = o.rule.replace(/_VAL_(\.[#0]+)?/g, result);
            }
            return result;
        },
        /**
         * @method
         * 验证网址
         * @param   {string}    str                 域名
         * @param   {boolean}   [hasHttp=true]      URL验证是否匹配HTTP协议头，默认为包含HTTP协议头
         * @param   {boolean}   [hasParam=true]     URL验证是否包含参数、二级目录等，默认为包含。如果该值为 false ，则只完全匹配主域名
         * return   {boolean}   URL是否为可用的域名
         */
        domainValidate: function (str, hasHttp, hasParam, isPort) {
            // 默认值设置
            hasHttp = typeof hasHttp === 'undefined' ? true : hasHttp;
            hasParam = typeof hasParam === 'undefined' ? true : hasParam;
            var str_pattern = '(((\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5]))|(([\\w\\d]+(-+[\\w\\d]+)*\\.)+(com|net|org|hk|cn|com.cn|com.au|net.cn|org.cn|gov.cn|biz|info|cc|tv|mobi|name|asia|tw|sh|ac|io|tm|travel|ws|us|sc|mn|ag|vc|la|bz|in|cm|co|tel|me|pro|com.hk|com.tw|pw)))',
                basePattern = str_pattern + '(:\\d+)?';
            if (isPort) {
                basePattern = str_pattern + '?';
            }
            // 是否匹配HTTP协议头
            if (hasHttp) {
                basePattern = '((http|https):\/\/)?' + basePattern;
            }
            // 是否验证完整匹配验证主域名
            if (hasParam) {
                basePattern = basePattern + '(\\/[^\\s]*)*';
            } else {
                basePattern = basePattern + '\\/?';
            }
            var pattern = new RegExp('^' + basePattern + '$');
            return pattern.test($.trim(str));
        },
        /**
         * @method
         * 严格验证域名
         * @param        {string}            str                  域名
         */
        domainUrlValidate: function (str) {
            var str = $.trim(str);
            if (str.match(/:\/\//g) && str.match(/:\/\//g).length > 1) {
                return false;
            }
            return Jframe.Tool.domainValidate(str, true, false);
        },
        /**
         * @method
         * 验证email
         * @param        {string}            str                邮件
         * * 调用方式 Jframe.Tool.emailValidate(str);
         */
        emailValidate: function (str) {
            str = $.trim(str);
            var re = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            return re.test(str);
        },
        /** 获取文本的长度
         * @param        {string}                str
         * 计算文本的长度
         * returns 返回文本的长度
         */
        getTextLen: function (str, isWildcards) {
            var strVal = str || '';
            strVal = strVal.replace(/[^\x00-\xff]/g, 'xx');
            if (isWildcards) {
                strVal = strVal.replace(/{(.*?)}/g, '$1');
                strVal = strVal.replace(/\^/g, '');
            }
            return strVal.length
        },
        /**
         * @method
         * 截取字符串的长度
         * @param        {string}        str 要截取的字符串
         * @param        {Number}        len 截取的长度
         * returns 返回截取后的文本
         */
        cutstr: function (str, len) {
            var str_length = 0, str_len = 0, str_cut = new String(), a;
            str_len = str.length;
            for (var i = 0; i < str_len; i++) {
                a = str.charAt(i);
                str_length++;
                if (escape(a).length > 4) {
                    //中文字符的长度经编码之后大于4
                    str_length++;
                }
                str_cut = str_cut.concat(a);
                if (str_length >= len) {
                    //str_cut = str_cut.concat("...");
                    if (str_length > len) {
                        str_cut = str_cut.substring(0, str_cut.length - 1);
                    }
                    return str_cut;
                }
            }
            //如果给定字符串小于指定长度，则返回源字符串；
            if (str_length < len) {
                return str;
            }
        },
        /**
         * @method
         * 获取页面的ajax方法
         * #调用方式 Jframe.Tool.ajaxGetPage
         * @param {Object}      obj                 ajax参数对象
         * @param {Object}      obj.url             url地址
         * @param {Object}      [obj.callback]      成功的回调函数
         * @param {string}      id                  插入页面的id
         */
        ajaxGetPage: function (obj, id) {
            //$('#overallLoading').show();
            Jframe.ajax({
                url: obj.url,
                type: 'GET',
                webType: 'root',
                dataType: 'html',
                success: function (data) {
                    //$('#overallLoading').hide();
                    if (data) {
                        $('#' + id).html(data);
                    }
                    if (typeof obj.callback == 'function') {
                        obj.callback(data);
                    }
                },
                error: function () {
                }
            }, false);
        },
        /**
         * @property    {Object}            toggleToolkit
         * 显示/隐藏目标元素的通用工具方法
         * @property    {'toggle_opened'}   toggleToolkit.showClass
         * 目标元素显示时对触发元素添加的标示类
         * @property    {'toggle_closed'}   toggleToolkit.hideClass
         * 目标元素隐藏时对触发元素添加的标示类
         * @property    {Function}          toggleToolkit.showTarget
         * 展现目标对应方法
         * @property    {Function}          toggleToolkit.hideTarget
         * 隐藏目标对应方法
         */
        toggleToolkit: {
            showClass: 'toggle_opened',
            hideClass: 'toggle_closed',
            // 目标展现
            showTarget: function (from, tar, o) {
                if (!from || !tar) {
                    return;
                }
                o = o || {};
                var toggleToolkit = Jframe.Tool.toggleToolkit, tarPos = tar.pos;
                if (typeof o.beforeTrigger === 'function') {
                    o.beforeTrigger(from, tar, 'show');
                }
                from.addClass(o.cls);
                tar.removeClass(toggleToolkit.hideClass).addClass(toggleToolkit.showClass).show();
                if (typeof o.callback === 'function') {
                    o.callback(from, tar, 'show');
                }
                if (typeof o.onshow === 'function') {
                    o.onshow(from, tar);
                }
            },
            // 目标隐藏
            hideTarget: function (from, tar, o) {
                if (!from || !tar) {
                    return;
                }
                o = o || {};
                var toggleToolkit = Jframe.Tool.toggleToolkit;
                if (typeof o.beforeTrigger === 'function') {
                    o.beforeTrigger(from, tar, 'hide');
                }
                from.removeClass(o.cls);
                tar.removeClass(toggleToolkit.showClass).addClass(toggleToolkit.hideClass).hide();
                if (typeof o.callback === 'function') {
                    o.callback(from, tar, 'hide');
                }
                if (typeof o.onhide === 'function') {
                    o.onhide(from, tar);
                }
            }
        },
        /**
         * @method
         * 持续性的对目标选择符匹配的元素绑定弹窗事件（类似于通过老版本jQuery提供的live方法绑定）
         *
         * 如希望在点击目标元素自动隐藏的基础上，使目标元素的个别节点作为特例，
         * 点击不隐藏其面板，请在该节点上加入 preventautohide="true" 属性
         *
         * __如果是在单个模块调用的这个方法，请在该模块注销的时候，执行
         * {@link Jframe.Tool#destroyLiveToggleTarget destroyLiveToggleTarget} 方法以便清除绑定的一系列事件__
         * @param   {Object}    options                         配置选项
         * @param   {string}    options.selector                绑定事件需要匹配的选择符，格式为jQuery支持的选择符格式
         * @param   {Function}  options.target                  通过该函数获取需要显示/隐藏的目标元素
         * @param   {Function}  options.target.ele              匹配到selector的当前元素
         * @param   {Object}    options.target.return           需要显示/隐藏的目标元素
         * @param   {string}    [options.cls='opened']          目标元素显示时，对触发元素附加的标示类
         * @param   {boolean}   [options.autoHide=true]         当点击页面其他位置时，目标元素是否可以自动隐藏
         * @param   {boolean}   [options.stopPropagation=true]  目标元素点击后是否阻止其做自动隐藏操作（类似于阻止冒泡）
         *
         * @param   {Function}  [options.beforeTrigger]         引用元素事件触发之前的回调函数
         * @param   {Object}    [options.beforeTrigger.from]    调用元素
         * @param   {Object}    [options.beforeTrigger.target]  目标元素
         * @param   {'show'/
         *           'hide'}    [options.beforeTrigger.status]  即将发生的动作是显示还是隐藏
         *
         * @param   {Function}  [options.callback]              引用元素事件触发之后的回调函数。
         * @param   {Object}    [options.callback.from]         调用元素
         * @param   {Object}    [options.callback.target]       目标元素
         * @param   {'show'/
         *           'hide'}    [options.callback.status]       即将发生的动作是显示还是隐藏
         *
         * @param   {Function}  [options.onshow]                目标元素显示后触发的回调函数
         * @param   {Object}    [options.onshow.from]           调用元素
         * @param   {Object}    [options.onshow.target]         目标元素
         *
         * @param   {Function}  [options.onhide]                目标元素隐藏后触发的回调函数
         * @param   {Object}    [options.onhide.from]           调用元素
         * @param   {Object}    [options.onhide.target]         目标元素
         */
        liveToggleTarget: function (options) {
            // 默认设置
            var o = {
                selector: '',
                target: null,
                cls: 'opened',
                autoHide: true,
                stopPropagation: true,
                beforeTrigger: null,
                callback: null,
                onshow: null,
                onhide: null
            };
            // 载入用户设置
            $.extend(o, options);
            // 数据验证
            if (typeof o.selector !== 'string') {
                throw new Error('selector 属性必须为字符串格式！');
            }
            if (o.selector === '') {
                throw new Error('selector 不可为空！');
            }
            if (typeof o.target !== 'function') {
                throw new Error('target 必须为包含返回值的函数！');
            }
            if (!Jframe.Global.liveToggleInfo) {
                Jframe.Global.liveToggleInfo = {};
                Jframe.Global.liveToggleIdx = 0;
            }
            // 移除已经绑定过的leveToggleTarget，避免重复绑定
            Jframe.Tool.destroyLiveToggleTarget({
                selector: o.selector
            });
            var idx = Jframe.Global.liveToggleIdx;
            // 将绑定的信息记录到全局信息
            Jframe.Global.liveToggleInfo[idx] = {
                key: idx,
                selector: o.selector,
                showFn: function (e) {
                    e.preventDefault();
                    var ele = $(this), toggleToolkit = Jframe.Tool.toggleToolkit, target = ele.data('toggleTarget');
                    if (!target) {
                        target = o.target(ele);
                        // 保存状态
                        target.attr('istoggletarget', true);
                        // 缓存对象
                        ele.data('toggleTarget', target);
                    }
                    // 判断打开状态
                    // 已经展开则隐藏，已经隐藏则展开
                    if (ele.hasClass(toggleToolkit.showClass)) {
                        toggleToolkit.hideTarget(ele, target, o);
                    } else {
                        toggleToolkit.showTarget(ele, target, o);
                    }
                }
            }
            // 绑定document的点击事件
            // 如果目标元素为匹配o.selector，则执行回调函数
            // 类似于之前的live
            $(document).on('click', o.selector, Jframe.Global.liveToggleInfo[idx].showFn);
            // 点击document区域是否自动隐藏对应模块
            if (o.autoHide) {
                // 记录缓存隐藏事件
                Jframe.Global.liveToggleInfo[idx].hideFn = function (e) {
                    var source = $(e.target), realEle;
                    // 是否可以匹配selector
                    // 是否是需要隐藏/显示的目标元素
                    if ((o.selector.indexOf('.') === 0 && source.hasClass(o.selector)) || (o.selector.indexOf('#') === 0 && source[0].id === o.selector) || source[0].tagName.toLowerCase() === o.selector.toLowerCase()) {
                        realEle = source;
                    } else {
                        // 查找其是否包含在拥有selector标示符的元素中
                        realEle = source.closest(o.selector);
                    }
                    if ((!realEle || realEle.length === 0) && o.stopPropagation) {
                        // 查找当前元素是否为需要隐藏/显示的目标元素
                        if (source.attr('istoggletarget')) {
                            realEle = source;
                        } else {
                            // 查找是否包含在需要隐藏/显示的目标元素中
                            realEle = source.closest('[istoggletarget]');
                        }
                    }
                    // 对除当前元素之外的元素做隐藏操作
                    $(o.selector).not(realEle).each(function (idx, ele) {
                        ele = $(ele);
                        var target = ele.data('toggleTarget');
                        if (target && realEle && target[0] === realEle[0]) {
                            return;
                        }
                        if (ele.attr('preventautohide')) {
                            return;
                        }
                        Jframe.Tool.toggleToolkit.hideTarget(ele, target);
                    });
                }
                // 自动隐藏
                $(document).on('click', Jframe.Global.liveToggleInfo[idx].hideFn);
                // 递增索引
                Jframe.Global.liveToggleIdx = idx + 1;
            }
        },
        /**
         * @method
         * 注销由 __{@link Jframe.Tool#liveToggleTarget liveToggleTarget}__ 绑定的一系列事件与全局信息
         * @param   {Object}    options             配置选项
         * @param   {string}    options.selector    匹配的选择符，格式为jQuery支持的选择符格式
         */
        destroyLiveToggleTarget: function (options) {
            // 默认设置
            var o = {
                selector: ''
            };
            // 载入用户设置
            $.extend(o, options);
            // 比如配置选择器
            if (!o.selector) {
                return;
            }
            // 查找已经绑定过的liveToggleTarget
            var liveInfo = _.find(Jframe.Global.liveToggleInfo, function (info) {
                return info.selector === o.selector;
            });
            if (liveInfo) {
                // 移除目标选择区的click事件
                $(document).off('click', o.selector, liveInfo.showFn);
                // 绑定的元素是否配置了可自动隐藏的参数
                if (liveInfo.hideFn) {
                    $(document).off('click', liveInfo.hideFn);
                }
                delete Jframe.Global.liveToggleInfo[liveInfo.key];
            }
        },
        /**
         * @method
         * 通过设置过去或者未来N天，获取开始时间和结束时间
         * @param    {string}    [arg]                   过去或者未来N天，支持["curWeek","lastWeek","curMonth","lastMonth"]
         * @param    {string}    [format]                日期格式
         * @param    {Number}    [fromDate]              过去几天，从当天N天前算起
         *
         * @return   {Object}    返回日期对象
         * @return   {string}    return.fromTime               开始时间
         * @return   {string}    return.toTime                 结束时间
         * @return   {Date}      return.fromDateFormat         开始时间
         * @return   {Date}      return.toDateFormat           结束时间
         */
        getDistanceDate: function (arg, format, fromDate) {
            'use strict';
            var basicDate = fromDate;
            var that = Jframe.Tool;
            var todayDate = new Date();
            var day = todayDate.getDay() || 7;
            var curMonth = todayDate.getMonth() + 1;
            var curDate = todayDate.getDate();
            var fromTime = "";
            var toTime = "";
            var o = {};
            if (typeof arg == "number") {
                fromTime = new Date(todayDate.getTime() + arg * 24 * 60 * 60 * 1000);
                toTime = new Date(todayDate.getTime() - 1 * 24 * 60 * 60 * 1000);
                // 今天的开始结束时间一样
                if (arg == 0 || arg == -2) {
                    toTime = fromTime;
                }
                if (basicDate && arg != 0 && arg != -2) {
                    fromTime = new Date(fromTime.getTime() + basicDate * 24 * 60 * 60 * 1000);
                    toTime = new Date(toTime.getTime() + basicDate * 24 * 60 * 60 * 1000);
                }
            }
            if (typeof arg == "string") {
                switch (arg) {
                    case "lastWeek":
                        toTime = new Date(todayDate.getTime() - day * 24 * 60 * 60 * 1000);
                        fromTime = new Date(todayDate.getTime() - (day + 6) * 24 * 60 * 60 * 1000);
                        if (basicDate && basicDate < 0) {
                            if (day + basicDate <= 0) {
                                basicDate = day + basicDate - 1;
                                toTime = new Date(toTime.getTime() + basicDate * 24 * 60 * 60 * 1000);
                            }
                        }
                        break;
                    case "curWeek":
                        if (day === 1) {
                            fromTime = todayDate;
                            toTime = todayDate;
                        } else {
                            fromTime = new Date(todayDate.getTime() - (day - 1) * 24 * 60 * 60 * 1000);
                            toTime = todayDate;
                            if (basicDate && basicDate < 0) {
                                if ((day + basicDate - 1) <= 0) {
                                    toTime = fromTime;
                                } else {
                                    basicDate = basicDate - 1;
                                    toTime = new Date(toTime.getTime() + basicDate * 24 * 60 * 60 * 1000);
                                }
                            } else {
                                toTime = new Date(toTime.getTime() - 24 * 60 * 60 * 1000);
                            }
                        }
                        break;
                    case "lastMonth":
                        var lastMonthDate = todayDate;
                        var curDate = lastMonthDate.getDate();
                        lastMonthDate.setDate(1);
                        lastMonthDate = new Date(lastMonthDate.getTime() - 24 * 60 * 60 * 1000);
                        fromTime = new Date(lastMonthDate.getTime());
                        fromTime.setDate(1);
                        toTime = lastMonthDate;
                        if (basicDate && basicDate < 0) {
                            if ((curDate + basicDate) <= 0) {
                                basicDate = curDate + basicDate - 1;
                                toTime = new Date(toTime.getTime() + basicDate * 24 * 60 * 60 * 1000);
                            }
                        }
                        break;
                    case "curMonth":
                        if (todayDate.getDate() === 1) {
                            fromTime = todayDate;
                            toTime = todayDate;
                        } else {
                            var fromDate = new Date();
                            var toDate = new Date();
                            fromDate.setDate(1);
                            fromTime = fromDate;
                            toTime = toDate;
                            if (basicDate && basicDate < 0) {
                                // 如果本月日期 <= N天推算日期
                                if ((curDate + basicDate - 1) <= 0) {
                                    toTime = fromTime;
                                } else {
                                    // 本月日期 > N天推算日期
                                    basicDate = basicDate - 1;
                                    toTime = new Date(toTime.getTime() + basicDate * 24 * 60 * 60 * 1000);
                                }
                            } else {
                                toTime = new Date(toTime.getTime() - 24 * 60 * 60 * 1000);
                            }
                        }
                        break;
                }
            }
            if (typeof arg == "object") {
                var startDate = arg[0].split("/");
                var entDate = arg[1].split("/");
                var startTime = new Date();
                var endTime = new Date();
                startTime.setYear(Number(startDate[0]));
                startTime.setMonth(Number(startDate[1]) - 1);
                startTime.setDate(Number(startDate[2]));
                endTime.setYear(Number(entDate[0]));
                endTime.setMonth(Number(entDate[1]) - 1);
                endTime.setDate(Number(entDate[2]));
                fromTime = startTime;
                toTime = endTime;
            }
            fromTime.setHours(0);
            fromTime.setMinutes(0);
            fromTime.setSeconds(0);
            toTime.setHours(0);
            toTime.setMinutes(0);
            toTime.setSeconds(0);
            o.fromTime = that.formatDate(fromTime, format);
            o.toTime = that.formatDate(toTime, format);
            o.fromDateFormat = fromTime;
            o.toDateFormat = toTime;
            return o;
        },
        /**
         * @method
         * 设置颜色值
         * @method  {number}    colorIdx    颜色值的索引 rgb(174,199,232)
         */
        getColor: function (colorIdx) {
            var colorList = ["rgb(31,119,180)", "rgb(174,199,232)", "rgb(255,127,14)", "rgb(255,187,120)", "rgb(44,160,44)", "rgb(152,223,138)", "rgb(214,39,40)", "rgb(255,152,150)", "rgb(148,103,189)", "rgb(197,176,213)", "rgb(140,86,75)", "rgb(196,156,148)", "rgb(227,119,194)", "rgb(247,182,210)", "rgb(127,127,127)", "rgb(199,199,199)", "rgb(188,189,34)", "rgb(219,219,141)", "rgb(23,190,207)", "rgb(158,218,229)"];
            colorIdx = typeof colorIdx === 'undefined' ? 0 : colorIdx;
            colorIdx = colorIdx % 20;
            // 颜色索引修正
            if (colorIdx > 9) {
                colorIdx = colorIdx - (19 - colorIdx);
            } else {
                colorIdx = colorIdx * 2;
            }
            return colorList[colorIdx];
        },
        /**
         * @method
         * 校验ajax返回数据是否有error
         * @param       {Object}      json
         * ajax返回json
         * returns '' 表示没有报错信息 !='' 表示error错误信息
         */
        getDataErrorMsg: function (json) {
            var error_message, error_code, returnMsg;
            if (json && json.error) {
                error_message = json.error.message;
                error_code = json.error.code;
                if (error_message || error_code) {
                    return (error_message ? error_message : '') + ' ' + (error_code != 'UNKNOWN' ? error_code : '');
                }
                return '';
            }
            return '';
        },
        /**
         * @method
         * 分页方法
         * Jframe.Tool.dataPage
         * @param           {Object}                options                         参数
         * @param           {Object}                options.paging                  paging相关信息
         * @param           {Function}              options.currentPageEle          当前页元素
         * @param           {Function}              options.totalPageEle            总页数元素
         * @param           {Function}              options.prevEle                 上一页元素
         * @param           {Function}              options.nextEle                 下一页元素
         * @param           {Object}                options.params                  回调函数参数,params.currentPage参数,回调函数需要支持params.currentPage
         */
        dataPage: function (options) {
            var paging = options.paging, //总页码对象
                currentPage = paging.currentPage, //当前页
                totalPages = paging.totalPages, //总页数
                currentPageEle = options.currentPageEle, //当前页元素
                totalPageEle = options.totalPageEle, //总页数元素
                prevEle = options.prevEle, //上一页元素
                nextEle = options.nextEle, //下一页元素
                params = options.params; //请求参数
            if (!paging.totalPages) {
                return;
            }
            if (currentPage == 1) {
                prevEle.addClass("prev_disabled");
            } else {
                prevEle.removeClass("prev_disabled");
            }
            if (currentPage == totalPages) {
                nextEle.addClass("next_disabled");
            } else {
                nextEle.removeClass("next_disabled");
            }
            //总页数
            totalPageEle.text(totalPages);
            //当前页
            currentPageEle.text(currentPage);
            //绑定
            //上一页
            prevEle.off('click').on('click', function () {
                if (currentPage == 1) {
                    return false;
                }
                var pageNum = parseInt(currentPage) - 1;
                params.currentPage = pageNum;
                options.callback(params);
            });
            //下一页
            nextEle.off('click').on('click', function () {
                if (currentPage == totalPages) {
                    return false;
                }
                ;
                var pageNum = currentPage + 1;
                params.currentPage = pageNum;
                options.callback(params);
            });
        },
        /**
         * @method  传入毫秒获取几分几秒（比如：26分35秒）
         * @param    {min}        Number        毫秒
         */
        getSecondsMin: function (min) {
            // 如果类型时日期格式，进行格式化
            var time = parseInt(min);
            var hour = 0, minutes = 0, day = 0;
            var seconds = Math.floor(parseInt(time) / 1000);
            if (seconds >= 60) {
                minutes = Math.floor(seconds / 60);
                seconds = seconds % 60;
                if (minutes >= 60) {
                    hour = Math.floor(minutes / 60);
                    minutes = minutes % 60;

                }
                if (hour >= 24) {
                    day = Math.floor(hour / 24);
                    hour = hour % 24;
                }
            }
            var temp = (day != 0 ? (day + '天') : "") + (hour != 0 ? (hour + '时') : "") + (minutes != 0 ? (minutes + '分') : "") + (seconds != 0 ? seconds + '秒' : 0 + '秒');
            return temp;
        },
        /**
         * @method  获取表单值
         * @param    {HTMLElement}        obj        Jquery对象，form表单
         */
        getFormValue: function (obj) {
            var formEl = obj[0].querySelectorAll('input,textarea,select'), elements = $(obj[0].elements).filter(function () {
                var type = $(this).attr('type');
                if (type == 'checkbox' || type == 'radio') {
                    if ($(this).prop('checked')) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            }), that = this, filterKey = '', checkValArray = [], checkObj = {};
            // 获取表单选中的键值对
            _.each(elements, function (ele, index) {
                var o = {};
                var name = ele.name;
                var value = ele.value;
                o.value = value;
                o.el = ele;
                o.key = name;
                if (name) {
                    checkValArray.push(o);
                }
            })
            filterKey = _.groupBy(checkValArray, function (v) {
                return v.key;
            });
            checkObj = $.extend({}, filterKey, true);
            // 多项选择值拼接
            _.each(filterKey, function (v, key) {
                var keyArry = [];
                _.each(v, function (obj) {
                    keyArry.push(obj.value);
                })
                filterKey[key] = keyArry;
            });
            // 存储当前搜索条件
            return {
                checkObj: checkObj,
                filterKey: filterKey
            };
        },
        /**
         * @method  获取字符串宽度
         * @author  王甜爽
         * @param    {string}       str   字符串
         * @param    {number}        size  字符的font-size值
         *
         * @return   {number}        宽度
         */
        getTextWidth: function (str, size) {
            var len = 0, strItem = '', size = size || 12, step = Math.ceil(size / 2);
            for (var i = 0; i < str.length; i++) {
                strItem = str.charAt(i);
                len += Jframe.Tool.getTextLen(strItem);
            }
            return len * step + step * 2;
        },
        /**
         * @method   截取字符串，超出的部分用‘...’代替
         * @author   王甜爽
         * @param    {string}       str   字符串
         * @param    {number}        size  截取字符的长度，中文站2个字节，英文1个字节
         *
         * @return   {string}        字符串
         *
         */
        clipStr: function (str, len) {
            var item = Jframe.Tool.cutstr(str, len);
            if (Jframe.Tool.getTextLen(str) <= len) {
                return item;
            } else {
                return item + '...';
            }
        },
        /**
         * @method  列表分页
         * @param   {Object}        options                     分页配置选项
         * @param   {HTMLElement}   options.placement           分页元素要添加到的位置，可以为多个元素，会each这个JQ对象
         * @param   {number}        options.total               数据总条数
         * @param   {Function}      options.onTurnPage          翻页时回调函数
         * @param   {number}        [options.size=10]           每页显示条数。默认为10条
         * @param   {number}        [options.neighborLimit=10]  当前页左右显示的页码数量，如果该值不为0，则对超出部分以省略号表示。
         * @param   {boolean}       [options.hideOnSingle=true] 当只有一页时是否显示分页。默认不显示
         * @param   {Function}      [options.onSinglePage]      当只有一页时回调函数
         * @param   {Function}      [options.onMultiplePage]    当有多个分页时回调函数
         * @param   {number}        [options.initPage=0]        初始化时的所跳转至的页码
         */
        pagingList: function (options) {
            // 默认设置
            var o = {
                size: 10,
                neighborLimit: 2,
                hideOnSingle: true,
                initPage: 0
            };
            // 导入用户设置
            $.extend(o, options);
            // 获取分页相关信息
            var totalPages = Math.ceil(o.total / o.size), tplPageList = Jframe.template($('#tplPagingList').html()), limit = o.neighborLimit, currentPage, i;
            // 修正初始页码
            o.initPage = o.initPage > totalPages - 1 ? 0 : o.initPage;
            // 根据配置回调分页函数
            if (totalPages <= 1) {
                // 当只有一页时回调函数
                if (typeof o.onSinglePage === 'function') {
                    o.onSinglePage({
                        placement: o.placement
                    });
                }
            } else {
                // 当有多个分页时回调函数
                if (typeof o.onMultiplePage === 'function') {
                    o.onMultiplePage({
                        placement: o.placement
                    });
                }
            }
            // 跳转至指定页面并重绘其分页结构
            // @param   {number}    idx     翻页页码
            function setNavLink(idx) {
                if (idx === currentPage) {
                    return;
                }
                var turnParams = {
                    // 当前页码
                    curPage: idx,
                    // 上一个页码
                    prevPage: currentPage,
                    // 总页码
                    totalPages: totalPages,
                    // 每页显示条数
                    size: o.size,
                    // 当前页码显示条数的开始索引
                    fromIdx: idx * o.size,
                    // 当前页码显示条数的结束索引
                    toIdx: Math.min((idx + 1) * o.size - 1, o.total - 1)
                };
                if (typeof currentPage !== 'undefined') {
                    // 上一个页码显示条数的开始索引
                    turnParams.prevFromIdx = currentPage * o.size;
                    // 上一个页码显示条数的结束索引
                    turnParams.prevToIdx = Math.min((currentPage + 1) * o.size - 1, o.total - 1);
                }
                // 翻页回调
                o.onTurnPage(turnParams);
                // 根据配置当只有一页时不显示分页
                if (totalPages <= 1 && o.hideOnSingle) {
                    return;
                }
                // 页码修正
                if (idx >= totalPages) {
                    idx = 0;
                }
                var navHtml = '', isFirst = true, isLast = true, firstHtml, prevHtml, nextHtml, lastHtml, i;
                // 生成非第一页与最后一页的标签
                for (i = 1; i < totalPages - 1; i++) {
                    if (idx === i) {
                        navHtml += '<span pagemark="' + i + '" class="current_page">' + (i + 1) + '</span>';
                        continue;
                    }
                    if (limit === 0 || (i >= idx - limit && i <= idx + limit)) {
                        navHtml += '<a href="javascript:;" pagemark="' + i + '" class="nav_link">' + (i + 1) + '</a>';
                    } else if (i === idx - limit - 1 || i === idx + limit + 1) {
                        navHtml += '<span class="page_folded">...</span>';
                    }
                }
                // 第一页标签生成
                if (idx !== 0) {
                    navHtml = '<a href="javascript:;" pagemark="0" class="nav_link">1</a>' + navHtml;
                    isFirst = false;
                } else {
                    navHtml = '<span pagemark="0" class="current_page">1</span>' + navHtml;
                }
                // 最后一页标签生成
                if (totalPages > 1) {
                    if (idx !== totalPages - 1) {
                        navHtml += '<a href="javascript:;" pagemark="' + (totalPages - 1) + '" class="nav_link">' + totalPages + '</a>';
                        isLast = false;
                    } else {
                        navHtml += '<span pagemark="' + (totalPages - 1) + '" class="current_page">' + totalPages + '</span>';
                    }
                }
                // “第一页”与“上一页”标签生成
                if (isFirst) {
                    firstHtml = '<span class="first_page_mark">第一页</span>';
                    prevHtml = '<span class="prev_page_mark">上一页</span>';
                } else {
                    firstHtml = '<a href="javascript:;" class="first_page_link" pagemark="0">第一页</a>';
                    prevHtml = '<a href="javascript:;" class="prev_page_link" pagemark="' + (idx - 1) + '">上一页</a>';
                }
                // “最后一页”与“下一页”标签生成
                if (isLast) {
                    lastHtml = '<span class="first_page_mark">最后一页</span>';
                    nextHtml = '<span class="prev_page_mark">下一页</span>';
                } else {
                    lastHtml = '<a href="javascript:;" class="first_page_link" pagemark="' + (totalPages - 1) + '">最后一页</a>';
                    nextHtml = '<a href="javascript:;" class="prev_page_link" pagemark="' + (idx + 1) + '">下一页</a>';
                }
                // 目标元素翻页代码填充
                $(o.placement).each(function () {
                    var pageList = $(this).find('> .paging_list'), firstPageNode = pageList.find('> .first_page'), lastPageNode = pageList.find('> .last_page'), prevPageNode = pageList.find('> .prev_page'), nextPageNode = pageList.find('> .next_page'), navPageNode = pageList.find('> .nav_page'), disableClass = 'page_disabled';
                    // 验证是否为第一页，如果为第一页加入表示类，否则移除
                    if (isFirst) {
                        firstPageNode.add(prevPageNode).addClass(disableClass);
                    } else {
                        firstPageNode.add(prevPageNode).removeClass(disableClass);
                    }
                    // 验证是否为最后一页，如果为第一页加入表示类，否则移除
                    if (isLast) {
                        lastPageNode.add(nextPageNode).addClass(disableClass);
                    } else {
                        lastPageNode.add(nextPageNode).removeClass(disableClass);
                    }
                    // 各个区块结构替换
                    navPageNode.html(navHtml);
                    firstPageNode.html(firstHtml);
                    prevPageNode.html(prevHtml);
                    lastPageNode.html(lastHtml);
                    nextPageNode.html(nextHtml);
                    // 绑定翻页事件
                    pageList.find('a').click(function () {
                        var pageMark = $(this).attr('pagemark');
                        // 翻页跳转
                        setNavLink(parseInt(pageMark));
                    });
                });
                // 记录当前页码
                currentPage = idx;
            }

            // 初始化页面结构
            $(o.placement).each(function () {
                $(this).html(tplPageList());
            });
            // 初始化页码跳转
            setNavLink(o.initPage);
        },
        /**
         * @method
         * 检测域名
         */
        getMainDomain: function (domain) {
            var pattern = /^http(?:s)?\:\/\/((?:[\w\d]+(?:-+[\w\d]+)*\.)+([\w\d]+(-+[\w\d]+)*\.)?(test|com|net|org|hk|cn|com\.cn|net\.cn|org\.cn|gov\.cn|biz|info|cc|tv|mobi|name|asia|tw|sh|ac|io|tm|travel|ws|us|sc|mn|ag|vc|la|bz|in|cm|co|tel|me|pro|com\.hk|com\.tw|pw)|(((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])))(\:\d+)?/;
            var pat2 = /([^\.]+\.(test|com|net|org|hk|cn|com\.cn|net\.cn|org\.cn|gov\.cn|biz|info|cc|tv|mobi|name|asia|tw|sh|ac|io|tm|travel|ws|us|sc|mn|ag|vc|la|bz|in|cm|co|tel|me|pro|com\.hk|com\.tw|pw)(\:\d+)?$)|(((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\:\d+)?$)/;
            if (pattern.exec(domain)) {
                var mDomain = pattern.exec(domain)[0];
                mDomain = pat2.exec(mDomain)[1];
                return mDomain;
            } else {
                return '';
            }
        },
        /**
         * @method
         * 固定位置
         * @author  王甜爽
         * @param   {HTMLElement}   el                             触发元素
         */
        fixedPosition: function (option) {
            if (typeof option == "string" && option == "destroy") {
                $(window).off(".fixedPosition")
                return false
            }
            var el = option.el;
            var Btop = $(el).offset().top;
            var Bleft = $(el).parent().offset().left;
            var height = $(el).height();
            var changeHeight = function () {
                if (el.parent().offset().left != Bleft) {
                    Bleft = el.parent().offset().left
                    el.css({
                        left: Bleft - $(document).scrollLeft()
                    })
                }
                if (!option.fixBottom) {
                    return false
                }
                if (option.changeTarget) {
                    if (option.changeTarget.is(":hidden")) {
                        return false
                    }
                }
                var scrollTop = $(document).scrollTop();
                var bottomMargin = $(window).height() + scrollTop - eval(option.bottomMargin)
                option.changeTarget.height($(window).height() - eval(option.topMargin) + scrollTop - (bottomMargin < 0 ? 0 : bottomMargin))
            }
            var changeScroll = function () {
                if (option.changeTarget) {
                    if (option.changeTarget.is(":hidden")) {
                        return false
                    }
                }
                var scrollTop = $(document).scrollTop();
                var scrollLeft = $(document).scrollLeft();
                if (scrollTop >= Btop) {
                    //$(el).parent().css({height: height + 'px'});
                    el.css({
                        position: 'fixed',
                        top: 0,
                        left: Bleft - scrollLeft
                    })
                    el.find(".shadow_mask").show()
                } else {
                    el.removeAttr("style")
                    el.find(".shadow_mask").hide()
                }
            }
            //$(el).data("changeHeight",changeHeight)
            //$(el).data("changeScroll",changeScroll)
            $(window).on("scroll.fixedPosition", function () {
                changeScroll()
                changeHeight()
            })
            $(window).on("resize.fixedPosition", function () {
                changeHeight()
                changeScroll()
            })
            changeHeight()
        }
    }
});