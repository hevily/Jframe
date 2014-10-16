/**
 * @class   jQuery.Plugin
 * jQuery 插件封装
 */

/**
 * @method      customChart
 * customChart
 * 调用自定义 highchart使用此方法
 *
 * ##使用方法：
 *
 *    {
 *    	$("#chartId").customChart({xisTime:true}) 时间类型
 *      		var toolTips = function(this){
 *						//do Something
 *					}
 *    	$("#chartId").customChart({toolTipCallback:toolTips}) tips信息
 *    	$("#chartId").customChart({typeColor:["#FF0000"]}) 颜色
 *    			var colors = ["#F00","#FF0","#000"]
 *    	$("#chartId").customChart({typeColor:colors}) 颜色
 *      		var optionCate = [1371830400000, 1371916800000, 1372003200000, 1372089600000, 1372176000000, 1372262400000, 1372348800000],
 *                  optionSeries = {[1,2,2,2,2,2,2]},
 *					chartDataObj = {cate:optionCate,seriesData:optionSeries}
 *      $("#chartId").customChart({chartData:chartDataObj})
 *
 *  }
 *
 * @param        {Object}        option                            highchart的默认配置参数
 * @param        {Object}        option.chartData                highchart的数据，对象包含下面两个属性
 * @param        {Array}            option.chartData.cate            highchart的x轴的参数，必须为数组
 * @param        {Array}            option.chartData.seriesData        highchart的数据参数，数组格式，每条线为一个对象，里面需要有data数组 #数据格式可参考：http://api.highcharts.com/highcharts#series
 * @param        {Function}        option.toolTipCallback            弹出层的回调函数(必需写，否则提示的内容为空！)，__请注意，这个灰常重要，当option.shared参数为true时候，这个不需要传递任何参数__
 * @param        {String}        [option.chartType]                highchart的类型，默认是spline，你可以选择其它类型，如：area、line等
 * @param        {boolean}        [option.backgroundColor]        chart的背景颜色；默认为"#FFF"
 * @param        {boolean}        [option.xisTime]                X轴是否为时间，如为时间，可以自动分辨出时间,默认为时间（true），如果不为时间，请写false
 * @param        {Array}            [option.typeColor]                highChart线条的颜色，16进制的颜色值，前面加上#，不传的话，就用默认颜色/必须为一个数组
 * @param        {Number}        [option.yAxisMin]                Y轴的最小刻度，默认为0;如果想自动的话，可以设置为：null
 * @param        {Number}        [option.yAxisMax]                Y轴的最大刻度，木有默认值；如果charttype为column，并且生成堆叠效果的column Chart图，请设置此值为你需要的数值，比如100
 * @param        {boolean}        [option.shared]                    tooltip的shared属性，默认为false，用于多条线的数据在一个框里显示
 * @param        {String}        [option.more]                    还有更多其它不常用选项，不再一一列举，请查看源码
 *
 *
 */
