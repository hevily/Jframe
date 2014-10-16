// 全站命名空间
var Jframe;
(function (o) {
    /**
     * @class   Jframe
     * 全站命名空间
     * @singleton
     */
    Jframe = o
    /**
     * @method
     * 命名空间定义。
     *
     * 如果省略了 #mainDefine 参数，则该命名空间默认为对象。
     * @param   {string}    name                命名空间名称。多级命名以圆点"."分割
     * @param   {Function/
 *           Object/
 *           string/
 *           number/
 *           boolean}   [mainDefine={}]     定义实体，该参数的值为命名空间的值。如果参数为函数，则命名空间的值为参数return的结果。
     * @param   {Object}    [options]           功能配置
     * @param   {boolean}   [options.isFn]      定义的命名空间是否为函数（或类）
     * @param   {boolean}   [options.isExtend]
     * mainDefine的结果为对象且命名空间对象原本类型为对象的情况下，是否对其扩展。false或不传则对其覆盖
     *
     * @return  {Object}    封装完成的命名空间
     */
    Jframe.define = function (name, mainDefine, options) {
        'use strict';
        if (!name || typeof name !== 'string') {
            throw new Error('命名必须为以圆点"."风格的字符串形式！');
        }
        if (name === 'Jframe.Class') {
            throw new Error('不可对 Jframe.Class 做覆盖操作！');
        }
        var parts = name.split('.'),  // 以逗号分割的命名列表
            len = parts.length, belong = window,  // 当前对象所属
            isExist, result, str, prop, i;
        // 参数容错
        if (typeof options === 'boolean') {
            options = {isFn: options};
        }
        options = options || {};
        // 分解name，逐层创建命名
        for (i = 0; i < len; i++) {
            // 获取分解的单个命名
            str = parts[i];
            if (i === len - 1) {
                isExist = typeof belong[str] === 'object';
            }
            // 如果不存在值，则默认为对象
            belong[str] = belong[str] || {};
            if (i < len - 1) {
                belong = belong[str];
            }
        }
        // 对最终命名空间设置传递的值
        if (typeof mainDefine !== 'undefined') {
            if (typeof mainDefine === 'function' && !options.isFn) {
                result = mainDefine();
            } else {
                result = mainDefine;
            }
            // 如果为扩展对象使用
            // 如果命名空间已经存在且为对象
            // 如果期望赋的值为对象
            if (options.isExtend && isExist && typeof result === 'object') {
                for (prop in result) {
                    belong[str][prop] = result[prop];
                }
            } else {
                belong[str] = result;
            }
        }
        return belong[str];
    };
    /**
     * @method
     * 定义类
     * @param   {string}    name
     * 类名。
     *
     * 只用定义类的具体名称即可，不用添加前缀，定义的所有类都会放置到 Jframe.Class 命名空间中
     * @param   {Function}  mainDefine                  类的定义内容
     * @param   {Function}  [mainDefine.constructor]    类的构造函数
     * @param   {Function}  [mainDefine.destroy]        类的的注销方法。
     * @param   {Object}    mainDefine._static          类的静态属性与方法汇总。静态属性为该对象属性，静态方法为该属性方法。
     * @param   {Object}    mainDefine._static.M        模块下模型定义汇总
     * @param   {Object}    mainDefine._static.V        模块下视图定义汇总
     * @param   {Object}    mainDefine._static.C        模块下集合定义汇总
     * @param   {Object}    [mainDefine._proto]         类的原型函数定义
     * @param   {Function/
     *           string}    [mainDefine._proto._superClass]
     * 需要继承的类，如果设置了此参数，会继承改参数指向的类（超类）的原型。
     *
     * __如果在继承过后，_proto中有与超类原型有重名的属性或方法，则会覆盖掉。之后会将覆盖掉的超类方法放入_super集合中。__
     * * 如果参数为函数，则会直接进行继承
     * * 如果参数为字符串，则会查找 Jframe.Class 对应的类
     *
     * @return  {Function}  生成的类
     */
    Jframe.defineClass = function (name, mainDefine) {
        'use strict';
        var classBaseLoc = 'Jframe.Class.';
        if (!name || typeof name !== 'string') {
            throw new Error('传递的类名称参数必须为字符串格式！');
        }
        if (!Jframe.Class) {
            Jframe.Class = {};
        }
        // 验证是否已存在
        if (Jframe.Class[name]) {
            throw new Error('创建的类"Jframe.Class.' + name + '"已存在！');
        }
        // 验证函数类型
        if (typeof mainDefine !== 'function') {
            throw new Error('类定义实体必须为函数！');
        }
        var fn, result = mainDefine(), hasSuperClass, prop;
        // 修正 _superClass 参数
        if (typeof result._superClass === 'string') {
            result._superClass = Jframe.Class[result._superClass];
        }
        // 判断是否为类
        if (result._superClass && typeof result._superClass === 'function') {
            hasSuperClass = true;
        }
        // 构造函数定义
        if (result.constructor && typeof result.constructor === 'function') {
            if (hasSuperClass) {
                fn = function () {
                    // 调用超类构造函数
                    result._superClass.apply(this, arguments);
                    result.constructor.apply(this, arguments);
                };
            } else {
                fn = function () {
                    result.constructor.apply(this, arguments);
                };
            }
        } else {
            fn = function () {
            };
        }
        // 静态属性与方法操作
        if (typeof result._static === 'object') {
            // 如果在静态属性中定义原型属性，则转移到 _proto 属性下，并注销原有属性
            if (result._static.prototype) {
                result._proto = result._static.prototype;
                delete result._static.prototype;
            }
            // 静态属性与方法赋值
            for (prop in result._static) {
                fn[prop] = result._static[prop];
            }
        }
        // 如果有用需要继承的类
        if (hasSuperClass) {
            // 继承
            for (prop in result._superClass.prototype) {
                fn.prototype[prop] = result._superClass.prototype[prop];
            }
            // 添加super属性用来缓存超类的方法
            fn.prototype._super = {};
            // 如果超类拥有超类，则缓存超类的已覆盖方法
            if (result._superClass.prototype._super) {
                for (prop in result._superClass.prototype._super) {
                    fn.prototype._super[prop] = result._superClass.prototype._super[prop];
                }
            }
        }
        // 原型属性与方法操作
        if (typeof result._proto === 'object') {
            // 原型属性与方法赋值
            for (prop in result._proto) {
                // 如果当前类包含_super属性，同时原型已有该方法，
                // 则视为继承了超类，缓存其超类方法设置其现有方法
                if (fn.prototype._super && fn.prototype[prop]) {
                    fn.prototype._super[prop] = fn.prototype[prop];
                }
                fn.prototype[prop] = result._proto[prop];
            }
        }
        // 注销方法定义
        if (result.destroy && typeof result.destroy === 'function') {
            if (hasSuperClass) {
                fn.prototype.destroy = function () {
                    // 调用超类注销方法
                    result._superClass.prototype.destroy.apply(this, arguments);
                    result.destroy.apply(this, arguments);
                };
            } else {
                fn.prototype.destroy = function () {
                    result.destroy.apply(this, arguments);
                };
            }
        } else if (hasSuperClass) {
            fn.prototype.destroy = function () {
                // 调用超类注销方法
                result._superClass.prototype.destroy.apply(this, arguments);
            };
        } else {
            fn.prototype.destroy = function () {
            };
        }
        return Jframe.define(classBaseLoc + name, fn, true);
    };
    /**
     * @method
     * 创建实例
     * @param   {Object/
 *           string}    cls             类引用
     * @param   {Array}     [params=[]]     创建实例时传递的参数。数组的每一个元素都对应一个形参。
     * @param   {string}    [scope]         作用区域
     *
     * @return  {Object}    创建的实例化对象
     */
    Jframe.create = function (cls, params, scope) {
        if (!cls) {
            throw new Error('请传递所要创建的类！');
        }
        // 形参修正
        if (arguments.length === 2) {
            if (typeof params === 'string') {
                scope = params;
                params = [];
            }
        }
        var clsStr;
        if (typeof cls === 'string') {
            clsStr = cls;
            cls = Jframe.Class[cls];
        }
        // 类存在性验证
        if (!cls) {
            if (typeof clsStr === 'string') {
                throw new Error('所要创建的类"Jframe.Class.' + clsStr + '"不存在！');
            } else {
                throw new Error('所要创建的类不存在！');
            }
        }
        if (!params || !(params instanceof Array)) {
            params = [];
        }
        scope = scope || 'main';
        // 构建包装函数
        function fn() {
            cls.apply(this, params);
        };
        fn.prototype = cls.prototype;
        // 修正引用
        fn.constructor = cls;
        var ins = new fn();
        // 记录实例
        Jframe.Instance.addInstance(ins, scope);
        return ins;
    };
    /**
     * @method
     * 退出登录，用户注销
     */
    Jframe.logout = function (v) {
        v = v ? v : false
        Jframe.ajax({
            url: '/user/logoff',
            success: function (json) {
                //var result = json.result;
                //if (result) {
                v || (window.location.href = "../login.html", localStorage.removeItem("windowId"));
                //}
            }
        }, false);
    }
})(Jframe || {});
/**
 * @class   Jframe.Static
 * 静态变量集合
 * @singleton
 */
