/**
 * @class   Pzoom.Plugin.AdaptiveScroller
 * datatable 插件。
 *
 * 数据表格内容部分高度自适应，始终在可见区域显示横向滚动条
 *
 * @cfg     {Object}    dt  创建 DataTable 后返回的对象
 */
Pzoom.define('Pzoom.Plugin.AdaptiveScroller', function () {
    var AdaptiveScroller = function (dt) {
        if (!dt || !dt.fnSettings) {
            throw new Error('请传递正确的 datatable 对象！');
        }
        // datatable属性
        this.dt = dt.fnSettings();
        // 是否拥有固定列
        this.isFixedColumns = !!this.dt.oFixedColumns;
        // 缓存当前实例
        this.dt.oAdaptiveScroller = this;
        //横向滚动条计时器
        //this.timer = null;
        // 初始化
        this.init();
    };
    // 实例化集合
    //AdaptiveScroller.instance = {};
    // 事件集合
    //AdaptiveScroller.handler = {};
    // 列表标示索引
    //AdaptiveScroller.markIdx = 0;
    AdaptiveScroller.prototype = {
        // 初始化
        init: function () {
            //var idx = AdaptiveScroller.markIdx++,
            var tableId = this.dt.sTableId//, key = this.dt.sTableId + idx;
            //this.markIdx = idx;
            //$('#' + this.dt.sTableId).attr('adaptivescrolleridx', idx);
            // 缓存实例
            //AdaptiveScroller.instance[key] = this;
            // 缓存窗口滚动 或 窗口改变尺寸时重绘函数
            /*AdaptiveScroller.handler[key] = function (e) {
             // 验证在列表元素移除 或 元素被替换的时候自动注销全局绑定事件
             var table = $('#' + tableId);
             if (table.length === 0 || table.attr('adaptivescrolleridx') !== (idx + '')) {
             AdaptiveScroller.instance[key].destroy();
             return;
             }
             AdaptiveScroller.instance[key].recalcHeight();
             }*/
            // 创建占位符
            this.createPhByBody();
            this.createPhByDataControl();
            this.bindEvent();
            this.recalcHeight();
        },
        // 创建内容占位符
        createPhByBody: function () {
            var html = '<div class="scrollBody_placeholder" style="height:0; overflow:hidden;"></div>', dom;
            dom = $(html);
            // 缓存表格主体信息
            this.body = $(this.dt.nTable);
            // 加入占位符
            this.body.parent().after(dom);
            // 缓存占位符元素
            this.body.ph = dom;
            // 如果有固定列，则对固定列加入占位符
            if (this.isFixedColumns) {
                dom = $(html);
                this.fixColBody = {};
                this.fixColBody.dom = $(this.dt.oFixedColumns.dom.clone.left.body);
                this.fixColBody.dom.parent().after(dom);
                this.fixColBody.ph = dom;
            }
        },
        // 创建控制区域占位符
        // 包含分页，导航等信息
        createPhByDataControl: function () {
            var ph = $('<div class="data_control_placeholder" style="height:0; overflow:hidden;"></div>'), fixer = $('<div class="data_control_fixed_wrap"></div>');
            this.wrap = $(this.dt.nTableWrapper);
            // 数据控制区域
            this.control = this.wrap.find('> .datatable_control');
            // 加入占位符
            this.control.after(ph);
            // 缓存占位符元素
            this.control.ph = ph;
            // 缓存高度
            this.control.height = this.control.outerHeight();
            // 加入固定元素
            this.control.after(fixer);
            // 缓存固定元素
            this.control.fixer = fixer;
        },
        // 重新计算高度
        recalcHeight: function () {
            //如果有横向滚动条则判断滚动条高度
            var scrollBarHeight = this.body.parent().height() - this.body.parent()[0].clientHeight
            var top = this.body.offset().top, h = this.body.height() + scrollBarHeight, inh = document.documentElement.clientHeight, // 视窗高度
                controlHeight = this.control.height, barOffset = this.dt.nTable.isOverflow ? this.dt.oScroll.iBarWidth : 0, sct, scl;
            if (typeof window.pageYOffset != 'undefined') {
                sct = window.pageYOffset;
                scl = window.pageXOffset;
            } else if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
                sct = document.documentElement.scrollTop;
                scl = document.documentElement.scrollLeft;
            } else if (typeof document.body != 'undefined') {
                sct = document.body.scrollTop;
                scl = document.body.scrollLeft;
            }
            if (this.isFixedColumns) {
                var fixColDom = this.dt.oFixedColumns.dom.grid
                var iHeight = $(fixColDom.dt).height()
                if ($(fixColDom.wrapper).height() != iHeight) {
                    fixColDom.wrapper.style.height = iHeight + "px"
                    fixColDom.left.wrapper.style.height = iHeight + "px"
                }
            }
            // 判断 datatable 是否出现在用户可视范围内且未显示完全
            if (sct + inh < top + h + barOffset + controlHeight && sct + inh - top > 0) {
                if ($(this.body).is(":hidden")) {
                    return
                }
                // 如果条件成立，则设置元素高度
                with (this.body.parent()[0]) {
                    style.height = sct + inh - top - controlHeight + "px"
                    style.overflowY = "hidden"
                }
                /*this.body.parent().css({
                 'overflow-y': 'hidden',
                 "height": sct + inh - top - controlHeight + "px"
                 });*/
                this.body.ph[0].style.height = (top + h) - (sct + inh) + controlHeight + "px";
                // 占位符高度定义
                this.control.fixer[0].style.cssText = 'width:' + this.wrap.width() + 'px;left:' + (this.wrap.offset().left - scl + 1) + 'px;height:' + controlHeight + 'px;bottom:' + (sct + inh - top - controlHeight > 0 ? 0 : sct + inh - top - controlHeight) + "px;"
                this.control.fixer.append(this.control).show();
                this.control.ph[0].style.height = this.control.height + "px";
                // 固定列的高度定义
                if (this.isFixedColumns) {
                    this.fixColBody.dom.parent()[0].style.height = sct + inh - top - barOffset - this.control.height + "px"
                    this.fixColBody.ph[0].style.height = (top + h) - (sct + inh) + barOffset + this.control.height + "px";
                }
            } else {
                var par = this.body.parent();
                // 条件不成立，恢复元素默认高度
                if (par[0].style && par[0].style.height) {
                    par.height('auto');
                }
                this.body.ph.height(0);
                this.control.ph.before(this.control);
                this.control.ph.height(0);
                this.control.fixer.css({
                    height: "0px",
                    display: "none"
                });
                if (this.isFixedColumns) {
                    this.fixColBody.dom.parent().height('auto');
                    this.fixColBody.ph.height(0);
                }
            }
        },
        // 事件绑定
        bindEvent: function () {
            var that = this, key = this.dt.sTableId;
            $(window).on('scroll.AdaptiveScroller.' + key + ' resize.AdaptiveScroller.' + key, function () {
                var table = $('#' + key);
                if (table.length === 0) {
                    that.destroy();
                    return;
                }
                that.recalcHeight.apply(that);
            });
        },
        // 注销
        destroy: function () {
            //var key = this.dt.sTableId + this.markIdx;
            // 移除相关占位元素
            this.body.ph.remove();
            this.control.ph.remove();
            this.control.fixer.remove();
            // 注销相关绑定事件
            //$(window).off('.' + this.dt.sTableId);
            // 移除实例与函数缓存数据
            //delete AdaptiveScroller.handler[key];
            // delete AdaptiveScroller.instance[key];
        }
    };
    return AdaptiveScroller;
});
/**
 * @class   Pzoom.Plugin.FixedHeader
 * datatable 插件。
 *
 * 头部区域与工具栏区域在超出可视区域时固定在头部显示
 *
 * @cfg     {Object}    dt  创建 DataTable 后返回的对象
 */