;
Pzoom.lazyLoader(function () {
    'use strict';
    Highcharts.setOptions({
        lang: {
            resetZoom: $.t('reset'),
            resetZoomTitle: $.t('resetClick')
        },
        tooltip: {
            hideDelay: 0
        },
        global: {
            useUTC: false
        }
    });

    $.fn.customChart = function (option) {
        var self = this,
            tickIntervalOption = {
                day: 24 * 3600 * 1000,
                month: 30 * 24 * 3600 * 1000,
                year: 365 * 24 * 3600 * 1000
            },
        //tooltip的提示层 为公共的div#highchartTooltip
            highchartTooltip = $("#highchartTooltip"),
            o = { // 缺省设置
                zoomType: 'x',
                marginRight: 20, //右边距
                marginBottom: 20, //下边距
                marginTop: 20, //上边距
                marginLeft: 30, //左边距
                chartType: 'line', //area
                title: '', //副标题内容
                titleColor: '#4787EE', //副标题颜色
                rotationSet: {
                    rotation: -20,
                    y: 15
                },
                yAxisMin: 0,
                chartData: {
                    cate: [],
                    seriesData: []
                },
                xisTime: true,
                shared: false,
                toolTipCallback: null,
                chartTitle: null
            },
        //载入自定义设置
            settingOptions = jQuery.extend({}, o, option),
        //seriesData
            scate = settingOptions.chartData.cate,
            sData = settingOptions.chartData.seriesData,
            chartModule = {};
        if (settingOptions.chartData == null || sData == null || sData.length == 0) {
            $(self).html('<div class="trend_empty_data"><span>' + $.t("noData") + '</span></div>')
            return
        }
        ;
        /*if (settingOptions.chartData.cate.length == 0) {
         $(self).html("cate参数未传值！")
         return
         };*/
        //数据是否为空
        //console.log(sData)

        //判断 数据是否为空
        var nullDataArray = [],//整个数组是null
            dataNull = [],//每个数据都是null
            subData,
            subNullData;
        //console.log(sData)
        for (var i = 0; i < sData.length; i++) {
            subData = sData[i].data;
            subNullData = _.uniq(subData);
            //console.log(subNullData)
            //console.log(subNullData.length===1)
            //console.log(subNullData[0]===null)
            if (subNullData.length === 1 && subNullData[0] === null) {
                dataNull.push("false");
                continue;
            }
            ;
        }
        ;
        //console.log(sData.length === dataNull.length)
        if (sData.length === dataNull.length) {
            $(self).html('<div class="trend_empty_data"><span>' + $.t("noData") + '</span></div>')
            return
        }
        ;
        //转换数据
        for (var i = 0; i < sData.length; i++) {
            subData = sData[i].data;
            if (subData && subData.length) {
                for (var j = 0; j < subData.length; j++) {
                    if (typeof subData[j] === "number" || subData[j] == null) {
                        subData[j] = {
                            x: scate[j],
                            y: subData[j]
                        }
                    }
                    ;
                }
                ;
            } else {
                nullDataArray.push("false")
            }
            ;
            sData[i].animation = settingOptions.seriesAnimation===false?false:true
        }
        if (nullDataArray.length === sData.length) {
            $(self).html('<div class="trend_empty_data"><span>' + $.t("noData") + '</span></div>')
            return
        }
        ;
        //console.log(JSON.stringify(sData))
        //HighChart
        chartModule = {
            //chartType 线条类型 spline平滑线条，line 折线
            chart: {
                defaultSeriesType: settingOptions.chartType,
                marginRight: settingOptions.marginRight,
                marginTop: settingOptions.marginTop,
                marginBottom: settingOptions.marginBottom,
                marginLeft: settingOptions.marginLeft,
                width: settingOptions.width,
                height: settingOptions.height,
                backgroundColor: settingOptions.backgroundColor || "#FFF",
                zoomType: settingOptions.zoomType,
                events: settingOptions.events || {},
                animation: settingOptions.animation
            },
            /*plotOptions: {
             series: {
             point: {
             events: {
             //设置弹出的提示层
             mouseOver: function (e) {
             console.log(1)
             clearTimeout(highchartTooltip.data('tooltipTimeout'));
             var tooltip_top = highchartTooltip.offset().top,
             tooltip_left = highchartTooltip.offset().left,
             tooltip_height = highchartTooltip.outerHeight(true),
             //当前点的坐标和偏移
             lastToolTip_left = this.plotX + $(self).offset().left,
             lastToolTip_top = this.plotY + $(self).offset().top - tooltip_height,
             days = [$.t('_date.monday'), $.t('_date.tuesday'), $.t('_date.wednesday'), $.t('_date.thursday'), $.t('_date.friday'), $.t('_date.saturday'), $.t('_date.sunday')],
             cateVal,
             date;

             //靠近顶部
             if (tooltip_top < 0) {
             lastToolTip_top = 0;
             }

             //靠近左侧
             if (tooltip_left < 0) {
             lastToolTip_left = 0;
             }

             highchartTooltip.css({
             //'display': 'inline-block',
             'left': lastToolTip_left + settingOptions.marginLeft,
             'top': lastToolTip_top + settingOptions.marginTop,
             "border-color": this.series.color,
             "z-index":999999
             });

             if (!this.cateName) {
             this.cateName == this.series.name

             cateVal = Pzoom.Global.fieldsMap[this.series.name];
             if (cateVal) {
             // 数据分类字段名称设置
             this.cateName = cateVal.name
             // 格式化数据
             this.formatVal = cateVal.rule ? Pzoom.Tool.getValueByRule(this.y, cateVal.rule) : this.y;
             }
             ;
             // 日期设置
             date = new Date(this.x);
             this.formatDate = Pzoom.Tool.formatDate(date, 'YYYY-MM-DD');
             this.day = days[date.getUTCDay()];
             }

             //如果有提示的构造函数
             if (typeof settingOptions.toolTipCallback == "function") {
             highchartTooltip.html(settingOptions.toolTipCallback(this));
             } else {
             highchartTooltip.html("");
             }
             }
             }
             },
             events: {
             mouseOut: function () {
             var timeout = setTimeout(function () {
             highchartTooltip.css("display", "none");
             }, 500);
             highchartTooltip.data('tooltipTimeout', timeout);

             }
             }
             },
             column: {

             }
             },*/
            tooltip: {
                shared: settingOptions.shared,
                enabled: settingOptions.showToolTip,
                useHTML:true
            },
            lang: {
                loading: '<img src="../../images/loading_small.gif">'
            },
            title: {
                useHTML:true,
                text: settingOptions.chartTitle
            },
            xAxis: {
                labels: {
                    enabled: true,
                    style: {
                        color: '#000',
                        font: '11px Trebuchet MS, Verdana, sans-serif'
                    },
                    overflow: 'justify',
                    rotation: settingOptions.rotationSet.rotation
                },
                title: {
                    style: {
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        fontFamily: 'Trebuchet MS, Verdana, sans-serif'
                    }
                },
                // lineColor:"#000",
                // lineWidth: 1,
                gridLineWidth: 1,
                gridLineColor: '#ff0000'
            },
            yAxis: {
                labels: {
                    stackLabels: {
                        enabled: true
                    },
                    style: {
                        font: '11px Trebuchet MS, Verdana, sans-serif'
                    }
                },
                title: {
                    text: ""
                },
                min: settingOptions.yAxisMin,
                //lineColor:"#000",
                lineWidth: 1,
                gridLineWidth: 1,
                gridLineColor: '#eeeeee',
                minorTickInterval: 'auto',
                minorGridLineColor: '#eeeeee',
                minRange: 1 //这个参数是让数据为0的时候显示在最下面
            },
            legend: settingOptions.legend || {
                enabled: false //隐藏线条显示框
            },
            credits: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: sData
        }
        // x轴是日期
        //var dataLength=
        if (settingOptions.xisTime) {
            // 日期格式
            chartModule.xAxis = {
                gridLineWidth: 1,
                gridLineColor: '#dedede',
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%m-%e',
                    month: '%m-%e',
                    year: '%m-%e',
                    week: '%m-%e'
                },
                tickInterval: (function () {
                    if (sData.length > 0) {
                        var l = _.max(sData,function(num){ return num.data.length}).data.length;
                        if (l > 7 && l <= 14) {
                            return tickIntervalOption.day * 5;
                        } else if (l > 14) {
                            return tickIntervalOption.day * 7;
                        } else {
                            return tickIntervalOption.day * 1;
                        }
                    } else {
                        return tickIntervalOption.day * 2;
                    }
                })()
            };
        } else {
            chartModule.xAxis = {
                gridLineWidth: 1,
                tickmarkPlacement: 'on',
                categories: settingOptions.chartData.cate,
                tickInterval: (function () {
                    if (sData.length > 0) {
                        var l = _.max(sData,function(num){ return num.data.length}).data.length;
                        if (l > 7 && l <= 14) {
                            return 2;
                        } else if (l > 14) {
                            return 3;
                        } else {
                            return 1;
                        }
                    } else {
                        return 1;
                    }
                })()
            }
        }
        //颜色
        if (settingOptions.typeColor) {
            chartModule.colors = settingOptions.typeColor;
            chartModule.tooltip.borderColor = settingOptions.tipBorderColor;
        }
        //多个数据显示在一个框框里
        if (settingOptions.shared) {
            //delete chartModule.plotOptions.series
            delete chartModule.tooltip.enabled
            chartModule.tooltip.formatter = settingOptions.toolTipCallback || function () {
                var s = '<b>' + this.x + '</b>';
                $.each(this.points, function (i, point) {
                    s += '<br/>' + point.series.name + ': ' +
                        point.y + 'm';
                });
                return s;
            }
        }
        settingOptions.toolTipCallback && (chartModule.tooltip.formatter = settingOptions.toolTipCallback)
        //如果chartType==column
        if (settingOptions.chartType === "column" && settingOptions.yAxisMax) {
            chartModule.yAxis.max = settingOptions.yAxisMax;
            chartModule.plotOptions = chartModule.plotOptions || {};
            chartModule.plotOptions.column = chartModule.plotOptions.column || {};
            chartModule.plotOptions.column.stacking = "normal";

        }
        //var myChart = new Highcharts.Chart(chartModule)
        return $(self).highcharts(chartModule);
    }
});