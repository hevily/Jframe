/**
 * @class   jQuery.Plugin
 */
(function ($) {
    'use strict';
    $.fn.extend({
        /**
         * @method
         * 选项卡切换
         *
         * 调用此方法的元素要为包含选项卡标签的"ul"元素，每个选项卡都将通过此元素查找直接子元素"li"来获取
         * @param   {Object}        options                     配置选项
         * @param   {Object}        options.panel
         * 对应选项卡的面板，面板为带有"tab_panel"类的元素
         *
         * * 如果传递的该元素包含"tab_panel"类，则直接认为该元素为面板元素集合。
         * * 如果不包含，则查找其直接子元素class为"tab_panel"的元素。
         * * 如果最终元素集合个数为0，则不执行任何动作，直接退出函数体。
         * @param   {'click'/
         *           'mouseover'}   [options.event='click']             触发切换的事件
         * @param   {string}        [options.cls='cur']                 切换后当前选项卡的标示类
         * @param   {number}        [options.initIndex=0]               初始选中的索引值
         *
         * @param   {Function}      [options.beforeTrigger]             选项卡切换之前的回调函数
         * @param   {number}        [options.beforeTrigger.lastIdx]     上一个索引值
         * @param   {Object}        [options.beforeTrigger.lastTab]     上一个选项卡
         * @param   {Object}        [options.beforeTrigger.lastPanel]   上一个选项卡对应的内容元素
         * @param   {Object}        [options.beforeTrigger.curIdx]      当前索引值
         *
         * @param   {Function}      [options.callback]                  选项卡切换之后的回调函数
         * @param   {number}        [options.callback.idx]              当前索引值
         * @param   {Object}        [options.callback.tab]              当前选项卡
         * @param   {Object}        [options.callback.panel]            当前选项卡对应的内容元素
         * @param   {Object}        [options.callback.lastIdx]          上一个选项卡的索引值
         *
         * @param   {boolean}       [options.initTrigger=true]  初始化时是否执行回调事件
         * @param   {boolean}       [options.reTrigger=true]    是否可以重复触发同一个选项卡
         * @param   {boolean}       [options.isClear=false]     选项卡切换时，之前的内容面板是否清空。true为清空
         */
        tabMenu: function (options) {
            // 默认选项
            var o = {
                event: 'click',
                cls: 'cur',
                panel: null,
                callback: null,
                beforeTrigger: null,
                initIndex: 0,
                isClear: false,
                initTrigger: true,
                reTrigger: true
            };
            // 载入自定义设置
            $.extend(o, options);
            if ($(this)[0].tabMenuBinded) {
                return;
            }
            var ele = $(this), tabs = ele.find('> li'), tabsLen = tabs.length, // 面板元素
            // 可以为面板列表，也可以为单个面板
                panels = o.panel.hasClass('tab_panel') ? o.panel : o.panel.find('> .tab_panel'), panelsLen = panels.length, index;
            if (panelsLen === 0) {
                return;
            }
            // 跳转到指定索引选项
            // @param   {number}    idx     跳转的索引值
            function skipToItem(idx) {
                // 修正索引值
                idx = idx % tabsLen;
                // 是否可以重复触发跳转
                if (!o.reTrigger && idx === index) {
                    return;
                }
                var lastPanel = panels.eq(index), curTab = tabs.eq(idx), panelIdx = idx % panelsLen, curPanel = panels.eq(panelIdx);
                // 跳转之前触发事件
                if (typeof o.beforeTrigger === 'function') {
                    typeof o.beforeTrigger(index, tabs.eq(index), lastPanel, idx);
                }
                // 移除上一个tab与panel的状态
                tabs.removeClass(o.cls);
                if (panels.length > 1) {
                    // 对上一个显示的 panel 做内容清除操作
                    if (lastPanel.length > 0) {
                        if (o.isClear) {
                            lastPanel.html('');
                        }
                    }
                }
                // 隐藏其他面板
                panels.not(curPanel).hide();
                // 读i当前索要切换的 tab 与 panel 添加状态
                curTab.addClass(o.cls);
                curPanel.show();
                // 完成回调
                if (typeof o.callback === 'function') {
                    o.callback(idx, curTab, curPanel, index);
                }
                index = idx;
            }

            // 事件绑定
            tabs.each(function (idx, item) {
                $(item).on(o.event, function (e) {
                    e.target.hasAttribute("disabled") || skipToItem(idx);
                }).find('a').on('click', function (e) {
                    e.preventDefault();
                });
            })
            // 标示绑定状态
            ele[0].tabMenuBinded = true;
            // 缓存跳转到指定项方法
            ele.data('skipToItem', skipToItem);
            // 初始化
            // 初始化时是否要触发动作
            if (o.initTrigger) {
                var realIdx = o.initIndex % tabsLen;
                tabs.removeClass(o.cls).eq(realIdx).addClass(o.cls);
                panels.hide().eq(realIdx).show();
                skipToItem(o.initIndex);
            }
        },
        /**
         * @method
         * 通过对调用此方法的元素添加事件来实现对目标元素的显示/隐藏效果
         *
         * 显示/隐藏效果通过 {@link Jframe.Tool#toggleToolkit} 一系列方法实现
         *
         * __如果想对指定选择器的元素持久绑定toggleTarget（类似于JQ老版本的"live"方法），
         * 请参考 {@link Jframe.Tool#liveToggleTarget Jframe.Tool.liveToggleTarget}__
         *
         * 如果希望触发元素个别节点被点击后不执行显示/隐藏，而执行节点本身的点击事件，例如超链接的跳转等，则在该节点上增加noprevent属性，目前只支持点击事件
         *
         * 如希望在点击目标元素自动隐藏的基础上，使目标元素的个别节点作为特例，
         * 点击不隐藏其面板，请在该节点上加入 preventautohide="true" 属性
         * @param   {Object}        options         配置选项
         * @param   {Object/
         *           Function}      options.target  要显示/隐藏的目标元素
         * @param   {'click'/
         *           'mouseover'}   [options.event='click']
         * 触发事件
         * @param   {boolean}       [options.isSingleTarget=false]
         * 如果该参数为true，则认为多个引用元素公用一个目标元素，此时，会对其设置排他性。
         * 而且如果type为pop时，只会对document绑定一次事件使其隐藏
         *
         * * 若为"click"，则对每次点击进行状态判断
         * * 若为"mouseover"，则对鼠标指向(mouseover)时触发显示效果，鼠标移开(mouseout)时触发隐藏效果
         * @param   {string}    [options.cls='opened']  目标元素显示时对触发元素添加的标示类
         * @param   {'block'/
         *           'pop'}     [options.type='block']
         * 目标元素的类型。
         *
         * * 若为"block"，认为目标元素为块级元素，只对引用元素绑定事件
         * * 若为"pop"，认为目标元素为弹窗。
         *   在event为"click"时，除了对引用元素绑定事件外，还会对document元素绑定，
         *   来确保点击非引用元素与目标元素时，弹窗可正常关闭。
         *
         *   __请确保在类的"destroy"方法中调用了对应用此行为元素的{@link jQuery.Plugin#destroyToggleTarget 注销方法}，以便对document解绑事件，提升效率。__
         * @param   {boolean}   [options.stopPropagation=true]  目标元素点击后是否阻止其做自动隐藏操作（类似于阻止冒泡）
         * @param   {boolean}   [options.initShow=false]        初始化时目标元素是否展现
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
        toggleTarget: function (options) {
            var o = {
                event: 'click',
                type: 'block',
                target: null,
                cls: 'opened',
                beforeTrigger: null,
                callback: null,
                onshow: null,
                onhide: null,
                stopPropagation: true,
                initShow: false,
                isSingleTarget: false
            };
            // 载入自定义设置
            $.extend(o, options);
            var toggleToolkit = Jframe.Tool.toggleToolkit, ts = new Date() - 0, singleTargetHideFn, singleTar;
            // 如果目标为同一个元素，则对document只绑定一次事件
            if (o.isSingleTarget) {
                singleTar = typeof o.target === 'function' ? o.target() : $(o.target);
                if (o.type === 'pop' && o.event === 'click') {
                    // 点击document时自动隐藏其target参数
                    singleTargetHideFn = function (e) {
                        var source = $(e.target), from = $(singleTar[0].toggleSource), isPrevent;
                        // 当前元素是否触发的元素，或包含在触发元素内部
                        if (source[0] === from[0] || source.closest('[togglemark=' + ts + ']').length > 0 || source.attr('preventautohide') || source.closest('[preventautohide]').length > 0) {
                            isPrevent = true;
                        }
                        if (!isPrevent && singleTar.hasClass(toggleToolkit.showClass)) {
                            Jframe.Tool.toggleToolkit.hideTarget(from, singleTar, o);
                        }
                    };
                    $(document).on('click', singleTargetHideFn);
                    // 初始化隐藏单个目标元素
                    Jframe.Tool.toggleToolkit.hideTarget($(singleTar[0].toggleSource), singleTar, {cls: o.cls});
                }
                if (o.event === 'mouseover') {
                    singleTar.on('mouseover', function () {
                        var timer = $(this).data('hoverTimer');
                        // 终止隐藏目标图层计时器
                        if (timer) {
                            clearTimeout(timer);
                        }
                    });
                    singleTar.on('mouseout', function () {
                        var timer = $(this).data('hoverTimer'), timeout;
                        // 终止隐藏目标图层计时器
                        if (timer) {
                            clearTimeout(timer);
                        }
                        // 指定延迟后隐藏目标图层
                        timeout = setTimeout(function () {
                            toggleToolkit.hideTarget($(singleTar[0].toggleSource), singleTar, o);
                        }, 200);
                        $(this).data('hoverTimer', timeout);
                    });
                }
            }
            $(this).each(function (idx, element) {
                var ele = $(element), eleSrc = ele[0], target, targetSrc, tskey = ts, bindEle;
                // 获取目标元素
                if (singleTar) {
                    target = singleTar;
                } else {
                    target = typeof o.target === 'function' ? o.target(ele) : $(o.target);
                }
                targetSrc = target[0];
                // 避免重复绑定
                if (eleSrc.toggleTargetBinded) {
                    return;
                }
                // 保存引用
                eleSrc.toggleTarget = target;
                targetSrc.toggleSource = eleSrc;
                // click 事件与 mouseover 事件区分对待
                if (o.event === 'click') {
                    // click事件中对每次点击判断是否含有目标元素已经显示的标示
                    if (o.isSingleTarget) {
                        // 目标为同一个元素时，点击事件需要有排他性
                        ele.click(function (e) {
                            if (!e.target.hasAttribute("noprevent")) {
                                e.preventDefault();
                            } else {
                                return
                            }
                            var me = $(this);
                            if (targetSrc.toggleSource === this && me.hasClass(o.cls)) {
                                toggleToolkit.hideTarget(me, target, o);
                            } else {
                                $(targetSrc.toggleSource).removeClass(o.cls);
                                toggleToolkit.showTarget(me, target, o);
                                targetSrc.toggleSource = this;
                            }
                        });
                    }
                    ele.find('a').click(function (e) {
                        if (!e.target.hasAttribute("noprevent")) {
                            e.preventDefault();
                        }
                    });
                    ele.attr('togglemark', tskey);
                    target.attr('istoggletarget', true);
                    // 如果目标元素为弹窗，而非块级显示/隐藏元素，
                    // 需要对document事件进行监听，每次点击都对其隐藏
                    if (o.type === 'pop') {
                        if (o.isSingleTarget) {
                            ele.data('rootHideFn', singleTargetHideFn);
                        } else {
                            // 包含则隐藏，不包含则显示
                            ele.click(function (e) {
                                if (!e.target.hasAttribute("noprevent")) {
                                    e.preventDefault();
                                } else {
                                    return
                                }
                                e.stopPropagation();
                                var t = $(this.toggleTarget);
                                if (t.hasClass(toggleToolkit.showClass)) {
                                    toggleToolkit.hideTarget(ele, t, o);
                                } else {
                                    if ($(this).closest('[istoggletarget]').length === 0) {
                                        $(document).click();
                                    }
                                    toggleToolkit.showTarget(ele, t, o);
                                }
                            });
                            tskey = new Date() - 0;
                            ele.attr('togglemark', tskey);
                            ele.data('rootHideFn', function (e) {
                                var bd = $(document.body);
                                // 自动注销机制
                                if (bd.find(ele).length === 0) {
                                    ele.destroyToggleTarget();
                                    return;
                                }
                                if (!e) {
                                    Jframe.Tool.toggleToolkit.hideTarget(ele, target, o);
                                    return;
                                }
                                var source = $(e.target), isPrevent;
                                // 当前元素是否触发的元素，或包含在触发元素内部
                                if (source.closest('[togglemark]').length > 0 || source.attr('preventautohide') || source.closest('[preventautohide]').length > 0) {
                                    isPrevent = true;
                                }
                                // 如果需要显示/隐藏的目标元素需要点击时阻止起触发事件
                                if (!isPrevent && o.stopPropagation) {
                                    if (source.closest('[istoggletarget]').length > 0) {
                                        isPrevent = true;
                                    }
                                }
                                if (!isPrevent) {
                                    Jframe.Tool.toggleToolkit.hideTarget(ele, target, o);
                                }
                            });
                            $(document).on('click', ele.data('rootHideFn'));
                        }
                        // 对目标元素中含有 close_pop 类的元素绑定点击隐藏弹窗事件
                        target.find('.close_pop').click(function () {
                            ele.data('rootHideFn')();
                        });
                    } else if (!o.isSingleTarget) {
                        // 包含则隐藏，不包含则显示
                        ele.click(function (e) {
                            if (!e.target.hasAttribute("noprevent")) {
                                e.preventDefault();
                            } else {
                                return
                            }
                            var t = $(this.toggleTarget);
                            if (t.hasClass(toggleToolkit.showClass)) {
                                toggleToolkit.hideTarget(ele, t, o);
                            } else {
                                toggleToolkit.showTarget(ele, t, o);
                            }
                        });
                    }
                } else {
                    // 如果目标元素为同一个元素，绑定目标作调整，避免重复绑定
                    if (o.isSingleTarget) {
                        bindEle = ele;
                    } else {
                        bindEle = ele.add(target);
                    }
                    bindEle.on('mouseover', function () {
                        var timer = $(target).data('hoverTimer');
                        // 终止隐藏目标图层计时器
                        if (timer) {
                            clearTimeout(timer);
                        }
                        if (target.hasClass(toggleToolkit.showClass) && target.toggleSource === this) {
                            return;
                        }
                        toggleToolkit.showTarget(ele, target, o);
                        target.toggleSource = this;
                    });
                    bindEle.on('mouseout', function () {
                        var timer = $(target).data('hoverTimer'), timeout;
                        // 终止隐藏目标图层计时器
                        if (timer) {
                            clearTimeout(timer);
                        }
                        // 指定延迟后隐藏目标图层
                        timeout = setTimeout(function () {
                            toggleToolkit.hideTarget(ele, target, o);
                        }, 200);
                        $(target).data('hoverTimer', timeout);
                    });
                }
                // 冒泡阻止
                // if (o.stopPropagation) {
                // target.click(function (e) {
                // if ($(e.target).closest('[istoggletarget]').length===1) {
                //     e.stopPropagation();
                // }
                // });
                // }
                // 标示绑定状态
                eleSrc.toggleTargetBinded = true;
                if (!o.isSingleTarget) {
                    if (o.initShow) {
                        // 初始化显示
                        toggleToolkit.showTarget(ele, target, o);
                    } else {
                        // 初始化隐藏
                        toggleToolkit.hideTarget(ele, target, o);
                    }
                }
            });
        },
        /**
         * @method
         * 注销 {@link jQuery.Plugin#toggleTarget} 中 event为'click'，type为'pop'时对 document 绑定的事件
         *
         * 如果引用此方法的元素没有对应标示，则不执行任何动作
         */
        destroyToggleTarget: function () {
            $(this).each(function (idx, element) {
                var ele = $(this), fn = ele.data('rootHideFn');
                // 检测是否有对应标示
                if (typeof fn === 'function') {
                    $(document).off('click', fn);
                    ele.removeData('rootHideFn');
                }
                if (typeof ele[0].toggleTargetBinded !== 'undefined') {
                    delete ele[0].toggleTargetBinded;
                }
            })
        },
        /**
         * @method
         * juqery-ui datepicker封装

         * 注释：自定义了一个字段 pickerHMS(是否显示时分秒选项，默认为false不显示)
         *
         * 中文参考文档：http://wenku.baidu.com/view/f77d29d549649b6648d747f8.html
         *
         * 官方参考文档：http://api.jqueryui.com/datepicker/
         *
         * @param   {string/
     *           Object}    attr
         *
         * * 当为string时，是对属性和方法的操作
         * * 当为Obeject时，是对属性的赋值
         *
         * @param   {string}    key     属性
         * @param   {string}    value    属性值
         *
         * 基本使用方法
         *
         * * $(el).datePickerTime("option","maxDate()"):获取设置的最大日期
         * * $(el).datePickerTime("option","maxDate()",new Date())：设置最大日期
         * * $(el).datePickerTime({maxDate:new Date()});设置日期；
         * * $(el).datePickerTime("getDate");获取选中日期；
         * * $(el).datePickerTime("setDate","2012/7/1");设置当前选中日期；
         *
         * 新增参数
         * * clearBtn:是否显示清除按钮
         * * clearCallback：点击清除按钮回调
         */
        datePickerTime: function (attr, key, value) {
            var id = $(this).attr("id");
            var datepickerCls = null;
            var o = {
                altField: $(this),
                clearBtn: false,
                clearCallback: null,
                buttonImage: "/images/calendar.png",
                buttonImageOnly: true,
                showOn: "button",
                buttonText: $.t('chooseDate'),
                currentText: $.t('_date.today'),
                showButtonPanel: true,
                closeText: $.t('close'),
                dateFormat: "yy/mm/dd",
                dayNames: [$.t('_date.sunday'), $.t('_date.monday'), $.t('_date.tuesday'), $.t('_date.wednesday'), $.t('_date.thursday'), $.t('_date.friday'), $.t('_date.saturday')],
                dayNamesMin: [$.t('_date.sun'), $.t('_date.mon'), $.t('_date.tue'), $.t('_date.wed'), $.t('_date.thur'), $.t('_date.fri'), $.t('_date.sat')],
                dayNamesShort: [$.t('_date.sunday'), $.t('_date.monday'), $.t('_date.tuesday'), $.t('_date.wednesday'), $.t('_date.thursday'), $.t('_date.friday'), $.t('_date.saturday')],
                monthNames: [$.t('_date.jan'), $.t('_date.feb'), $.t('_date.mar'), $.t('_date.apr'), $.t('_date.may'), $.t('_date.jun'), $.t('_date.jul'), $.t('_date.aug'), $.t('_date.sep'), $.t('_date.oct'), $.t('_date.nov'), $.t('_date.dec')],
                nextText: $.t('_date.prevMonth'),
                prevText: $.t('_date.nextMonth'),
                maxDate: new Date(),
                showMonthAfterYear: true,
                yearSuffix: $.t('_date.year'),
                pickerHMS: false
            };
            $(this).attr('readonly', true);
            $(this).wrap('<span class="ui_datepicker_wrap">');
            // 清除
            function clearFn(el, arg) {
                var id = $(el).attr('id');
                $(el).parent().append('<a href="javascript:void(0)" class="ui_datepicker_clear" id="datepicker_clear_' + id + '"></a>');
                $(el).parent().hover(function () {
                    $(el).siblings('#datepicker_clear_' + id).css('visibility', 'visible');
                }, function () {
                    $(el).siblings('#datepicker_clear_' + id).css('visibility', 'hidden');
                })
                $(el).siblings('#datepicker_clear_' + id).off('click').click(function () {
                    var $this = $(this);
                    datepickerCls.datepicker('setDate', null);
                    if (arg.clearCallback) {
                        arg.clearCallback($this);
                    }
                })
            }

            if (arguments.length == 1) {
                if (typeof arguments[0] == "string") {
                    return $(this).datepicker(arguments[0])
                } else {
                    $(this).datepicker("destroy");
                    $.extend(o, attr);
                    datepickerCls = $(this).datepicker(o);
                    if (o.clearBtn) {
                        clearFn($(this), o);
                    }
                    return datepickerCls;
                }
            } else if (arguments.length == 3) {
                var changeObj = {};
                $(this).datepicker("destroy");
                changeObj[key] = value;
                $.extend(o, changeObj);
                datepickerCls = $(this).datepicker(o);
                if (o.clearBtn) {
                    clearFn($(this), o);
                }
                return datepickerCls;
            } else if (arguments.length == 2) {
                return $(this).datepicker(attr, key);
            } else if (arguments.length == 0) {
                return $(this).datepicker(o);
            }
        },
        /**
         * 转换xml为对象形式
         * @method
         * @return {Object}
         */
        toObject: function () {
            if (this == null) return null;
            var retObj = new Object;
            buildObjectNode(retObj, /*jQuery*/this.get(0));
            return $(retObj);
            function buildObjectNode(cycleOBJ, /*Element*/elNode) {
                /*NamedNodeMap*/
                var nodeAttr = elNode.attributes;
                if (nodeAttr != null) {
                    if (nodeAttr.length && cycleOBJ == null) cycleOBJ = new Object;
                    for (var i = 0; i < nodeAttr.length; i++) {
                        cycleOBJ[nodeAttr[i].name] = nodeAttr[i].value;
                    }
                }
                var nodeText = "text";
                if (elNode.text == null) nodeText = "textContent";
                /*NodeList*/
                var nodeChilds = elNode.childNodes;
                if (nodeChilds != null) {
                    if (nodeChilds.length && cycleOBJ == null) cycleOBJ = new Object;
                    for (var i = 0; i < nodeChilds.length; i++) {
                        if (nodeChilds[i].tagName != null) {
                            if (nodeChilds[i].childNodes[0] != null && nodeChilds[i].childNodes.length <= 1 && (nodeChilds[i].childNodes[0].nodeType == 3 || nodeChilds[i].childNodes[0].nodeType == 4)) {
                                if (cycleOBJ[nodeChilds[i].tagName] == null) {
                                    cycleOBJ[nodeChilds[i].tagName] = nodeChilds[i][nodeText];
                                } else {
                                    if (typeof(cycleOBJ[nodeChilds[i].tagName]) == "object" && cycleOBJ[nodeChilds[i].tagName].length) {
                                        cycleOBJ[nodeChilds[i].tagName][cycleOBJ[nodeChilds[i].tagName].length] = nodeChilds[i][nodeText];
                                    } else {
                                        cycleOBJ[nodeChilds[i].tagName] = [cycleOBJ[nodeChilds[i].tagName]];
                                        cycleOBJ[nodeChilds[i].tagName][1] = nodeChilds[i][nodeText];
                                    }
                                }
                            } else {
                                if (nodeChilds[i].childNodes.length) {
                                    if (cycleOBJ[nodeChilds[i].tagName] == null) {
                                        cycleOBJ[nodeChilds[i].tagName] = new Object;
                                        buildObjectNode(cycleOBJ[nodeChilds[i].tagName], nodeChilds[i]);
                                    } else {
                                        if (cycleOBJ[nodeChilds[i].tagName].length) {
                                            cycleOBJ[nodeChilds[i].tagName][cycleOBJ[nodeChilds[i].tagName].length] = new Object;
                                            buildObjectNode(cycleOBJ[nodeChilds[i].tagName][cycleOBJ[nodeChilds[i].tagName].length - 1], nodeChilds[i]);
                                        } else {
                                            cycleOBJ[nodeChilds[i].tagName] = [cycleOBJ[nodeChilds[i].tagName]];
                                            cycleOBJ[nodeChilds[i].tagName][1] = new Object;
                                            buildObjectNode(cycleOBJ[nodeChilds[i].tagName][1], nodeChilds[i]);
                                        }
                                    }
                                } else {
                                    cycleOBJ[nodeChilds[i].tagName] = nodeChilds[i][nodeText];
                                }
                            }
                        }
                    }
                }
            }
        },
        /**
         * @method
         * * 自定义文本框的placeholder
         * * 针对input[inputtips],textarea[inputtips]设置提示
         * * 不适用用同级有float的区域,如有请用一个div区块进行包裹
         * * 调用方式 $('#ele').inputTips();
         * @param      {Object}        options            配置参数
         * @param      {Object}        [options.css]      设置提示的css样式
         */
        inputTips: function (options) {
            'use strict';
            //文本框改变方法
            var inputChange = function () {
                var self = $(this), prevLabel = self.prev("label"), inputtips = self.attr("inputtips");
                if (self.val() == "") {
                    prevLabel.html(inputtips).show();
                } else {
                    prevLabel.text("");
                    self.is("[labelhidden]") && prevLabel.hide()
                }
            }, options = options || {}, eachEle = $(this), eachDomEle = eachEle[0];
            if (!eachDomEle) {
                return eachEle;
            }
            //不是input,textarea
            if (eachDomEle.tagName != 'INPUT' && eachDomEle.tagName != 'TEXTAREA') {
                eachEle = eachEle.find('input[inputtips],textarea[inputtips]');
            }
            $.each(eachEle, function (index, item) {
                var self = this, ele = $(this);
                //已经生成过提示信息,直接返回
                if (self.inpHasTips) {
                    return;
                } else {
                    var inputtips = ele.attr("inputtips"), labelForID = ele.attr("id"), default_css_params = {
                        'color': '#8B9096',
                        'cursor': 'text',
                        'position': 'absolute',
                        // 'padding': '6px 0 0 8px',
                        'z-index': '1',
                        'background': 'transparent',
                        'line-height': '16px',
                        "font-weight": "normal"
                    }, options_css = options.css || {}, cssParams = $.extend(default_css_params, options_css), forStr = '', par = ele.parent(), fs = parseInt(ele.css('font-size')), bol = parseFloat(ele.css('borderLeftWidth')) || 0, bot = parseFloat(ele.css('borderTopWidth')) || 0, lh = parseFloat(ele.css('lineHeight')) || 16, left, top, pos;
                    if (!/^relative|absolute$/.test(par.css('position'))) {
                        par.css('position', 'relative');
                    }
                    // 当前定位获取
                    pos = ele.position();
                    if (_.isEmpty(options_css)) {
                        left = (parseFloat(ele.css('paddingLeft')) || 0) + bol;
                        // if (self.tagName == 'INPUT') {
                        //     top = Math.ceil((ele.outerHeight() - fs - 2) / 2);
                        // } else {
                        //     top = parseInt(ele.css('paddingTop'));
                        // }
                        if (ele[0].tagName.toLowerCase() !== 'textarea') {
                            lh = Math.max(lh, ele.height());
                        }
                        top = (parseInt(ele.css('paddingTop')) || 0) + (lh - 16) / 2 + bot;
                    }
                    // 定位提示框
                    default_css_params.left = Math.floor(left) + pos.left + 'px';
                    default_css_params.top = Math.floor(top) + pos.top + 'px';
                    if (labelForID) {
                        forStr = 'for="' + labelForID + '"';
                    }
                    var prevLabel = $('<label class="inputtips" ' + forStr + '>' + inputtips + '</label>');
                    //设置label的css样式
                    prevLabel.css(cssParams)
                    if ($(self).val() != '') {
                        prevLabel.css({
                            'opacity': 0
                        }).text('');
                    }
                    //在当前的元素前面增加label
                    $(self).before(prevLabel);
                    $(self).focus(function () { //获取光标
                        if ($(self).attr("disabled")) {
                            return;
                        }
                        prevLabel.stop().animate({
                            'opacity': 0.5
                        }, 300);
                    }).blur(function () { //失去光标
                        prevLabel.stop().animate({
                            'opacity': 1
                        }, 300);
                    });

                    if ('onpropertychange' in self) { //ie浏览器
                        self.onpropertychange = function () {
                            if (window.event.propertyName.toLowerCase() == "value") {
                                inputChange.call(self, window.event);
                            }
                        };
                        self.onkeyup = self.onchange = inputChange;
                    } else { //非ie浏览器
                        self.addEventListener("input", inputChange, false);
                        $(self).on('keyup', inputChange);
                        $(self).on('change', inputChange);
                    }
                    self.inpHasTips = true;
                }
            });
            $("label.inputtips").on("click", function () {
                $(this).next("input").focus();
            });
            return this;
        },
        /**
         * @method
         * * 按回车搜索input[onenter | textarea[onenter]
         * * 调用方式
         */
        enterSearchFn: function () {
            'use strict';
            var curEle = $(this);
            //不是input,textarea
            if (this[0].tagName != 'INPUT' && this[0].tagName != 'TEXTAREA') {
                $.each(curEle.find('input[onenter]'), function (index, item) {
                    inputEnter.call(this);
                });
                $.each(curEle.find('textarea[onenter]'), function (index, item) {
                    textareaEnter.call(this);
                });
            } else if (curEle.length > 1) {
                curEle.each(function (index, item) {
                    if (item.tagName == "INPUT") {
                        inputEnter.call(this);
                    } else {
                        textareaEnter.call(this);
                    }
                });

            } else {
                if (this[0].tagName == 'INPUT') {
                    inputEnter.call(this);
                }
                if (this[0].tagName == 'TEXTAREA') {
                    textareaEnter.call(this);
                }
            }
            var inputEnterTimeOut;
            //input enter方法
            function inputEnter() {
                var self = this, enterID = $(self).attr("onenter");
                if (self.isBindEnter) {
                    return;
                }
                //阻止输入焦点的默认事件,IE下连续触发bug
                $(self).parent().off('keydown').on('keydown', function (e) {
                    if (e.keyCode == 13) {
                        e.preventDefault();
                    }
                })
                $(self).off('keyup').on("keyup", function (e) {
                    if (e.keyCode == 13) {
                        if (enterID) {
                            $("#" + enterID).focus().click();
                        }
                    }
                });
                self.isBindEnter = true;
            }

            //textarea enter方法
            function textareaEnter() {
                var self = this, enterID = $(self).attr("onenter");
                if (self.isBindEnter) {
                    return;
                }
                $(self).off('keyup').on("keyup", function (e) {
                    if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 10)) {
                        if (enterID) {
                            $("#" + enterID).focus().click();
                        }
                    }
                });
                self.isBindEnter = true;
            }

            return this;
        },
        /**
         * @method
         * 只能输入数字  （author:王甜爽）
         * @param      {Object}        options            配置参数
         * @param      {Object}        [options.dot]      是否过滤小数点
         */
        onlyNumber: function (options) {
            var curEle = $(this),
                options = options || {},
                dot = options.dot;
            //不是input
            if (this[0].tagName != 'INPUT') {

                $.each(curEle.find('input[onlynumber]'), function (index, item) {
                    filterNumber.call(this);
                });
            } else {
                $.each(this, function () {
                    var $this = $(this);
                    $this.attr('onlynumber', true);
                    filterNumber.call($this);
                })
            }
            function filterNumber() {
                var self = $(this)[0];
                if (self.isBind) {
                    return;
                }
                beVal($(this));
                $(self).on("keyup", function (e) {
                    beVal($(this));
                })
                $(self).on("input", function (e) {
                    beVal($(this));
                })
                self.isBind = true;
                function beVal(el) {

                    //正则
                    var reg = /[^\d\.]/g,
                        intVal = el[0].value,
                        val = el[0].value, // 支持处理
                        isInt = el.attr('isint'), // 最初的值
                        oldVal = el.attr('oldVal'),
                        fixedVal = '', // 最终格式化后的值
                        indotLen = val.match(/\./g) ? val.match(/\./g).length : 0,// 小数点个数
                        isDoatLast = intVal.substr(intVal.length - 1, intVal.length - 1) === '.',// 最后一位是否是小数点
                        dotLen = 1,
                        formatVal,
                        focusIdx,
                        format = "#,##0",
                        dotNum = 0,// 小数位数
                        maxNum = Number(el.attr('maxNum'));

                    if (dot) {
                        reg = /[^\d]/g;
                        dotLen = 0;
                        val = val.replace(reg, '').toString();
                        if (val !== '') {
                            fixedVal = $.formatNumber(val, {format: '#,##0'});
                        } else {
                            fixedVal = val;
                        }

                    } else {
                        val = val.replace(reg, '').toString();
                        // 小数点出现多次
                        if (val.match(/\./g)) {
                            if (val.match(/\./g).length > dotLen) {
                                var arry = val.split('.');
                                var val1 = arry[0];
                                var val2 = arry.slice(1);
                                val2 = _.compact(val2);
                                val = val1 + '.' + val2.toString();
                                fixedVal = val;
                                if (val.substr(val.length - 1, val.length - 1) === '.') {
                                    fixedVal = $.formatNumber(Number(fixedVal), {format: '#,##0'}) + '.';
                                }
                            }
                        }

                        // 小数点出现在第一位
                        if (val.indexOf('.') == 0) {
                            val = '';
                            fixedVal = val;
                        }
                    }

                    // 如果值存在，并且最后一位不是小数点，且格式合法，则进行格式化
                    if (!isDoatLast && indotLen <= dotLen && val !== '') {
                        val = val.replace(',', '');
                        dotNum = Jframe.Tool.getDotLen(val);
                        if (dotNum > 0 && !isDoatLast) {
                            format = "#,##0.";
                            for (var i = 0; i < dotNum; i++) {
                                format += '0';
                            }
                        }
                        fixedVal = $.formatNumber(val, {format: format});

                    }

                    // JS数字类型精度只能到18位，超过长度，禁止输入
                    if (val.length > 15) {
                        el.val(oldVal);
                        return;
                    }

                    // 如果格式化后值没变或最后一为是小数点，则不用重新赋值
                    if (fixedVal === intVal || (isDoatLast && indotLen <= dotLen)) {
                        el.attr('oldVal', intVal);
                        return;
                    }
                    //查看是否有最大数字的限制
                    if (!isNaN(maxNum)) {
                        if (val > maxNum) {
                            el.val(fixedVal.substring(0, fixedVal.length - 1));
                        } else {
                            //add by lqj  如果没有超过最大值但是
                            el.val(fixedVal);
                        }
                    } else {

                        el.val(fixedVal);
                    }
                    el.attr('oldVal', fixedVal);
                }
            }

        },
        setCaretPosition: function (pos) {
            var ctrl = this;
            if (ctrl.setSelectionRange) {
                ctrl.focus();
                ctrl.setSelectionRange(pos, pos);
            }
            else if (ctrl.createTextRange) {
                var range = ctrl.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        },
        getCursortPosition: function () {
            var ctrl = this[0];
            var CaretPos = 0;   // IE Support
            if (document.selection) {
                ctrl.focus();
                var Sel = document.selection.createRange();
                Sel.moveStart('character', -ctrl.value.length);
                CaretPos = Sel.text.length;
            }
            // Firefox support
            else if (ctrl.selectionStart || ctrl.selectionStart == '0')
                CaretPos = ctrl.selectionStart;
            return (CaretPos);
        },
        /**
         * @method
         * 限制方式  （author:贺文力）
         * @param     {object}        options
         * @param     {string}        options.reg     /[^\d\.]/g 正则表达式
         */
        limitTxt: function (options) {
            var curEle = $(this), options = options || {}, reg = options.reg;
            //不是input
            if (this[0].tagName != 'INPUT') {
                $.each(curEle.find('input[onlynumber]'), function (index, item) {
                    filterNumber.call(this);
                });
            } else {
                $.each(this, function () {
                    var $this = $(this);
                    filterNumber.call($this);
                })
            }
            function filterNumber() {
                var self = $(this)[0];
                if (self.isBind) {
                    return;
                }
                $(self).on("keyup", function (e) {
                    beVal($(this));
                }).on("input", function (e) {
                    beVal($(this));
                })
                self.isBind = true;
                function beVal(el) {
                    var iptVal = el.val();
                    el.val(iptVal.replace(reg, ''));
                }
            }
        },
        /**
         * @method
         * 过滤通配符  （author:贺文力)
         * @param     {object}        options
         * @param     {Boolean}       options.required     是否显示*
         * @param     {Boolean}       options.num          是否显示数字10/50
         * @param     {Boolean}       options.wildcards    统配符是否加入计算
         * @param     {Number}        options.max          最大字符
         * @param     {string}        options.rp           替换几位字符
         * @param     {Boolean}       options.space        空格是否进行过滤
         */
        inputMax: function (options) {
            var self = $(this), options = options || {}, required = options.required || false, num = options.num || false, wildcards = options.wildcards || false, max = options.max, rp = options.rp || 'xx', space = options.space;
            //先移除再绑定
            self.siblings('.maxtip').remove();
            //计算长度
            var computLen = function (val, isWildcards) {
                var strVal = val || '';
                if (space) {
                    strVal = strVal.replace(/\n/g, '').replace(/\s+/g, ' ');
                }
                strVal = strVal.replace(/[^\x00-\xff]/g, rp);
                if (isWildcards) {
                    strVal = strVal.replace(/{(.*?)}/g, '$1');
                    strVal = strVal.replace(/\^/g, '');
                }
                return strVal.length
            };
            //截取
            var limitDo = function (limit) {
                var val = this.value, curLen = computLen(val, wildcards);
                if (curLen > limit) {
                    val = val.substr(0, val.length - 1);
                    while (computLen(val, wildcards) > limit) {
                        val = val.substr(0, val.length - 1);
                        continue;
                    }
                    this.value = val;
                }
            };
            var required_html = '';
            if (num) {
                if (required) {
                    required_html = '<b class="required">*</b>';
                }
                self.after('<span class="maxtip">' + required_html + '<em>' + computLen(self.val(), wildcards) + '/' + max + '</em></span>');
            }
            var inputChange = function () {
                var th = $(this);
                limitDo.call(th[0], max);
                th.next('.maxtip').find('em').text(computLen(th.val(), wildcards) + '/' + max);
            }
            if ('onpropertychange' in self[0]) { //ie浏览器
                self[0].onpropertychange = function () {
                    if (window.event.propertyName.toLowerCase() == "value") {
                        limitDo.call(self[0], max);
                        self.next('.maxtip').find('em').text(computLen(self.val(), wildcards) + '/' + max);
                    }
                };
                self[0].onkeyup = self[0].onchange = inputChange;
            } else { //非ie浏览器
                self[0].addEventListener("input", inputChange, false);
                self.on('keyup', inputChange);
                self.on('change', inputChange);
            }
            return self;
        }

    });
}(jQuery));