Pzoom.define('Pzoom.Plugin.FixedHeader', function () {
    var FixedHeader = function (dt) {
        if (!dt || !dt.fnSettings) {
            throw new Error('请传递正确的 datatable 对象！');
        }
        // datatable属性
        this.dt = dt.fnSettings();
        // 是否拥有固定列
        this.isFixedColumns = !!this.dt.oFixedColumns;
        // 缓存当前实例
        this.dt.oFixedHeader = this;
        // 初始化
        this.init();
    };
    // 实例化集合
    //FixedHeader.instance = {};
    // 事件集合
    //FixedHeader.handler = {};
    // 列表标示索引
    //FixedHeader.markIdx = 0;
    FixedHeader.prototype = {
        // 初始化
        init: function () {
            //var idx = FixedHeader.markIdx++,
            var tableId = this.dt.sTableId//, key = this.dt.sTableId + idx;
            //this.markIdx = idx;
            //$('#' + this.dt.sTableId).attr('fixedheaderidx', idx);
            // 缓存实例
            //FixedHeader.instance[key] = this;
            // 缓存窗口滚动 或 窗口改变尺寸时重绘函数
            /*FixedHeader.handler[key] = function (e) {
             // 验证在列表元素移除 或 元素被替换的时候自动注销全局绑定事件
             var table = $('#' + tableId);
             if (table.length === 0 || table.attr('fixedheaderidx') !== (idx + '')) {
             FixedHeader.instance[key].destroy();
             return;
             }
             if (e.type === 'resize') {
             FixedHeader.instance[key].fixed = false;
             }
             FixedHeader.instance[key].fixedDom();
             }*/
            // 创建占位符
            this.createPhByHead();
            this.createPhByToolbar();
            this.bindEvent();
            this.fixedDom();
        },
        // 创建 datatable head 部分占位符
        createPhByHead: function () {
            var phHtml = '<div class="scrollHead_placeholder" style="height:0; overflow:hidden;"></div>', fixHtml = '<div class="scrollHead_fixed_wrap"><div class="shadow_mask" style="display: block;position: static"></div></div>', dom;
            // 缓存表格主体信息
            this.body = $(this.dt.nTable);
            // 缓存 head 信息
            this.header = $(this.dt.nScrollHead);
            // 加入定位元素
            dom = $(fixHtml);
            this.header.before(dom);
            // 缓存定位元素
            this.header.fixer = dom;
            // 加入占位符
            dom = $(phHtml);
            this.header.before(dom);
            // 缓存占位符元素
            this.header.ph = dom;
            if (this.isFixedColumns) {
                this.fixColHead = $(this.dt.oFixedColumns.dom.clone.left.header).parent();
                // 加入定位元素
                dom = $(fixHtml);
                this.fixColHead.before(dom);
                this.fixColHead.fixer = dom;
                // 站如占位符
                dom = $(phHtml);
                this.fixColHead.before(dom);
                this.fixColHead.ph = dom;
                this.fixColHead.parent().find(".shadow_mask:first").remove()
                this.shadow_mask = this.body.parent().parent().find(".shadow_mask")
                this.table_wraper = $("#" + this.dt.sTableId + "_wrapper")
                this.shadow_mask.css(
                    {
                        marginLeft: this.table_wraper.offset().left - this.header.offset().left,
                        width: this.table_wraper.width()
                    }
                )
            }
        },
        // 创建 toolbar 部分占位符
        createPhByToolbar: function () {
            var phHtml = '<div class="datatable_toolbar_placeholder" style="height:0; overflow:hidden;"></div>', fixHtml = '<div class="datatable_toolbar_fixed_wrap"></div>', dtWrap = $(this.dt.nTableWrapper), toolbar = dtWrap.closest('.datatable_wrap_zone').find('.datatable_toolbar'), dom;
            // 缓存 toolbar 信息
            if (toolbar.length > 0) {
                this.toolbar = toolbar;
                this.toolbar[0]._nextNode = toolbar.next();
                this.toolbar[0]._parentNode = toolbar.parent();
            } else {
                return;
            }
            // 加入占位符
            dom = $(fixHtml);
            this.toolbar.after(dom);
            // 缓存占位符信息
            this.toolbar.fixer = dom;
            // 加入占位符
            dom = $(phHtml);
            this.toolbar.after(dom);
            // 缓存占位符信息
            this.toolbar.ph = dom;
        },
        // 固定元素
        fixedDom: function () {
            if (this.isFixedColumns) {
                if (this.shadow_mask.width != this.table_wraper.width()) {
                    this.shadow_mask.css(
                        {
                            marginLeft: this.table_wraper.offset().left - this.header.offset().left,
                            width: this.table_wraper.width()
                        }
                    )
                }
                this.table_wraper.find(".selectTips").width(this.table_wraper.width())
            }

            var toolbarHeight = 0, top = 0, scl, sct;
            if (this.toolbar) {
                toolbarHeight = this.toolbar.outerHeight();
                if (this.fixed) {
                    top = this.toolbar.ph.offset().top;
                } else {
                    top = this.toolbar.offset().top;
                }
            } else {
                if (this.fixed) {
                    top = this.header.ph.offset().top;
                } else {
                    top = this.header.offset().top - 1;
                }
            }
            var headerHeight = this.header.outerHeight(), h = toolbarHeight + headerHeight + this.body.height(), inh = window.innerHeight
            // 获取滚动条高度
            if (typeof window.pageYOffset != 'undefined') {
                sct = window.pageYOffset;
                scl = window.pageXOffset;
            } else if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
                sct = document.documentElement.scrollTop;
                scl = document.documentElement.scrollLeft;
            } else if (typeof document.body != 'undefined') {
                sct = document.body.scrollTop;
                scl = document.body.scrollLeft;
            }
            if (sct >= top && sct < top + h) {
                if ($(this.body).is(":hidden")) {
                    return
                }
                var fixBarHeight = toolbarHeight + headerHeight, offTop = 0;
                if (top + h - sct <= fixBarHeight) {
                    offTop = fixBarHeight - (top + h - sct);
                }
                // 是否已经将元素固定
                // 是否滚动了横向滚动条
                if (!this.fixed || this.scrollX !== scl || this.lastOffTop > 0 || offTop > 0 || toolbarHeight - offTop != this.header.fixer.offset().top) {
                    if (this.toolbar) {
                        // 固定工具栏
                        var toolbarWidth = this.toolbar.ph.width(), toolbarLeft = this.toolbar.ph.offset().left;
                        if (!this.fixed) {
                            this.toolbar.fixer[0].style.cssText = 'left:' + (toolbarLeft - scl) + 'px;top:' + (0 - offTop) + 'px;width:' + toolbarWidth + 'px;height:' + toolbarHeight + 'px;'
                            this.toolbar.fixer.append(this.toolbar).show();
                        }
                        this.lastOffTop = offTop;
                        // 设置工具栏占位符高度，避免滚动条跳动
                        this.toolbar.ph[0].style.height = toolbarHeight + "px";
                    }
                    // 固定头部区域
                    var headerWidth = this.header.ph.width(), headerLeft = this.header.ph.offset().left, headerScl = this.header.scrollLeft();
                    if (!this.fixed) {
                        this.header.fixer[0].style.cssText = 'left:' + (headerLeft - scl) + 'px;top:' + (toolbarHeight - offTop) + 'px;width:' + headerWidth + 'px;height:' + headerHeight + 'px;'
                        this.header.fixer.prepend(this.header).show();
                    }
                    // 设置头部区域占位符高度，避免滚动条跳动
                    this.header.ph[0].style.height = headerHeight + "px";
                    // 还原滚动距离
                    this.header.scrollLeft(headerScl);
                    // 如果有固定列选项
                    if (this.isFixedColumns) {
                        // 固定列的头部区域做固定操作
                        var fixColHeaderWidth = this.fixColHead.ph.width(), fixColHeadLeft = this.fixColHead.ph.offset().left;
                        if (!this.fixed) {
                            this.fixColHead.fixer[0].style.cssText = 'left:' + (fixColHeadLeft - scl) + 'px;top:' + (toolbarHeight - offTop) + 'px;width:' + fixColHeaderWidth + 'px;height:' + headerHeight + 'px;'
                            this.fixColHead.fixer.append(this.fixColHead).show();
                        }
                        // 设置头部区域占位符高度，避免滚动条跳动
                        this.fixColHead.ph[0].style.height = headerHeight + "px";
                    }
                    // 保存当前横向滚动距离
                    this.scrollX = scl;
                    // 保存固定状态
                    this.fixed = true;
                }
            } else {
                if (this.header.parent()[0] === this.header.fixer[0] && this.fixed) {
                    if (this.toolbar) {
                        // 解除固定工具栏
                        this.toolbar.ph.height(0);
                        this.toolbar.ph.before(this.toolbar);
                        this.toolbar.fixer[0].style.display = "none";
                    }
                    // 解除固定头部区域
                    var headerScl = this.header.scrollLeft();
                    this.header.ph.height(0);
                    this.header.ph.before(this.header);
                    this.header.fixer[0].style.display = "none";
                    // 还原滚动距离
                    this.header.scrollLeft(headerScl);
                    // 解除固定列的头部固定区域
                    if (this.isFixedColumns) {
                        this.fixColHead.ph.height(0);
                        this.fixColHead.ph.before(this.fixColHead);
                        this.fixColHead.fixer[0].style.display = "none";
                    }
                }
                this.fixed = false;
            }
        },
        // 事件绑定
        bindEvent: function () {
            var that = this, key = this.dt.sTableId// + this.markIdx;
            $(window).on('scroll.FixedHeader.' + key + ' resize.FixedHeader.' + key, function (e) {
                var table = $('#' + key);
                if (table.length === 0) {
                    that.destroy();
                    return;
                }
                if (e.type === 'resize') {
                    that.fixed = false;
                }
                that.fixedDom.apply(that);
            });
            // 加载数据绘制完成时计算，固定头部区域
            this.dt.aoDrawCallback.push({
                "fn": function () {
                    that.fixedDom();
                },
                "sName": "FixedHeader"
            });
        },
        // 注销
        destroy: function () {
            //var key = this.dt.sTableId// + this.markIdx;
            // 移除相关占位元素
            this.header.fixer.remove();
            this.header.ph.remove();
            if (this.toolbar) {
                if (this.toolbar[0]._nextNode) {
                    $(this.toolbar[0]._nextNode).before(this.toolbar);
                } else {
                    $(this.toolbar[0]._parentNode).append(this.toolbar);
                }
                this.toolbar.fixer.remove();
                this.toolbar.ph.remove();
            }
            if (this.isFixedColumns) {
                this.fixColHead.fixer.remove();
                this.fixColHead.ph.remove();
            }
            // 注销相关绑定事件
            //$(window).off('.' + key);
            // 移除实例与函数缓存数据
            //delete FixedHeader.handler[key];
            //delete FixedHeader.instance[key];
        }
    };
    return FixedHeader;
});
$.fn.dataTableExt.oSort['numeric-comma-asc'] = function (a, b) {
    a += '';
    b += '';
    var tagPattern = new RegExp('(\<.*?\>)|%|' + $.t('M').replace(/\$/g, '\\$') + '|,', 'g');
    a = a.replace(tagPattern, '');
    b = b.replace(tagPattern, '');
    var x = (a == "-") ? Infinity : a;
    var y = (b == "-") ? Infinity : b;
    x = parseFloat(x);
    y = parseFloat(y);
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
};
$.fn.dataTableExt.oSort['numeric-comma-desc'] = function (a, b) {
    a += '';
    b += '';
    var tagPattern = new RegExp('(\<.*?\>)|%|' + $.t('M').replace(/\$/g, '\\$') + '|,', 'g');
    a = a.replace(tagPattern, '');
    b = b.replace(tagPattern, '');
    var x = (a == "-") ? -Infinity : a;
    var y = (b == "-") ? -Infinity : b;
    x = parseFloat(x);
    y = parseFloat(y);
    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
};
/**
 * @class   jQuery.Plugin
 */