Jframe.define('Jframe.Static', {
    /**
     * @property    {string}
     * 内容元素ID
     */
    CONTENT_BOX_ID: 'content'
});
/**
 * @class   Jframe.Base.Request
 * 请求参数
 * @singleton
 */
Jframe.define('Jframe.Base.Request', function () {
    'use strict';
    /**
     * @method
     * 获取Ajax完整URL。
     * @private
     * @param   {string}    url                 请求基准URL
     * @param   {string}    [webType='sem']     请求类型
     * @param   {string}    [suffix='json']     后缀名称
     *
     * @return  {string}    请求的完整URL
     */
    function getAjaxUrl(url, webType, suffix) {
        // 目标地址的后缀名与URL的后缀名比对，若一致则直接返回，不进行二次封装
        if (suffix && url.lastIndexOf('.' + suffix) === url.length - ('.' + suffix).length) {
            return url;
        }
        var prefix = Jframe.Base.Url.prefix;
        webType = webType || 'api';
        suffix = suffix || Jframe.Base.Url.suffix;
        if (url.indexOf('/') === 0) {
            url = url.slice(1);
        }
        return prefix[webType] + url + suffix;
    }

    /**
     * @method
     * 获取Ajax参数。
     * @private
     * @param   {Object}    params              需要传递的参数
     *
     * @return  {string}    封装并转义过的Ajax参数
     */
    function getAjaxData(params) {

        var result = {
            params: params
        };
        result = JSON.stringify(result);
        // 修复JQ请求多个问号BUG
        return result.replace(/\?{2,}/g, function (part) {
            var arr = part.split('');
            arr.unshift('');
            return arr.join('\\\\');
        });
    }

    var xhrIdx = 0;

    return {
        /**
         * @method
         * 检查会话是否过期。
         * 如果会话过期，则跳转回登录页面。
         * @param   {Object}    error   错误信息数据
         *
         * @return  {boolean}   如果会话过期，则返回true
         */
        sessionTimeout: function (error) {
            var code = error.code;
            // 会话是否过期
            if (code === 'INVALID_USER' || code === 'INVALID_AUTH') {
                if (Jframe.Global.getTaskCountXhr && Jframe.Global.getTaskCountXhr.abort) {
                    Jframe.Global.getTaskCountXhr.abort();
                    delete Jframe.Global.getTaskCountXhr;
                }
                localStorage.removeItem("windowId")
                // 记录登录前地址
                localStorage.refLink = location.href;
                // 跳转到登陆页面
                window.location.href = "/login.html"
                return true;
            }
        },
        /**
         * @method
         * 发送ajax请求。
         * @param   {Object}        options                     Ajax请求参数
         * @param   {string}        options.url                 请求地址
         * @param   {'POST'/'GET'}  [options.type='POST']       Ajax请求类型
         * @param   {string}        [options.webType='sem']     请求类型，类型参考：Jframe.Base.Url#prefix
         * @param   {string}        [options.dataType='json']   数据类型
         * @param   {Object}        [options.params]            请求参数
         * @param   {string}        [options.network='GOOGLE']  请求网络类型
         * @param   {boolean}       [options.async='true']      是否异步请求
         * @param   {number}        [options.timeout]           请求超时时间，以毫秒为单位
         * @param   {Function}      [options.beforeSend]        请求发送前需要执行的函数
         * @param   {Function}      [options.complete]          请求完成后需要执行的函数
         * @param   {Function}      [options.success]           请求发送成功执行的函数
         * @param   {Function}      [options.error]             请求发送失败执行的函数
         * @param   {Function}      [options.onabort]           请求被中断（xhr.abort）时执行的函数
         * @param   {Function}      [options.ontimeout]         请求超时时执行的函数
         * @param   {Object}        [options.si]                请求的相关广告商或账户数据，DBShared需要
         * @param   {string}        [options.si.level]          请求物料级别，仅支持 ADVERTISER 或 ACCOUNT
         * @param   {string}        [options.si.id]             请求物料所属的 ADVERTISER 或 ACCOUNT 的id
         * @param   {string}        [scope]
         * 作用区域。
         *
         * 如果存在此参数，则根据其值对其xhr对象进行缓存，直到其加载完成（触发complete函数）。
         *
         * 如果在其加载完成之前对同一个scope做了路由跳转，则会对同一scope的所有xhr对象做中断处理。
         *
         * @return  {Object}    XMLHttpRequest对象
         */
        ajax: function (options, scope) {
            // 默认区域
            scope = typeof scope !== 'undefined' ? scope : 'main';

            options.type = options.type ? options.type.toUpperCase() : 'POST';

            options.params = typeof options.params === 'undefined' ? {} : options.params;

            var ajaxObj = {
                // 请求类型
                type: options.type,
                // 请求地址设置
                url: getAjaxUrl(options.url, options.webType, options.dataType),
                // 请求参数设置
                data: options.type === 'GET' ? options.params : getAjaxData(options.params, options.network, options.si),
                // 数据类型
                dataType: options.dataType || 'json',
                // 是否异步
                async: typeof options.async === 'undefined' ? true : false,
                // 请求之前执行函数
                beforeSend: options.beforeSend,
                // 请求超时时间
                timeout: options.timeout || -1,
                // 请求成功执行函数
                success: function (data, status, xhr) {
                    if (!data) {
                        // 错误回调
                        if (typeof options.error === 'function') {
                            options.error(xhr, status);
                        }
                        return;
                    }
                    if (data.error && options.url != "/user/logoff") {
                        // 检查会话是否过期
                        if (Jframe.Base.Request.sessionTimeout(data.error)) {
                            return;
                        }
                    }
                    if (typeof options.success === 'function') {
                        options.success(data, status, xhr);
                    }
                },
                // 请求失败执行函数
                error: function (xhr, status) {
                    // 请求中断回调
                    if (status === 'abort') {
                        if (typeof options.onabort === 'function') {
                            options.onabort(xhr);
                        }
                    }
                    // 请求超时回调
                    if (status === 'timeout') {
                        if (typeof options.ontimeout === 'function') {
                            options.ontimeout(xhr);
                        }
                    }
                    // 错误回调
                    if (typeof options.error === 'function') {
                        options.error(xhr, status);
                    }
                },
                // 请求完成时执行函数
                // 无论成功与失败均执行此函数
                complete: function (xhr, status) {
                    if (scope) {
                        Jframe.Instance.removeXhr(idx, scope);
                    }
                    // 执行自定义的函数
                    if (typeof options.complete === 'function') {
                        options.complete(xhr, status);
                    }
                }
            };

            // 发送请求
            var xhr = $.ajax(ajaxObj), idx;
            // 如果定义了作用区域，则添加xhr对象
            if (scope) {
                idx = xhrIdx++;
                Jframe.Instance.addXhr(xhr, ajaxObj, idx, scope);
            }
            return xhr;
        },
        /**
         * @method
         * 构建数据列表Ajax
         * @param   {Object}    ajaxObj             Ajax请求参数。参考：Jframe.Base.Request#ajax options参数
         * @param   {Object}    options             列表加载参数
         * @param   {string}    options.targetId    加载数据的元素ID
         * @param   {Function}  options.onempty     数据为空时的回调方法
         * @param   {string}    options.emptyText   数据为空时显示的文字
         *
         * @return  {Object}    XMLHttpRequest对象
         */
        listAjax: function (ajaxObj, options) {
            return Jframe.ajax(ajaxObj);
        }
    };
});
/**
 * Ajax方法的快捷访问方式。
 * @member  Jframe
 * @method  ajax
 * @inheritdoc  Jframe.Base.Request#ajax
 */
