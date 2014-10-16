/*mailInput-jQuery 1.6
 * js：lihuaigu
 * css：liuquanyang
 * $(selector).inputMail()   //init
 * $(selector).inputMail("clear")  //clear value
 * $(selector).inputMail("getValue")  //get all Email ,return:Array
 */
;
( function ($) {
    var sizer = null
    var buf = ["@126.com", "@163.com", "@139.com", "@qq.com", "@gmail.com", "@outlook.com", "@ymail.com", "@yahoo.com", "@sina.com", "@vip.sina.com", "@sina.cn", "@sohu.com", "@21cn.com", "@263.net", "@yeah.net", "@wo.com.cn", "@189.com", "@188.com", "@live.cn"]
    //多地址输入控件
    function inputMailMultiClass() {
        this.input = null
        this.emaillist = null
        this.body = null
        this.option = null
    }

    inputMailMultiClass.prototype = {
        init: function (_this, option) {
            this.option = option
            var that = this
            that.input = $(_this)
            that.input.data("body", that)
            //$(this._target).not("[emailbinded]").each(function(index, item) {
            that.input.wrap("<div class='email_input email_input_mutli' style='height:29px;'><div class='clearfix' style='overflow-y:auto;overflow-x:hidden;max-height:" + this.option.linenum * 28 + "px;'></div></div>")
            that.body = that.input.closest(".email_input")
            that.body.css(this.option.style)
            that.changewidth()
            that.emaillist = $("<div class='email_list_item' style='max-height:140px'></div>")
            that.body.append(that.emaillist)
            that.emailTips = $("<div class='email_tips'></div>")
            that.body.append(that.emailTips)
            that.changewidth()
            that.addEvent()
        },
        clear: function (that) {
            that.input.parent().find(".email_tags").remove()
            that.input.data("email_value", []).trigger("change")
            that.changeScroll()
            that.changewidth()
        },
        getValue: function (that) {
            return _.uniq(that.input.data("email_value"))
        },
        addEvent: function () {
            var that = this
            var eventHandler = function (e) {
                that.changemail(that);
            }
            if (typeof (that.input[0].addEventListener) != "undefined")//ie浏览器
            {
                //非ie浏览器，比如Firefox
                that.input[0].addEventListener("input", eventHandler, false);
            }
            that.input.keyup(function (e) {
                if (e.keyCode != 40 && e.keyCode != 38 && e.keyCode != 13 && e.keyCode != 37 && e.keyCode != 39) {
                    that.changemail(that);
                }
            })
            that.input.focus(function (e) {
                $(".email_list_item").empty().hide()
            }).keydown(function (e) {
                    that.updown(e, that)
                }).attr("emailbinded", "true").data("email_value", []).css("float", "left")
            var blurFun = function (e) {
                if ((!$(e.target).hasClass("email_input") && !$(e.target).parents().hasClass("email_input")) || $(e.target).hasClass("hover")) {
                    that.output(that, that.emaillist.find(".hover:first").text())
                }
            }
            that.input.parent().unbind().bind("click", function (e) {
                e.stopPropagation()
                if ($(e.target).hasClass("email_tags") || $(e.target).parents().hasClass("email_tags")) {
                    that.deleteItem($(e.target).closest(".email_tags:not(:animated)"))
                } else {
                    that.input.focus()
                }
            })
            that.emaillist.unbind("click", blurFun).bind("click", blurFun)
        },
        updown: function (e, that) {
            var _target = that.input
            var length = that.emaillist.find("a").length
            var index = that.emaillist.find(".hover").length
            switch (e.keyCode) {
                case 40:
                    e.preventDefault();
                    if (that.emaillist.find(".hover").length == 0) {
                        return false
                    }
                    index = that.emaillist.find("a").index(that.emaillist.find(".hover")) + 1
                    index = index >= length ? 0 : index;
                    that.emaillist.find("a").removeClass("hover")
                    that.emaillist.find("a:eq(" + index + ")").addClass("hover")
                    var top = that.emaillist.find(".hover").position().top
                    if (top >= 140) {
                        that.emaillist.scrollTop((index - 4) * 28)
                    }
                    if (top <= 0) {
                        that.emaillist.scrollTop(0)
                    }
                    break;
                case 38:
                    e.preventDefault();
                    if (that.emaillist.find(".hover").length == 0) {
                        return false
                    }
                    index = that.emaillist.find("a").index(that.emaillist.find(".hover")) - 1
                    index = index < 0 ? length - 1 : index;
                    that.emaillist.find("a").removeClass("hover")
                    that.emaillist.find("a:eq(" + index + ")").addClass("hover")
                    var top = that.emaillist.find(".hover").position().top
                    that.emaillist.scrollTop(index * 28)
                    break
                case 13:
                    e.preventDefault();
                    that.output(that, that.emaillist.find(".hover:first").text())
                    break;
                case 8:
                    if (_target.val() == "") {
                        if (_target.parent().find(".email_tags:last").hasClass("email_tag_delete")) {
                            that.deleteItem(_target.parent().find(".email_tags:last:not(:animated)"))
                            /*_target.parent().find(".email_tags:last:not(:animated)").fadeOut(300, function() {
                             _target.parent().find(".email_tags:last").remove()
                             _target.data("email_value").pop()
                             _target.trigger("change")
                             that.changewidth()
                             that.changeScroll()
                             })*/
                        } else {
                            _target.parent().find(".email_tags:last").addClass("email_tag_delete")
                        }
                    }
                    break;
            }
        },
        measureTextWidth: function (e) {
            if (!sizer) {
                var style = e[0].currentStyle || window.getComputedStyle(e[0], null);
                sizer = $("<div></div>").css({
                    position: "absolute",
                    left: "-10000px",
                    top: "-10000px",
                    display: "none",
                    fontSize: style.fontSize,
                    fontFamily: style.fontFamily,
                    fontStyle: style.fontStyle,
                    fontWeight: style.fontWeight,
                    letterSpacing: style.letterSpacing,
                    textTransform: style.textTransform,
                    whiteSpace: "nowrap"
                });
                $("body").append(sizer);
            }
            sizer.text(e.val().replace(/\s/g, "x"));
            return sizer.width();
        },
        output: function (that, text) {
            var _target = that.input
            if (_target.val() == "") {
                return false
            }
            var out = _target.data("email_value")
            if (typeof (text) != "string") {
                text = that.emaillist.find("a:first").text()
            }
            if (that.emaillist.find("li").length == 0) {
                text = _target.val()
            }
            var tempText=[]
            if(text.indexOf(",")>-1){
                tempText=text.split(",")
            }else{
                tempText.push(text)
            }
            for(var i in tempText) {
                text=tempText[i]
                if (!Pzoom.Tool.emailValidate(text)) {
                    var html = "<li class='email_error_tips'>邮件地址输入错误,请核对后重新输入</li>"
                    that.emailTips.width(that.body.width()).show().html(html)
                    //that.emaillist.height(that.emaillist.find("li").length * 28)
                    that.emaillist.hide()
                    that.changePos()
                    setTimeout(function () {
                        that.emailTips.hide()
                    }, 2000)
                    return false
                }
                if (that.option.maxnum != 0 && out.length >= that.option.maxnum) {
                    var html = "<li class='email_error_tips'>至多只能输入"+that.option.maxnum.toString()+"个邮件地址</li>"
                    that.emailTips.width(that.body.width()).show().html(html)
                    that.emaillist.hide()
                    //that.emaillist.height(that.emaillist.find("li").length * 28)
                    that.emaillist.hide()
                    _target.val("")
                    setTimeout(function () {
                        that.emailTips.hide()
                    }, 2000)
                    return false
                }
                out.push(text)
                _target.val("")
                _target.data("email_value", out)
                that.emaillist.hide().html("")
                _target.before("<div class='email_tags'>" + out[out.length - 1] + "<em class='close_btn'></em></div>")
                that.changewidth()
                /*_target.parent().find(".email_tags").unbind().bind("click", function(e) {
                 if(that.input.val() != "") {
                 that.output()
                 }
                 that.input.focus().val($(this).text()).select().change()
                 that.deleteItem($(e.target).not(":animated"))
                 })*/
                that.changeScroll()
            }
        },
        deleteItem: function (obj, callback) {
            var that = this
            var text = ""
            $(obj).fadeOut(300, function () {
                text = $(obj).text()
                $(obj).remove()
                var out = []
                that.body.find(".email_tags").each(function (index, item) {
                    out.push($(item).text())
                })
                that.changewidth()
                that.input.data("email_value", out).trigger("change")
                that.changeScroll()
                typeof (callback) == "function" && callback(text)
            })
        },
        changeScroll: function () {
            /*this.input.closest(".nano").nanoScroller({
             scrollBottom: 0
             })*/
            this.body.find(">.clearfix").scrollTop(this.body[0].scrollHeight)
            this.body.height(this.input.parent().height())
        },
        changewidth: function () {
            var that = this, _target = that.input
            _target.width(2)
            var left = _target.offset().left;
            var containerLeft = that.body.offset().left
            var maxWidth = that.input.parent()[0].clientWidth;
            var searchWidth = maxWidth - (left - containerLeft) - that.getSideBorderPadding(_target)
            searchWidth = searchWidth <= 0 ? 2 : searchWidth
            _target.width(searchWidth)
        },
        getSideBorderPadding: function (element) {
            return element.outerWidth() - element.width();
        },
        changePos: function () {
            var that = this
            var tempHeight = that.emaillist.find("li").length > 5 ? 140 : that.emaillist.find("li").length * 28
            if (tempHeight + that.body.offset().top + that.body.height() > $(window).height() + $(window).scrollTop()) {
                that.emaillist.css({
                    bottom: "100%"
                })
            } else {
                that.emaillist.css({
                    bottom: "auto"
                })
            }
        },
        changemail: function (that) {
            that.emailTips.hide()
            var c = 0, _target = that.input
            var temp = _target.val().replace(/，/g, ",").replace(/。/g, ".")//.replace(/@/, "{||mailSpliter||}")
            var tempVal = temp.split(","), html = "";
            temp = temp.replace(/[^a-zA-Z0-9@_\-\.]/g, "")
            if (temp.indexOf("@") > -1) {
                var str = temp.split("@")
                temp = ""
                for (var i = 0; i < str.length; i++) {
                    if (i == 0) {
                        temp = str[i] + "@"
                    } else {
                        temp += str[i]
                    }
                }
            }
            _target.val(temp)
            if (_target.val() == "") {
                that.emaillist.hide()
                return false
            }
            if (tempVal.length > 1) {
                _target.val(tempVal[0])
                that.output(that)
                return false
            }
            if (temp == "" || $.trim(temp.split("@")[0]) == "") {
                return false
            }
            $(".email_tag_delete").removeClass("email_tag_delete")
            $(buf).each(function (index, item) {
                var reg = "@"
                if (temp.split("@").length > 1) {
                    reg = "@" + temp.split("@")[1]
                }
                if (item.indexOf(reg) > -1) {
                    html += "<li><a href='javascript:;'>" + (temp.split("@")[0] + item).replace(temp, "<strong style='font-weight:700;color:#000'>" + temp + "</strong>") + "</a></li>"
                }
            })
            //that.emaillist.width(that.body.width())
            that.emaillist.css(that.option.style).show().html(html)
            that.emaillist.height(that.emaillist.find("li").length * 28)
            that.changePos()
            //that.emaillist.show()
            if (html != "") {
                that.emaillist.find("a:first").addClass("hover")
                that.emaillist.find("a").mouseover(function () {
                    that.emaillist.find("a").removeClass("hover")
                    $(this).addClass("hover")
                })
                /*.click(function (e) {
                 e.preventDefault();
                 e.stopPropagation()
                 that.output($(this).text())
                 })*/
            } else {
                that.emaillist.hide()
            }
            _target.width(that.measureTextWidth(_target) + 10)
            that.body.height(that.input.parent().height())
        }
    }
    //单一地址输入控件
    function inputMailSingleClass() {
        this.input = null
        this.emaillist = null
        this.option = null
    }

    inputMailSingleClass.prototype = {
        init: function (_this, option) {
            this.option = option
            var that = this
            that.input = $(_this)
            that.input.data("body", that)
            //$(this._target).not("[emailbinded]").each(function(index, item) {
            that.input.wrap("<div class='email_input email_input_single' style='position: relative'></div>")
            that.input.css(this.option.style)
            that.body = that.input.closest(".email_input_single")
            //that.changewidth()
            that.emaillist = $("<div class='email_list_item single' style='max-height:140px;'></div>")
            that.body.append(that.emaillist)
            that.addEvent()
            /*that.emaillist.nanoScroller({
             notReset:false,
             onChange:function () {

             }
             })*/
        },
        updown: function (e, that) {
            var _target = that.input
            var length = that.emaillist.find("a").length
            var index = that.emaillist.find(".hover").length
            switch (e.keyCode) {
                case 40:
                    e.preventDefault();
                    if (that.emaillist.find(".hover").length == 0) {
                        return false
                    }
                    index = that.emaillist.find("a").index(that.emaillist.find(".hover")) + 1
                    index = index >= length ? 0 : index;
                    that.emaillist.find("a").removeClass("hover")
                    that.emaillist.find("a:eq(" + index + ")").addClass("hover")
                    var top = that.emaillist.find(".hover").position().top
                    if (top >= 140) {
                        that.emaillist.scrollTop((index - 4) * 28)
                    }
                    if (top <= 0) {
                        that.emaillist.scrollTop(0)
                    }
                    break;
                case 38:
                    if (that.emaillist.find(".hover").length == 0) {
                        return false
                    }
                    e.preventDefault();
                    index = that.emaillist.find("a").index(that.emaillist.find(".hover")) - 1
                    index = index < 0 ? length - 1 : index;
                    that.emaillist.find("a").removeClass("hover")
                    that.emaillist.find("a:eq(" + index + ")").addClass("hover")
                    var top = that.emaillist.find(".hover").position().top
                    that.emaillist.scrollTop(index * 28)
                    break
                case 13:
                    that.emaillist.find("li").length > 0 && e.preventDefault()
                    that.output(that, that.emaillist.find(".hover:first").text());
                    break;
            }
        },
        addEvent: function () {
            var that = this
            var eventHandler = function (e) {
                that.changemail(that);
            }
            if (typeof (that.input[0].addEventListener) != "undefined")//ie浏览器
            {
                //非ie浏览器，比如Firefox
                that.input[0].addEventListener("input", eventHandler, false);
            }
            that.input.keyup(function (e) {
                if (e.keyCode != 40 && e.keyCode != 38 && e.keyCode != 13 && e.keyCode != 37 && e.keyCode != 39) {
                    that.changemail(that);
                }
                /*if(e.keyCode == 40&&that.emaillist.is(":hidden")){
                 that.changemail(that);
                 }*/
            })
            that.input.focus(function (e) {
                $(".email_list_item").hide()
            }).keydown(function (e) {
                    that.updown(e, that)
                }).attr("emailbinded", "true")
            var blurFun = function (e) {
                if ((!$(e.target).hasClass("email_input") && !$(e.target).parents().hasClass("email_input")) || $(e.target).hasClass("hover")) {
                    that.output(that, that.emaillist.find(".hover:first").text())
                }
                /*if($(e.target).hasClass("hover")){
                 that.output(that.emaillist.find(".hover:first").text())
                 }*/
            }
            that.emaillist.unbind("click", blurFun).bind("click", blurFun)
        },
        output: function (that, text) {
            var _target = that.input
            if (_target.val() == "") {
                return false
            }
            var out = _target.data("email_value")
            if (typeof (text) == "undefined") {
                text = that.emaillist.find("a:first").text()
            }
            if (that.emaillist.find("li").length == 0) {
                text = _target.val()
            }
            /*if(!validate_email(text)) {
             var html = "<li class='email_error_tips'>邮件地址输入错误,请核对后重新输入</li>"
             that.emaillist.width(that.input.width()+20).show().find(".nanocontent").html(html)
             return false
             }*/
            _target.val(text)
            that.emaillist.hide().html("")
            return true
        },
        changemail: function (that) {
            var c = 0, _target = that.input
            var temp = _target.val().replace(/，/g, ",").replace(/。/g, ".")
            var html = "";
            temp = temp.replace(/[^a-zA-Z0-9@_\-\.]/g, "")
            if (temp.indexOf("@") > -1) {
                var str = temp.split("@")
                temp = ""
                for (var i = 0; i < str.length; i++) {
                    if (i == 0) {
                        temp = str[i] + "@"
                    } else {
                        temp += str[i]
                    }
                }
            }
            _target.val(temp)
            if (_target.val() == "") {
                that.emaillist.hide()
                return false
            }
            if (temp == "" || $.trim(temp.split("@")[0]) == "") {
                return false
            }
            //html = "<li><a href='javascript:;'><strong style='font-weight:700;color:#000'>" + temp + "</strong>") + "</a></li>"
            if ("addEmail" in  that.option) {
                var reg = new RegExp("^" + temp)
                $(that.option.addEmail).each(function (index, item) {
                    if (reg.test(item)) {
                        html = "<li><a href='javascript:;'>" + item.replace(temp, "<strong style='font-weight:700;color:#000'>" + temp + "</strong>") + "</a></li>"
                    }
                })
            }
            $(buf).each(function (index, item) {
                var reg = "@"
                if (temp.split("@").length > 1) {
                    reg = "@" + temp.split("@")[temp.split("@").length - 1]
                }
                if (item.indexOf(reg) > -1) {
                    html += "<li><a href='javascript:;'>" + (temp.split("@")[0] + item).replace(temp, "<strong style='font-weight:700;color:#000'>" + temp + "</strong>") + "</a></li>"
                }
            })
            that.emaillist.css(that.option.style).show().html(html)
            that.emaillist.width(that.body.width() - 2)
            that.emaillist.height(that.emaillist.find("li").length * 28)
            /*	var tempHeight = that.emaillist.find(".nanocontent li").length > 5 ? 140 : that.emaillist.find(".nanocontent li").length * 28
             if(tempHeight + that.input.offset().top + that.input.height() > $(window).height()) {
             that.emaillist.css({
             top : "auto",
             bottom : "100%"
             })
             } else {
             that.emaillist.css({
             bottom : "auto"
             })
             }*/
            //that.emaillist.show()
            if (html != "") {
                that.emaillist.find("a:first").addClass("hover")
                that.emaillist.find("a").mouseover(function () {
                    that.emaillist.find("a").removeClass("hover")
                    $(this).addClass("hover")
                })
                /*.click(function (e) {
                 e.preventDefault();
                 e.stopPropagation()
                 that.output($(this).text())
                 })*/
            } else {
                that.emaillist.hide()
            }
        }
    }
    $.fn.inputMail = function () {
        var obj = $(this), args = Array.prototype.slice.call(arguments, 0), inputMailBody, allowedMethods = ["clear", "getValue", "output"];
        if (args.length === 0 || typeof (args[0]) === "object") {
            args[0] = $.extend({}, $.fn.inputMail.defaults, args[0])
            /* $(document).click(function (e) {
             if (!($(e.target).parents().hasClass("email_input") || $(e.target).hasClass("email_input"))) {
             obj.each(function (index, item) {
             if ($(item).val() != "") {
             var tempBody = $(this).data("body");
             tempBody.output()
             }
             })
             args[0].multi && obj.val("").width(5).trigger("change")
             $(".email_list_item").hide()
             }
             })*/
            return args[0].multi ? obj.not("[emailbinded]").each(function (index, item) {
                //args[0].style = $.extend({top:($(item).outerHeight() - 1) + "px"}, args[0].style)
                inputMailBody = new inputMailMultiClass()
                inputMailBody.init(item, args[0])
            }) : obj.not("[emailbinded]").each(function (index, item) {
                args[0].style = $.extend({top: ($(item).outerHeight() - 1) + "px"}, args[0].style)
                inputMailBody = new inputMailSingleClass()
                inputMailBody.init(item, args[0])
            })
        } else if (typeof (args[0]) === "string") {
            if (allowedMethods.indexOf(args[0]) < 0) {
                throw "Unknown method: " + args[0];
            }
            inputMailBody = $(this).data("body");
            return inputMailBody[args[0]](inputMailBody)
        }
    }
    $.fn.inputMail.defaults = {
        multi: true,
        linenum: 5,
        style: {width: "120px"},
        maxnum: 0
    }
}(jQuery));