/**
 * @method
 * dataTable 的自定义封装，支持可选的固定列。
 *
 * 支持 {@link Pzoom.Plugin.AdaptiveScroller 内容部分高度自适应} 功能。
 *
 * 支持 {@link Pzoom.Plugin.FixedHeader 固定头部与工具栏区域} 功能。
 *
 * @param   {Object}    options
 * dataTable默认选项。参考：[http://datatables.net/usage/](http://datatables.net/usage/)
 * @param   {Object}    [custom]                        自定义选项
 * @param   {boolean}   [custom.hasFixedColumns]        是否有固定列选项
 * @param   {boolean}   [custom.hasFixedHeader=true]    是否有固定头部功能
 * @param   {boolean}   [custom.hasAdaptive=true]       是否有自适应高度功能
 * @param   {boolean}   [custom.hasFooter=true]         是否有底部分页与信息区域
 * @param   {boolean}   [custom.emptyMsg=null]          数据位空时，要显示的内容
 * @param   {number}    [custom.iLeftColumns]           左侧固定多少列
 * @param   {number}    [custom.getCountInfo]           如果数据统计信息与数据列表信息分开请求，则需要设置这里的对应参数来自动更新页码
 * @param   {string}    custom.getCountInfo.url         获取页码的URL
 * @param   {string}    [custom.getCountInfo.network]   请求网络类型
 * @param   {string}    [custom.getCountInfo.webType]   请求的服务类型
 * @param   {Object}    [custom.getCountInfo.params]    请求参数。__如果有 custom.getCountInfo.getParams 传递则请求是不会使用该参数作为请求参数__
 * @param   {Function}  [custom.getCountInfo.getParams] 请求参数的调用方法，需要返回所要请求的参数对象。调用时会传入 aoData 作为参数
 * @param   {Object}    [custom.getCountInfo.getParams.return]  所要请求的参数对象
 * @param   {HTMLElement}   [custom.batchOperater]      批量操作区域
 * @param   {boolean}   [custom.canCheckAll=false]      是否可以选择所有数据
 * @param   {Array}   [custom.checkAllEnable=["export"]]      跨页全选后启用的批量操作按钮列表
 * @return  {Object}    创建 dataTable 后的返回对象
 * @return  {Function}  return.customDestroy
 * 注销事件。调用此方法会注销掉 AdaptiveScroller 与 FixedHeader 所生成的事件绑定与静态内容
 */