Jframe.define('Jframe.ajax', Jframe.Base.Request.ajax, true);
/**
 * @class   Jframe.Browser
 * 浏览器支持程度
 * @singleton
 */
Jframe.define('Jframe.Browser', function () {
    'use strict';
    var ua = navigator.userAgent.toLowerCase(), support = {
        /**
         * @property    {boolean}
         * IE系列浏览器
         */
        isIE: ua.indexOf('msie') > -1,
        /**
         * @property    {boolean}
         * 浏览器为IE6
         */
        isIE6: ua.indexOf('msie 6') > -1,
        /**
         * @property    {boolean}
         * 浏览器为IE7
         */
        isIE7: ua.indexOf('msie 7') > -1,
        /**
         * @property    {boolean}
         * 浏览器为IE8
         */
        isIE8: ua.indexOf('msie 8') > -1,
        /**
         * @property    {boolean}
         * 浏览器为IE9
         */
        isIE9: ua.indexOf('msie 9') > -1,
        /**
         * @property    {boolean}
         * 浏览器为IE10
         */
        isIE10: ua.indexOf('msie 10') > -1,
        /**
         * @property    {boolean}
         * Webkit内核浏览器
         */
        isWebkit: ua.indexOf('webkit') > -1,
        /**
         * @property    {boolean}
         * 浏览器为Chrome
         */
        isChrome: ua.indexOf('chrome') > -1,
        /**
         * @property    {boolean}
         * 浏览器为Opera
         */
        isOpera: ua.indexOf('opera') > -1,
        /**
         * @property    {boolean}
         * 浏览器为Firefox
         */
        isFF: ua.indexOf('firefox') > -1,
        /**
         * @property    {boolean}
         * Blink内核浏览器
         */
        isBlink: ua.indexOf('blink') > -1
    };
    /**
     * @property    {boolean}   isGecko
     * Gecko内核浏览器
     */
    support.isGecko = !support.isWebkit && ua.indexOf('gecko') > -1;
    /**
     * @property    {boolean}   isSafari
     * 浏览器为Safari
     */
    support.isSafari = !support.isChrome && ua.indexOf('safari') > -1;
    /**
     * @property    {boolean}   isLtIE8
     * IE8以下浏览器
     */
    support.isLtIE8 = support.isIE && (support.isIE7 || support.isIE6);
    /**
     * @property    {boolean}   isGtIE8
     * IE8以上浏览器
     */
    support.isGtIE8 = support.isIE && !support.isIE8 && !support.isIE7 && !support.isIE6;
    /**
     * @property    {boolean}   isWin
     * windows操作系统
     */
    support.isWin = ua.indexOf('windows') > -1;
    /**
     * @property    {boolean}   isMac
     * mac os 操作系统
     */
    support.isMac = ua.indexOf('Mac') > -1;
    /**
     * @property    {boolean}   isLinux
     * linux 操作系统
     */
    support.isLinux = navigator.platform.indexOf('Linux') > -1;
    return support;
});
/**
 * @class   Jframe.Instance
 * 实例对象引用。
 *
 * 根据作用区域缓存已经实例化过的对象，便于内存管理与释放。
 * @singleton
 */