$.fn.customDataTable = function (options, custom) {
    // 默认设置
    var o = {
        bDestroy: true,
        sScrollX: '100%',
        // sScrollXInner: '100%',
        sDom: 't<"datatable_control"lip>',
        iDisplayLength: 25,
        oLanguage: {
            sLengthMenu: $.t('_datatable.sLengthMenu'),
            sZeroRecords: $.t('noData'),
            sInfo: $.t('_datatable.sInfo'),
            sInfoEmpty: $.t('_datatable.sInfoEmpty'),
            sInfoFiltered: $.t('_datatable.sInfoFiltered'),
            sInfoPostFix: '',
            sSearch: $.t('search'),
            sUrl: '',
            oPaginate: {
                sFirst: $.t('firstPage'),
                sPrevious: $.t('prevPage'),
                sNext: $.t('nextPage'),
                sLast: $.t('lastPage')
            }
        },
        emptyMsg: null,
        bFilter: false,
        bLengthChange: true,
        bPaginate: true,
        bSort: false,
        aaSorting: [],
        bServerSide: false
    };
    // 自定义设置默认参数
    var customOptions = {
        hasFixedHeader: true,
        hasAdaptive: true,
        hasFooter: true,
        canCheckAll: false,
        iLeftColumns: 0
    };
    // 没有传递任何参数时，返回datatable调用对象
    if (arguments.length === 0) {
        return $(this).dataTable();
    }
    // 载入用户自定义设置
    $.extend(o, options);
    $.extend(customOptions, custom);
    // 隐藏底部分页与翻页信息
    if (!customOptions.hasFooter) {
        o.sDom = 't';
    }
    var _hasFixedColumns = false
    var preDrawFn = o.fnPreDrawCallback, drawedFn = o.fnDrawCallback, rowFn = o.fnRowCallback
    if (customOptions.iLeftColumns > 0) {
        _hasFixedColumns = true
        delete o.fnRowCallback
    }
    if (!o.fnServerData) {
        for (var i = 0; i < customOptions.iLeftColumns; i++) {
            o.aoColumns[i].bVisible = false
            o.aoColumns[i].bFixed = true
        }
    }

    // datatable 列表区域表示类容错
    if ($(this).closest('.datatable_wrap_zone').length === 0) {
        $(this).parent().addClass('datatable_wrap_zone');
    }
    var fixedColumnOptions = {},  // 固定列选项
        oldInitFn = o.fnInitComplete;
    // 如果需要固定列
    if (customOptions.iLeftColumns > 0) {
        // 左侧固定列数
        fixedColumnOptions.iLeftColumns = customOptions.iLeftColumns;
        // 左侧固定列的宽度
        if (customOptions.iLeftWidth) {
            fixedColumnOptions.iLeftWidth = customOptions.iLeftWidth;
        }
    }
    // 缓存批量操作
    var operatZone = $(customOptions.batchOperater), mask, operatBtns;
    //向批量操作插件传递datatable对象
    if (operatZone.length > 0) {
        operatZone.data("datatable", this);
        operatZone.customToolTips();
    }
    var tips = $("<div class='selectTips' style='display:none'></div>");
    var tipsHolder = $("<div class='selectTips' style='display:none'></div>");
    // 添加批量操作遮罩层，并保证只添加一次
    /*if (operatZone.length > 0) {
     // 获取定位信息
     if (!/^relative|absolute$/.test(operatZone.css('position'))) {
     operatZone.css('position', 'relative');
     }
     // 移除ID字段
     operatBtns = operatZone.html().replace(/\sid\=(['"])[^\s]+?\1/g, '').replace(/\stype\=(['"])[^\s]+?\1/g, '').replace(/\>\s+\</g, '><');
     operatBtns = $(operatBtns);
     operatBtns.find('.dropdown_btn').each(function () {
     $(this).closest('.table_item_operate').css('visibility', 'hidden');
     });
     // operatBtns.css('opacity', 0);
     // 遮罩层
     mask = $('<div class="batch_operat_mask" style="white-space:nowrap; opacity:0; ' + (Pzoom.Browser.isIE8 ? 'filter:alpha(opacity=0);' : '') + '"></div>');
     mask.append(operatBtns);
     // 添加遮罩层
     operatZone.append(mask);
     // 弹窗定义
     operatZone.customToolTips();
     }*/
    // 固定列回调函数
    function fixedColumnCbFn(oSettings, json) {
        if (!oSettings.oFixedColumns) {
            return;
        }
        // 获取固定列的数据行与内容列表数据的数据行
        var rows = $('tbody tr', oSettings.oFixedColumns.dom.grid.left.body), bodyRows = $(oSettings.nTBody).find("td"), len = rows.length, i;
        if (len === 0) {
            return;
        }
        // 固定列每条数据事件绑定
        rows.hover(function (e) {
            var id = $(e.currentTarget).attr("id")
            $("#" + id.replace("_ltr_", "_rtr_")).addClass('rollover_row');
        }, function (e) {
            var id = $(e.currentTarget).attr("id")
            $("#" + id.replace("_ltr_", "_rtr_")).removeClass('rollover_row');
        });
        // 内容列表数据每条数据事件绑定
        bodyRows.hover(function (e) {
            var id = $(e.currentTarget).parent().attr("id")
            $("#" + id.replace("_rtr_", "_ltr_")).addClass('rollover_row');
        }, function (e) {
            var id = $(e.currentTarget).parent().attr("id")
            $("#" + id.replace("_rtr_", "_ltr_")).removeClass('rollover_row');
        });
        // 绑定每行事件
        for (i = 0; i < len; i++) {
            // 列固定每行回调
            if (typeof rowFn === 'function') {
                var rRow = $("#" + oSettings.sTableId + "_rtr_" + i), lRow = $("#" + oSettings.sTableId + "_ltr_" + i)
                rowFn.call(this, rRow.add(lRow), oSettings.aoData[i] && oSettings.aoData[i]._aData, lRow, rRow);
            }
        }

        // 设置全选复选框
        oSettings.nAllCk = $('input.select_all_ck', oSettings.oFixedColumns.dom.grid.left.head);
        // 设置复选列表
        oSettings.nCheckList = $('input.select_item_ck', oSettings.oFixedColumns.dom.grid.left.body).not('[disabled]');
        // 绑定全选复选框 change 事件

        bindCkAllChange(oSettings);
        // 绑定复选框change事件
        bindCkListChange(oSettings);
        // 列固定回调
        if (typeof drawedFn === 'function') {
            drawedFn.call(this, oSettings, json);
        }
    }

    function clearCheck(oSettings) {
        with (tips[0]) {
            innerHTML = "";
            style.display = "none";
        }
        tipsHolder[0].style.display = "none"//.hide()
        $(window).trigger("scroll." + oSettings.sTableId)
        if (customOptions.canCheckAll) {
            $(oSettings.nTable).data("checkAll", false);
        }
    }

    function showCheckTips(oSettings) {
        //debugger
        var cklist = oSettings.nCheckList.filter(":checked");
        var recordsCount = oSettings._iRecordsTotal;
        var canCheckall = customOptions.canCheckAll
        if (canCheckall === "none") {
            return false
        }
        if (recordsCount <= oSettings._iDisplayLength) {
            canCheckall = false
        }
        // 根据全选状态改变列表选择状态
        if (cklist.length == 0) {
            clearCheck(oSettings)
            return false
        }
        if (oSettings._iRecordsTotal == -1) {
            recordsCount = oSettings.aoData.length;
        }
        operatZone.batchOperate("enable");
        var selectAll = function (all) {
            tipsHolder[0].style.display = "block"
            tips.html($.t('_datatable.selall', {
                count: Pzoom.Tool.getValueByRule(all, '_VAL_')
            })).find("a.clearall").one("click", function () {
                oSettings.nAllCk.prop('checked', false).change();
            }).end().find("a.selectpage").one("click", function () {
                //oSettings.nAllCk.prop('checked', false).change();
                $(oSettings.nTable).data("checkAll", false);
                showCheckTips(oSettings)
            }).end()[0].style.display = "block";
            $(oSettings.nTable).data("checkAll", true);
            // 选择所有时禁用批量操作某些按钮
            operatZone.batchOperate("disable").batchOperate("enable", ["export"].concat(customOptions.checkAllEnable));
        }
        if (cklist.length == recordsCount && canCheckall) {
            selectAll(recordsCount)
        } else {
            tipsHolder[0].style.display = "block"
            tips.html($.t('_datatable.seltip', {
                count: cklist.length
            }) + (canCheckall ? $.t('_datatable.selother', {
                count: cklist.length,
                all: Pzoom.Tool.getValueByRule(recordsCount, '_VAL_')
            }) : "") + $.t('_datatable.clear')).find("a.selectall").one("click", function () {
                oSettings.nAllCk.prop('checked', true).change();
                selectAll(recordsCount)
            }).end().find("a.clearall").one("click", function () {
                oSettings.nAllCk.prop('checked', false).change();
            }).end()[0].style.display = "block"
            $(oSettings.nTable).data("checkAll", false);
        }
        $(window).trigger("scroll." + oSettings.sTableId)
    }

    function checkChangeHandle(e) {
        var tr = $(this).closest('tr'), unCkd = e.data.oSettings.nCheckList.not(':checked');
        var bodyTr = _hasFixedColumns ? $("#" + tr.attr("id").replace("_ltr_", "_rtr_")) : $();
        // 根据选择状态变换行颜色
        // 根据选择条目总数，改变全选状态
        if (this.checked) {
            tr.add(bodyTr).addClass('checked_tr');
            if (unCkd.length === 0) {
                e.data.oSettings.nAllCk.prop('checked', true);
            } else {
                e.data.oSettings.nAllCk.prop('checked', false);
            }
            // 启用批量操作按钮
            operatZone.batchOperate("enable");
            //operatZone.css('opacity', 1);
            //operatMask.hide();
        } else {
            tr.add(bodyTr).removeClass('checked_tr');
            e.data.oSettings.nAllCk.prop('checked', false);
            if (unCkd.length === e.data.oSettings.nCheckList.length) {
                //operatZone.css('opacity', 0.5);
                //operatMask.show();
                // 禁用批量操作按钮
                operatZone.batchOperate("disable");
            }
        }
        showCheckTips(e.data.oSettings)
    }

    function checkAllChangeHandle(e) {
        var cklist = e.data.oSettings.nCheckList;
        if (this.checked) {
            cklist.prop('checked', true);
            operatZone.batchOperate("enable");
            // 全选提示
        } else {
            operatZone.batchOperate("disable");
            cklist.prop('checked', false);
        }
        showCheckTips(e.data.oSettings)
        var ckd = this.checked;
        // 改变当前页所有选项
        $(cklist).each(function (idx, ck) {
            var tr = $(ck).closest('tr');
            var bodyTr = _hasFixedColumns ? $("#" + tr.attr("id").replace("_ltr_", "_rtr_")) : $();
            // 改变选中状态
            ck.checked = ckd;
            // 标示不同类
            if (ckd) {
                tr.add(bodyTr).addClass('checked_tr');
            } else {
                tr.add(bodyTr).removeClass('checked_tr');
            }
        });
    }

    // 绑定复选框 change 事件
    function bindCkListChange(oSettings, bodyRows) {
        // 是否选择了所有
        var ckdAll = $(oSettings.nTable).data("checkAll");
        // 选择所有状态恢复
        if (ckdAll) {
            oSettings.nAllCk.prop('checked', true);
        } else {
            oSettings.nAllCk.prop('checked', false);
        }
        // 列表选中复选框绑定切换事件
        oSettings.nCheckList.off("change", checkChangeHandle).on("change", {oSettings: oSettings}, checkChangeHandle).prop('checked', false)

    }


    // 绑定全选复选框 change 事件
    function bindCkAllChange(oSettings) {

        // 验证全选是否可用
        if (oSettings.nCheckList.length === 0 && customOptions.canCheckAll) {
            oSettings.nAllCk.attr('disabled', 'disabled');
        } else {
            oSettings.nAllCk.removeAttr('disabled');
            //oSettings.nAllCk.each(function (idx, ck) {
            // 避免重复绑定
            /*if (ck.checkAllBinded) {
             return;
             }*/
            // 全选事件绑定
            oSettings.nAllCk.off("change", checkAllChangeHandle).on("change", {oSettings: oSettings}, checkAllChangeHandle);
            // 全选标示
            //ck.checkAllBinded = true;
            // });
        }
    }

    // 列表初始化回调
    o.fnInitComplete = function (oSettings, json) {
        if (typeof oldInitFn === 'function') {
            oldInitFn.apply(this, arguments);
        }
        // 固定列
        if (customOptions.iLeftColumns > 0) {
            fixedColumnOptions.binded = !o.bServerSide
            var fix = new FixedColumns(this, fixedColumnOptions);
            fixedColumnCbFn(oSettings, json);
        }
        // datatable 高度自适应
        if (customOptions.hasAdaptive) {
            oSettings.pluginAdaptive = new Pzoom.Plugin.AdaptiveScroller(this);
            if (customOptions.iLeftColumns > 0) {
                // 配置固定列绘制完成后调用函数
                oSettings.oFixedColumns.s.fnDrawCallback = function (left, right, newJson) {
                    var adaptive = oSettings.pluginAdaptive;
                    adaptive.fixColBody.dom = $(adaptive.dt.oFixedColumns.dom.clone.left.body);
                    adaptive.recalcHeight();
                    adaptive.fixColBody.dom.find('.checked_tr').removeClass('checked_tr');
                    fixedColumnCbFn(oSettings, newJson);
                }
            }
        }
        // datatable 固定头部信息
        if (customOptions.hasFixedHeader) {
            oSettings.pluginFixedHeader = new Pzoom.Plugin.FixedHeader(this);
        }

        if (_hasFixedColumns) {
            $(oSettings.nTHead).closest(".dataTables_scrollHeadInner").append(tipsHolder);
            oSettings.oFixedHeader && $(oSettings.oFixedHeader.fixColHead).append(tips)
            tips[0].style.width = $(oSettings.nTableWrapper).width()
            fix.fnRefresh()
        } else {
            $(oSettings.nTHead).closest(".dataTables_scrollHeadInner").append(tips);
        }
        if (oSettings._iRecordsTotal == -1) {
            oSettings._iRecordsTotal = oSettings.aoData.length
        }
        oSettings.nAllCk.attr("title", $.t("selectAll"))
        if (customOptions.canCheckAll) {
            var helpBtn = $('<a class="help_icon" style="position: absolute" title="' + $.t("_datatable.checkhelp") + '" href="javascript:void(0)">' + $.t("_manager.help") + '</a>')
            oSettings.nAllCk.after(helpBtn)
            var button = {}, helpHtml = "<div style='padding:20px 0 10px 20px'><div style='margin:0 0 20px 0;width: 720px;height: 155px;display: block'><img id='checkAllHelp' src=''/></div><div><div  style='font-size:14px;color:#666'>" + $.t("_datatable.checkhelpText1") + "</div><div style='color:#aaa;margin-top: 15px'>" + $.t("_datatable.checkhelpText2") + "</div><div style='color:#aaa'>" + $.t("_datatable.checkhelpText3") + "</div></div></div>"
            button[$.t("iknow")] = "ok"
            helpBtn.click(function () {
                $.jBox(helpHtml, {
                    width: Pzoom.Config.language == "en" ? 780 : 740,
                    buttons: button,
                    title: "<span style='color:#4084ee'>" + $.t("_datatable.checkhelp") + "</span>",
                    loaded: function () {
                        $("#checkAllHelp").attr("src", "images/check_all_help_" + Pzoom.Config.language.toLowerCase() + ".gif")
                    }
                })
            })
        }
        oSettings.fix = fix
        oSettings.oInstance.fnAdjustColumnSizing(false)
        $(oSettings.nTableWrapper).customToolTips()
    };
    var getDataFn;
    // 如果是从服务器获取参数
    if (o.fnServerData) {
        o.bServerSide = true;
        // 如果列表统计信息与列表数据相分离，则分开请求
        if (o.bServerSide && o.fnServerData && customOptions.getCountInfo) {
            getDataFn = o.fnServerData;
            o.fnServerData = function (sSource, aoData, fnCallback, oSettings) {
                $(window).resize()
                oSettings._isGetCountInfo = true;
                var scope = customOptions.scope || Pzoom.Static.CONTENT_BOX_ID, getCountInfo = customOptions.getCountInfo, webType = getCountInfo.webType || 'sem', countParams = typeof getCountInfo.getParams === 'function' ? getCountInfo.getParams(aoData, oSettings) : getCountInfo.params, displayLength = countParams.iDisplayLength, displayStart = countParams.iDisplayStart, dir = countParams.sSortDir_0;
                requestParams = oSettings.requestParams;
                // 暂时移除相关分页信息
                delete countParams.iDisplayLength;
                delete countParams.iDisplayStart;
                delete countParams.sSortDir_0;
                // 如果noCount为false,并且翻页参数与数据请求参数不完全相同;
                if (!oSettings.noCount) { // && !_.isEqual(requestParams, countParams) 暂时取消参数相同不发送翻页请求问题;
                    delete oSettings.isDrawed;
                    $('#' + oSettings.sTableId + '_info').html('<img src="/images/search_loading.gif" title="loading..." />');
                    // 缓存请求参数
                    oSettings.requestParams = _.clone(countParams);
                    // 重置分页信息
                    oSettings._iRecordsTotal = -1;
                    oSettings._iRecordsDisplay = -1;
                    // 设置分页与排序参数
                    countParams.iDisplayLength = displayLength;
                    countParams.iDisplayStart = displayStart;
                    countParams.sSortDir_0 = dir;
                    // 请求统计信息
                    Pzoom.ajax({
                        url: getCountInfo.url,
                        params: countParams,
                        network: getCountInfo.network,
                        webType: webType,
                        success: function (json) {
                            var paging = json.paging;
                            delete oSettings._isGetCountInfo;
                            // 如果有统计信息，并且列表信息已经获取到，则重新绘制
                            if (paging) {
                                oSettings._iRecordsTotal = paging.totalActuals;
                                oSettings._iRecordsDisplay = paging.totalRecords;
                                // 如果已经加载数据，则重绘
                                if (oSettings.isDrawed && !oSettings._hasErrorMessage) {
                                    // 加载统计信息标示
                                    oSettings._loadCountInfo = true;
                                    fnCallback(json);
                                }
                            }
                        }
                    });
                }
                // 原有数据获取函数
                getDataFn.apply(this, arguments);
            };
        }
    }
    // 绘制前加载loading状态
    o.fnPreDrawCallback = function (oSettings) {
        var ti;
        // 初始化隐藏列固定所包含的列数
        if (customOptions.iLeftColumns && !oSettings.initedTable) {
            for (ti = 0; ti < customOptions.iLeftColumns; ti++) {
                oSettings.aoColumns[ti].bVisible = false;
                oSettings.aoColumns[ti].bFixed = true;
            }
            oSettings.initedTable = true;
        }
        var bodyNode = $(oSettings.nTBody).closest('.dataTables_scrollBody'), tableId = oSettings.sTableId, scrollByObj;
        // 禁用批量操作区域按钮
        operatZone.batchOperate("disable");
        // 遮罩层显示
        //operatZone.find('> .batch_operat_mask').show();
        if ($('#dataTableLoadingMask_' + tableId).length === 0) {
            if (!oSettings.isDrawed) {
                $(oSettings.nTable).parent().height(100);
            }
            $(oSettings.nTableWrapper).show();
            // 移除错误信息界面
            $('#dataTableMessageBy_' + tableId).remove();
            // 遮罩层添加
            bodyNode.append('<div class="loading_mask" id="dataTableLoadingMask_' + tableId + '" style="position:absolute; z-index:11; left:0; top:0; bottom:0; width:100%;"></div>');
            // loading状态添加
            $(oSettings.nTableWrapper).append('<div class="loading_info" id="dataTableLoading_' + tableId + '"><img src="/images/loading_big.gif" alt="" style="margin-right:10px;" />' + $.t('dataLoading') + '</div>');
            // 自适应loading位置元素
            scrollByObj = Pzoom.Global['dataTableLoadingAdaptBy_' + tableId] = {};
            // loading效果实时定位
            scrollByObj.fn = function () {
                // 延迟0秒，修正获取定位错误问题
                scrollByObj.timer = setTimeout(function () {
                    var loadingMask = $('#dataTableLoadingMask_' + oSettings.sTableId), dataBody = loadingMask.parent(), dataBodyHeight = dataBody.height(), offTop = dataBody.closest('.datatable_wrap_zone').offset(), scrollTop = $(window).scrollTop(), topGap = 0, headerHeight = 0, toolbarHeight = 0, pos;
                    // 验证加载状态是否已加载完成
                    if (loadingMask.length === 0) {
                        return;
                    }
                    // 动态设置loading的宽度
                    loadingMask.width(loadingMask.prev()[0].scrollWidth);
                    // 修正loading图标位置
                    if (document.documentElement.offsetHeight + scrollTop - dataBody.offset().top < 70) {
                        // 数据内容的高度小于最低高度的情况下。居顶显示
                        pos = 18;
                    } else if (scrollTop > offTop.top && oSettings.pluginFixedHeader) {
                        if (oSettings.pluginFixedHeader.header) {
                            headerHeight = oSettings.pluginFixedHeader.header.fixer.height();
                        }
                        if (oSettings.pluginFixedHeader.toolbar) {
                            toolbarHeight = oSettings.pluginFixedHeader.toolbar.fixer.height();
                        }
                        // 屏幕视窗在数据内容中间区域
                        pos = dataBodyHeight - (scrollTop - offTop.top);
                        topGap = scrollTop - offTop.top;
                    } else {
                        pos = dataBodyHeight;
                    }
                    pos = pos / 2 - 3 + topGap;
                    // 保证最低定位位置
                    if (pos < 5) {
                        pos = 5;
                    }
                    // 位置设置
                    $('#dataTableLoading_' + tableId).css('top', pos + 'px');
                }, 0);
            };
            // 绑定滚动事件
            $(window).on('scroll.tableLoading.' + tableId, scrollByObj.fn);
            scrollByObj.fn();
        }
        // 执行已定义函数
        if (typeof preDrawFn === 'function') {
            preDrawFn.apply(this, arguments);
        }
    };
    // 绘制完成，隐藏loading
    o.fnDrawCallback = function (oSettings, json) {
        var tableId = oSettings.sTableId, mask = $('#dataTableLoadingMask_' + tableId), scrollByObj = Pzoom.Global['dataTableLoadingAdaptBy_' + tableId], tbody = $(oSettings.nTBody);
        $(oSettings.nTable).parent().height('');
        // 加载完成状态
        oSettings.isDrawed = true;
        // 中断隐藏加载状态计时器
        /*if (oSettings.hideLoadingTimer) {
         clearTimeout(oSettings.hideLoadingTimer);
         delete oSettings.hideLoadingTimer;
         }*/
        //静态翻页时重置数据项选择状态
        tbody.find('input[type=checkbox]').prop('checked', false).change();
        // 移除选择列
        tbody.find('.checked_tr').removeClass('checked_tr');
        // 隐藏loading状态
        function hideLoadingState() {
            // 移除loading状态
            $('#dataTableLoading_' + tableId).remove();
            // 移除遮罩层
            mask.remove();
            // 中断实时定位计时器
            if (scrollByObj.timer) {
                clearTimeout(scrollByObj.timer);
                delete scrollByObj.timer;
            }
            // 移除事件监听
            $(window).off('.tableLoading.' + tableId);
            // 移除事件函数引用
            delete scrollByObj.fn;
            delete Pzoom.Global['dataTableLoadingAdaptBy_' + tableId];
        }

        // 改变当前页所有选项
        function changePageItems(checked, list) {
        }

        if (mask.length > 0) {
            //if (oSettings.errorMsgTimer) {
            //oSettings.hideLoadingTimer = setTimeout(function () {
            //hideLoadingState();
            //}, 500);
            //} else {
            hideLoadingState();
            //}
        }
        clearCheck(oSettings);
        /*if (oSettings.oFixedColumns) {
         if (oSettings.nCheckList) {
         oSettings.nCheckList.off('change');
         }
         }*/
        if (!_hasFixedColumns) {
            oSettings.nAllCk = $(oSettings.nTHead).find('input.select_all_ck');
            oSettings.nCheckList = tbody.find('.select_item_ck').not('[disabled]');
            bindCkAllChange(oSettings);
            bindCkListChange(oSettings);
            // 执行已定义函数
            $(window).trigger("scroll." + oSettings.sTableId)
            // 列固定回调
            if (typeof drawedFn === 'function') {
                drawedFn.call(this, oSettings, json);
            }
        }
        if (oSettings._hasErrorMessage && _hasFixedColumns) {
            $(oSettings.nTableWrapper).hide();
            oSettings._hasErrorMessage.insertAfter($(oSettings.nTableWrapper))
        }
    };
    o.fnHeaderCallback = function (nHead) {
        $(nHead).find('.help_icon').customToolTips();
    };
    var dt = $(this).dataTable(o), setting = dt.fnSettings(), resizeByObj;
    if (setting) {
        resizeByObj = Pzoom.Global['dataTableResizeObjBy_' + setting.sTableId] = {};
        // resize动态修正datatable列宽事件函数
        resizeByObj.fn = function () {
            if (Pzoom.Global.isChangeWidth || (!Pzoom.Global.isChangeHeight && window.innerHeight === window.prevInnerHeight)) {
                // 调整批量操作按钮排列
                operatZone.batchOperate("redraw");
                // 验证当前列表是否处于隐藏状态，处于隐藏状态的话，不调整其列宽
                if ($(setting.nTable).is(":hidden")) {
                    return;
                }
                var resizeObj = Pzoom.Global['dataTableResizeObjBy_' + setting.sTableId];
                // 如果有重置事件器，进行中断，避免重复计算
                if (resizeObj.timer) {
                    clearTimeout(resizeObj.timer);
                }
                // 重绘列宽
                resizeObj.timer = setTimeout(function () {
                    Pzoom.Global['isResizeTableBy_' + setting.sTableId] = true;
                    dt.fnAdjustColumnSizing(false);
                }, 30);
            }
        };
        // 绑定resize动态修正datatable列宽事件
        $(window).on('resize.dataTableWidth.' + setting.sTableId, resizeByObj.fn);
        setting.getCheckStatus = function () {
            return $("#" + this.sTableId).data("checkAll");
        }
        // 自定义注销事件
        setting.customDestroy = function () {
            setting.destroy = true
            var scrollByObj = Pzoom.Global['dataTableLoadingAdaptBy_' + this.sTableId];
            if (scrollByObj) {
                // 中断实时定位计时器
                if (scrollByObj.timer) {
                    clearTimeout(scrollByObj.timer);
                    delete scrollByObj.timer;
                }
                // 移除事件函数引用
                delete scrollByObj.fn;
                delete Pzoom.Global['dataTableLoadingAdaptBy_' + this.sTableId];
            }
            var resizeByObj = Pzoom.Global['dataTableResizeObjBy_' + this.sTableId];
            if (resizeByObj) {
                // 终端重置列宽计时器
                if (resizeByObj.timer) {
                    clearTimeout(resizeByObj.timer);
                    delete resizeByObj.timer;
                }
                // 移除事件函数引用
                delete resizeByObj.fn;
                delete Pzoom.Global['dataTableResizeObjBy_' + this.sTableId];
            }
            delete Pzoom.Global['isResizeTableBy_' + this.sTableId];
            // 注销自适应高度事件
            if (this.oAdaptiveScroller) {
                this.oAdaptiveScroller.destroy();
            }
            // 注销固定头部事件
            if (this.oFixedHeader) {
                this.oFixedHeader.destroy();
            }
            $(window).off("." + this.sTableId)
        };
        return dt;
    }
};

$.extend(jQuery.fn.dataTableExt.oSort, {
    /*
     * html sorting (ignore html tags)
     */
    "html-pre": function (a) {
        return a.replace(/<.*?>/g, "").toLowerCase();
    },
    "html-asc": function (x, y) {
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    },
    "html-desc": function (x, y) {
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    },
    /*
     * date sorting
     */
    "date-pre": function (a) {
        var x = Date.parse(a);
        if (isNaN(x) || x === "") {
            x = Date.parse("01/01/1970 00:00:00");
        }
        return x;
    },
    "date-asc": function (x, y) {
        return x - y;
    },
    "date-desc": function (x, y) {
        return y - x;
    },
    "date-pre": function (a) {
        return a.replace(/<.*?>/g, "");
    },
    "time-asc": function (x, y) {
        return x - y;
    },
    "time-desc": function (x, y) {
        return y - x;
    },
    "time-pre": function (a) {
        return a.replace(/<.*?>/g, "");
    },
    /*
     * numerical sorting
     */
    "numeric-pre": function (a) {
        a = a.replace(/<.*?>|,|%/g, "")
        return isNaN(a) ? -1 : parseFloat(a)
    },
    "numeric-asc": function (x, y) {
        return x - y;
    },
    "numeric-desc": function (x, y) {
        return y - x;
    },
    "string-asc": function (s1, s2) {
        return s1.localeCompare(s2);
    },

    "string-desc": function (s1, s2) {
        return s2.localeCompare(s1);
    },
    "string-pre": function (a) {
        return a.replace(/<.*?>/g, "").toLowerCase();
    },
    "currency-asc": function (s1, s2) {
        return s1 - s2;
    },
    "currency-desc": function (s1, s2) {
        return s2 - s1;
    },
    "currency-pre": function (a) {
        eval("var re = /<.*?>|,|" + $.trim($.t("M")) + "/g");
        a = a.replace(re, "")
        return isNaN(a) ? -1 : parseFloat(a)
    },
    "num-asc": function (s1, s2) {
        return s1 - s2;
    },
    "num-desc": function (s1, s2) {
        return s2 - s1;
    },
    "num-pre": function (a) {
        a = a.replace(/<.*?>|,|%/g, "")
        return isNaN(a) ? -1 : parseFloat(a)
    },
    "text-asc": function (s1, s2) {
        return s1.localeCompare(s2);
    },

    "text-desc": function (s1, s2) {
        return s2.localeCompare(s1);
    },
    "text-pre": function (a) {
        return a.replace(/<.*?>/g, "").toLowerCase();
    }
});