Jframe.define('Jframe.Instance', function () {
    'use strict';
    /**
     * @property    {Object}
     * 实例化缓存对象层级架构集合
     * @private
     */
    var insCollection = {};

    /**
     * @method
     * 创建实例化对象缓存结构
     * @private
     * @param   {string}    scope       作用区域
     * @param   {String[]}  [subBox]    子区域集合。使用时会对数组中每个值遍历其子区域
     */
    function createInstanceByScope(scope, subBox) {
        insCollection[scope] = {
            // 实例对象集合
            instances: [],
            // xhr对象集合
            xhr: {},
            // 子元素标示数组
            subBox: subBox || []
        };
    }

    createInstanceByScope(Jframe.Static.CONTENT_BOX_ID);
    /**
     * @method
     * 验证是否有作用区域，如果没有，则进行创建
     * @private
     */
    function validateScope(scope) {
        if (!scope) {
            return;
        }
        if (!insCollection[scope]) {
            createInstanceByScope(scope);
        }
    }

    // 缓存xhr对象的前置key
    var xhrPrefixKey = 'xhr';
    return {
        /**
         * @method
         * 获取查看保存的所有实例与xhr对象
         */
        getAllInstances: function () {
            return insCollection;
        },
        pauseXhr: function () {
            for (var i in insCollection) {
                for (var t in insCollection[i].xhr) {
                    var tempObj = insCollection[i].xhr[t]
                    insCollection[i].xhr[t].instance.abort();
                    insCollection[i].xhr[t] = $.extend(tempObj, {paused: true})
                }
            }
        },
        sendXhr: function () {
            for (var i in insCollection) {
                for (var t in insCollection[i].xhr) {
                    if (insCollection[i].xhr[t].paused) {
                        insCollection[i].xhr[t].instance = $.ajax(insCollection[i].xhr[t].obj)
                    }
                }
            }
        },
        /**
         * @method
         * 将实例根据作用区域添加到 {@link Jframe.Instance#insCollection} 的 instances 集合中
         * @param   {Object}    obj         要添加的实例化对象
         * @param   {string}    [scope]     作用区域
         */
        addInstance: function (obj, scope) {
            validateScope(scope);
            scope = scope || Jframe.Static.CONTENT_BOX_ID;
            insCollection[scope].instances.push(obj);
        },
        /**
         * @method
         * 将XMLHttpRequest对象对象根据作用区域添加到 {@link Jframe.Instance#insCollection} 的 xhr 集合中
         * @param   {Object}    xhr         要添加的 XMLHttpRequest对象
         * @param   {string}    [scope]     作用区域。如果没有此参数则不进行添加
         */
        addXhr: function (xhr, ajaxObj, id, scope) {
            if (scope) {
                validateScope(scope);
                insCollection[scope].xhr[xhrPrefixKey + id] = {instance: xhr, obj: ajaxObj, paused: false};
            }
        },
        /**
         * @method
         * 移除在 {@link Jframe.Instance#insCollection} 的 xhr 属性上缓存的XMLHttpRequest对象
         * @param   {string}    id      存储的xhr对象索引
         * @param   {string}    scope   作用区域。如果没有此参数则不做任何操作
         */
        removeXhr: function (id, scope) {
            if (!scope || typeof id === 'undefined') {
                return;
            }
            delete insCollection[scope].xhr[xhrPrefixKey + id];
        },
        /**
         * @method
         * 在 {@link Jframe.Instance#insCollection} 中根据作用区域遍历，执行注销事件，消除对象与引用
         * @param   {string}    [scope]     作用区域
         */
        destroy: function (scope) {
            scope = scope || Jframe.Static.CONTENT_BOX_ID;
            // 递归销毁
            function deepDestroy(item) {
                if (!item) {
                    return;
                }
                var subBox = item.subBox, len, i;
                if (subBox.length > 0) {
                    len = subBox.length;
                    for (i = 0; i < len; i++) {
                        // 递归调用
                        deepDestroy(insCollection[subBox[i]]);
                    }
                }
                var insLen = item.instances.length, insIdx, insItem, xhrProp, xhrItem;
                // 中断依然存在的XHR请求
                for (xhrProp in item.xhr) {
                    xhrItem = item.xhr[xhrProp];
                    if (xhrItem.instance) {
                        if (xhrItem.instance.abort) {
                            xhrItem.instance.abort();
                        }
                    }
                    // 移除XHR对象
                    delete item.xhr[xhrProp];
                }
                // 执行注销事件
                for (insIdx = 0; insIdx < insLen; insIdx++) {
                    insItem = item.instances[insIdx];
                    if (typeof insItem.destroy === 'function') {
                        insItem.destroy();
                    }
                }
                // 解除引用
                item.instances = [];
                item.xhr = {};
            }

            // 销毁对象
            deepDestroy(insCollection[scope]);
        }
    };
});

/**
 * @class   Jframe.Global
 * 公共存储区域
 * @singleton
 */
Jframe.define('Jframe.Global');