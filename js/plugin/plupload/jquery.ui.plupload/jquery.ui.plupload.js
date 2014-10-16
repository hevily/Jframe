/**
 * jquery.ui.plupload.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 *
 * Depends:
 *    jquery.ui.core.js
 *    jquery.ui.widget.js
 *    jquery.ui.button.js
 *    jquery.ui.progressbar.js
 *
 * Optionally:
 *    jquery.ui.sortable.js
 */

/* global jQuery:true */
/**
 jQuery UI based implementation of the Plupload API - multi-runtime file uploading API.

 To use the widget you must include _jQuery_ and _jQuery UI_ bundle (including `ui.core`, `ui.widget`, `ui.button`,
 `ui.progressbar` and `ui.sortable`).

 In general the widget is designed the way that you do not usually need to do anything to it after you instantiate it.
 But! You still can intervenue, to some extent, in case you need to. Although, due to the fact that widget is based on
 _jQuery UI_ widget factory, there are some specifics. See examples below for more details.

 @example
 <!-- Instantiating: -->
 <div id="uploader">
 <p>Your browser doesn't have Flash, Silverlight or HTML5 support.</p>
 </div>

 <script>
 $('#uploader').plupload({
			url : '../upload.php',
			filters : [
				{title : "Image files", extensions : "jpg,gif,png"}
			],
			rename: true,
			sortable: true,
			flash_swf_url : '../../js/Moxie.swf',
			silverlight_xap_url : '../../js/Moxie.xap',
		});
 </script>

 @example
 // Invoking methods:
 $('#uploader').plupload(options);

 // Display welcome message in the notification area
 $('#uploader').plupload('notify', 'info', "This might be obvious, but you need to click 'Add Files' to add some files.");

 @example
 // Subscribing to the events...
 // ... on initialization:
 $('#uploader').plupload({
		...
		viewchanged: function(event, args) {
			// stuff ...
		}
	});
 // ... or after initialization
 $('#uploader').on("viewchanged", function(event, args) {
		// stuff ...
	});

 @class UI.Plupload
 @constructor
 @param {Object} settings For detailed information about each option check documentation.
 @param {String} settings.url URL of the server-side upload handler.
 @param {Number|String} [settings.chunk_size=0] Chunk size in bytes to slice the file into. Shorcuts with b, kb, mb, gb, tb suffixes also supported. `e.g. 204800 or "204800b" or "200kb"`. By default - disabled.
 @param {String} [settings.file_data_name="file"] Name for the file field in Multipart formated message.
 @param {Array} [settings.filters=[]] Set of file type filters, each one defined by hash of title and extensions. `e.g. {title : "Image files", extensions : "jpg,jpeg,gif,png"}`. Dispatches `plupload.FILE_EXTENSION_ERROR`
 @param {String} [settings.flash_swf_url] URL of the Flash swf.
 @param {Object} [settings.headers] Custom headers to send with the upload. Hash of name/value pairs.
 @param {Number|String} [settings.max_file_size] Maximum file size that the user can pick, in bytes. Optionally supports b, kb, mb, gb, tb suffixes. `e.g. "10mb" or "1gb"`. By default - not set. Dispatches `plupload.FILE_SIZE_ERROR`.
 @param {Number} [settings.max_retries=0] How many times to retry the chunk or file, before triggering Error event.
 @param {Boolean} [settings.multipart=true] Whether to send file and additional parameters as Multipart formated message.
 @param {Object} [settings.multipart_params] Hash of key/value pairs to send with every file upload.
 @param {Boolean} [settings.multi_selection=true] Enable ability to select multiple files at once in file dialog.
 @param {Boolean} [settings.prevent_duplicates=false] Do not let duplicates into the queue. Dispatches `plupload.FILE_DUPLICATE_ERROR`.
 @param {String|Object} [settings.required_features] Either comma-separated list or hash of required features that chosen runtime should absolutely possess.
 @param {Object} [settings.resize] Enable resizng of images on client-side. Applies to `image/jpeg` and `image/png` only. `e.g. {width : 200, height : 200, quality : 90, crop: true}`
 @param {Number} [settings.resize.width] If image is bigger, it will be resized.
 @param {Number} [settings.resize.height] If image is bigger, it will be resized.
 @param {Number} [settings.resize.quality=90] Compression quality for jpegs (1-100).
 @param {Boolean} [settings.resize.crop=false] Whether to crop images to exact dimensions. By default they will be resized proportionally.
 @param {String} [settings.runtimes="html5,flash,silverlight,html4"] Comma separated list of runtimes, that Plupload will try in turn, moving to the next if previous fails.
 @param {String} [settings.silverlight_xap_url] URL of the Silverlight xap.
 @param {Boolean} [settings.unique_names=false] If true will generate unique filenames for uploaded files.

 @param {Boolean} [settings.autostart=false] Whether to auto start uploading right after file selection.
 @param {Boolean} [settings.dragdrop=true] Enable ability to add file to the queue by drag'n'dropping them from the desktop.
 @param {Boolean} [settings.rename=false] Enable ability to rename files in the queue.
 @param {Boolean} [settings.sortable=false] Enable ability to sort files in the queue, changing their uploading priority.
 @param {Object} [settings.buttons] Control the visibility of functional buttons.
 @param {Boolean} [settings.buttons.browse=true] Display browse button.
 @param {Boolean} [settings.buttons.start=true] Display start button.
 @param {Boolean} [settings.buttons.stop=true] Display stop button.
 @param {Object} [settings.views] Control various views of the file queue.
 @param {Boolean} [settings.views.list=true] Enable list view.
 @param {Boolean} [settings.views.thumbs=false] Enable thumbs view.
 @param {String} [settings.views.default='list'] Default view.
 @param {Boolean} [settings.views.remember=true] Whether to remember the current view (requires jQuery Cookie plugin).
 @param {Boolean} [settings.multiple_queues=true] Re-activate the widget after each upload procedure.
 @param {Number} [settings.max_file_count=0] Limit the number of files user is able to upload in one go, autosets _multiple_queues_ to _false_ (default is 0 - no limit).
 */
(function (window, document, plupload, o, $) {

    /**
     Dispatched when the widget is initialized and ready.

     @event ready
     @param {plupload.Uploader} uploader Uploader instance sending the event.
     */
    /**
     Dispatched when file dialog is closed.

     @event selected
     @param {plupload.Uploader} uploader Uploader instance sending the event.
     @param {Array} files Array of selected files represented by plupload.File objects
     */
    /**
     Dispatched when file dialog is closed.

     @event removed
     @param {plupload.Uploader} uploader Uploader instance sending the event.
     @param {Array} files Array of removed files represented by plupload.File objects
     */
    /**
     Dispatched when upload is started.

     @event start
     @param {plupload.Uploader} uploader Uploader instance sending the event.
     */
    /**
     Dispatched when upload is stopped.

     @event stop
     @param {plupload.Uploader} uploader Uploader instance sending the event.
     */
    /**
     Dispatched during the upload process.

     @event progress
     @param {plupload.Uploader} uploader Uploader instance sending the event.
     @param {plupload.File} file File that is being uploaded (includes loaded and percent properties among others).
     @param {Number} size Total file size in bytes.
     @param {Number} loaded Number of bytes uploaded of the files total size.
     @param {Number} percent Number of percentage uploaded of the file.
     */
    /**
     Dispatched when file is uploaded.

     @event uploaded
     @param {plupload.Uploader} uploader Uploader instance sending the event.
     @param {plupload.File} file File that was uploaded.
     @param {Enum} status Status constant matching the plupload states QUEUED, UPLOADING, FAILED, DONE.
     */
    /**
     Dispatched when upload of the whole queue is complete.

     @event complete
     @param {plupload.Uploader} uploader Uploader instance sending the event.
     @param {Array} files Array of uploaded files represented by plupload.File objects
     */
    /**
     Dispatched when the view is changed, e.g. from `list` to `thumbs` or vice versa.

     @event viewchanged
     @param {plupload.Uploader} uploader Uploader instance sending the event.
     @param {String} type Current view type.
     */
    /**
     Dispatched when error of some kind is detected.

     @event error
     @param {plupload.Uploader} uploader Uploader instance sending the event.
     @param {String} error Error message.
     @param {plupload.File} file File that was uploaded.
     @param {Enum} status Status constant matching the plupload states QUEUED, UPLOADING, FAILED, DONE.
     */

    var uploaders = {};

    function _(str) {
        return plupload.translate(str) || str;
    }

    function renderUI(obj) {
        obj.id = obj.attr('id');
        var html = '<div class="plupload_wrapper">'
        html += '<div class="ui-widget-content plupload_container">'
        html += '<div class="ui-state-default ui-widget-header plupload_header">'
        html += '<div class="plupload_header_content">'
        html += '<div class="plupload_header_text">' + _('Add files to the upload queue and click the start button.') + ' <a class="help_icon" id="plupload_help_icon" title="' + $.t("rightSize") + '" style="" href="javascript:void(0)"></a></div>'
        html += '<div style="float:right;position: absolute;top:0;width:100px;line-height: 32px;right: 10px"><a href="javascript:;" style="float: right;" id="' + obj.id + '_deleteall">' + _('Delete All') + '</a></div>'
        html += '<div class="plupload_view_switch">'
        html += '<input type="radio" id="' + obj.id + '_view_list" name="view_mode_' + obj.id + '" checked="checked" />'
        html += '<label class="plupload_button" for="' + obj.id + '_view_list" data-view="list">' + _('List') + '</label>'
        html += '<input type="radio" id="' + obj.id + '_view_thumbs" name="view_mode_' + obj.id + '" />'
        html += '<label class="plupload_button"  for="' + obj.id + '_view_thumbs" data-view="thumbs">' + _('Thumbnails') + '</label>'
        html += '</div>'
        html += '</div>'
        html += '</div>'
        html += '<table class="plupload_filelist plupload_filelist_header ui-widget-header" style="display: none">'
        html += '<tr>'
        html += '<td class="plupload_cell plupload_file_name">' + _('Filename') + '</td>'
        html += '<td class="plupload_cell plupload_file_status">' + _('Status') + '</td>'
        html += '<td class="plupload_cell plupload_file_size">' + _('Size') + '</td>'
        html += '<td class="plupload_cell plupload_file_action">&nbsp;</td>'
        html += '</tr>'
        html += '</table>'
        html += '<div class="plupload_content">'
        html += '<div class="plupload_droptext">' + _("Drag files here.") + '</div>'
        html += '<ul class="plupload_filelist_content"> </ul>'
        html += '<div class="plupload_clearer">&nbsp;</div>'
        html += '</div>'
        html += '<table class="plupload_filelist plupload_filelist_footer ui-widget-header">'
        html += '<tr>'
        html += '<td class="plupload_cell plupload_file_name">'
        html += '<div class="plupload_buttons"><!-- Visible -->'
        html += '<a class="plupload_button plupload_add">' + _('Add Files') + '</a>&nbsp;'
        html += '<a class="plupload_button plupload_start plupload_hidden">' + _('Start Upload') + '</a>&nbsp;'
        html += '<a class="plupload_button plupload_stop plupload_hidden">' + _('Stop Upload') + '</a>&nbsp;'
        html += '</div>'
        html += '<div class="plupload_started plupload_hidden"><!-- Hidden -->'
        html += '<div class="plupload_progress plupload_right"></div>'
        html += '<div class="plupload_upload_status"></div>'
        html += '<div class="plupload_clearer">&nbsp;</div>'
        html += '</div>'
        html += '</td>'
        //html+='<td class="plupload_file_status"><span class="plupload_total_status">0%</span></td>'
        html += '<td class="plupload_file_size"><span class="plupload_total_file_size">0 kb</span></td>'
        html += '<td class="plupload_file_action"></td>'
        html += '</tr>'
        html += '</table>'
        html += '</div>'
        html += '<input class="plupload_count" value="0" type="hidden">'
        html += '</div>'
        obj.html(html);
        $("#plupload_help_icon").click(function () {
            var but = {};
            but[$.t("iknow")] = 'ok';
            $.jBox(Pzoom.template($('#tplUploadHelp').html())(), {
                width: 500,
                height: 350,
                title: $.t('rightSize'),
                buttons: but
            })
        })
    }

    $.widget("ui.plupload", {
        widgetEventPrefix: '',
        contents_bak: '',
        options: {
            browse_button_hover: 'ui-state-hover',
            browse_button_active: 'ui-state-active',
            // widget specific
            dragdrop: true,
            multiple_queues: true, // re-use widget by default
            buttons: {
                browse: true,
                start: true,
                stop: true
            },
            views: {
                list: true,
                thumbs: false,
                active: 'list',
                remember: true // requires: https://github.com/carhartl/jquery-cookie, otherwise disabled even if set to true
            },
            autostart: false,
            sortable: false,
            rename: false,
            max_file_count: 0 // unlimited
        },
        FILE_COUNT_ERROR: -9001,
        _create: function () {
            var id = this.element.attr('id');
            if (!id) {
                id = plupload.guid();
                this.element.attr('id', id);
            }
            this.id = id;
            // backup the elements initial state
            this.contents_bak = this.element.html();
            renderUI(this.element);
            // container, just in case
            this.container = $('.plupload_container', this.element).attr('id', id + '_container');
            this.content = $('.plupload_content', this.element);
            if ($.fn.resizable) {
                this.container.resizable({
                    handles: 's',
                    minHeight: 300
                });
            }
            // list of files, may become sortable
            this.filelist = $('.plupload_filelist_content', this.container).attr({
                id: id + '_filelist',
                unselectable: 'on'
            });
            // buttons
            this.browse_button = $('.plupload_add', this.container).attr('id', id + '_browse');
            this.start_button = $('.plupload_start', this.container).attr('id', id + '_start');
            this.stop_button = $('.plupload_stop', this.container).attr('id', id + '_stop');
            if (!this.options.autostart) {
                this.start_button.removeClass("plupload_hidden")
            }
            this.thumbs_switcher = $('#' + id + '_view_thumbs');
            this.list_switcher = $('#' + id + '_view_list');
            if ($.ui.button) {
                this.browse_button.button({
                    icons: { primary: 'ui-icon-circle-plus' },
                    disabled: true
                });
                this.start_button.button({
                    icons: { primary: 'ui-icon-circle-arrow-e' },
                    disabled: true
                });
                this.stop_button.button({
                    icons: { primary: 'ui-icon-circle-close' }
                });
                this.list_switcher.button({
                    text: false,
                    icons: { secondary: "ui-icon-grip-dotted-horizontal" }
                });
                this.thumbs_switcher.button({
                    text: false,
                    icons: { secondary: "ui-icon-image" }
                });
            }
            // progressbar
            //this.progressbar = $('.plupload_progress_container', this.container);
            //if ($.ui.progressbar) {
            //    this.progressbar.progressbar();
            //}
            // counter
            this.counter = $('.plupload_count', this.element).attr({
                id: id + '_count',
                name: id + '_count'
            });
            // initialize uploader instance
            this._initUploader();
        },
        _initUploader: function () {
            var self = this
                , id = this.id
                , uploader
                , options = {
                    container: id + '_buttons',
                    browse_button: id + '_browse'
                }
                , message = ""
                , message_info = ""
            $('.plupload_buttons', this.element).attr('id', id + '_buttons');
            if (self.options.dragdrop) {
                this.filelist.parent().attr('id', this.id + '_dropbox');
                options.drop_element = this.id + '_dropbox';
            }
            uploader = this.uploader = uploaders[id] = new plupload.Uploader($.extend(this.options, options));
            $("#" + id + "_deleteall").click(function () {
                var list = [].concat(self.getFiles())
                for (var i in list) {
                    self.removeFile(list[i])
                }
            })
            if (self.options.views.thumbs) {
                uploader.settings.required_features.display_media = true;
            }
            uploader.bind('Error', function (up, err) {
                var details = "";
                // message == "" && (message = '<strong class="err_message">' + _("Files has been filtering") + '</strong>');
                switch (err.code) {
                    case plupload.FILE_EXTENSION_ERROR:
                        details = o.sprintf(_("File: %s"), err.file.name);
                        break;
                    case plupload.FILE_SIZE_ERROR:
                        details = o.sprintf(_("File: %s, size: %d, max file size: %d"), err.file.name, plupload.formatSize(err.file.size), self.options.max_file_size);
                        break;
                    /*case plupload.IMAGE_SIZE_ERROR:
                     details = o.sprintf(_("Image: %s, size: %d"), err.file.name, err.file.width + "*" + err.file.height);
                     break;*/
                    case plupload.FILE_DUPLICATE_ERROR:
                        details = o.sprintf(_("%s already present in the queue."), err.file.name);
                        break;
                    case self.FILE_COUNT_ERROR:
                        details = o.sprintf(_("Upload element accepts only %d file(s) at a time. Extra files were stripped."), self.options.max_file_count);
                        break;
                    case plupload.IMAGE_FORMAT_ERROR :
                        details = _("Image format either wrong or not supported.");
                        break;
                    case plupload.IMAGE_MEMORY_ERROR :
                        details = _("Runtime ran out of available memory.");
                        break;

                    /* // This needs a review
                     case plupload.IMAGE_DIMENSIONS_ERROR :
                     details = o.sprintf(_('Resoultion out of boundaries! <b>%s</b> runtime supports images only up to %wx%hpx.'), up.runtime, up.features.maxWidth, up.features.maxHeight);
                     break;	*/
                    case plupload.HTTP_ERROR:
                        details = _("Upload URL might be wrong or doesn't exist.");
                        break;
                }
                self._removeFiles(err.file, false)
                message_info += "<div class='err_details'>" + details + "," + o.sprintf(_("Info:%s"), err.message) + "</div>";
                self._trigger('error', null, { up: up, error: err });
                // do not show UI if no runtime can be initialized
                if (err.code === plupload.INIT_ERROR) {
                    setTimeout(function () {
                        self.destroy();
                    }, 1);
                } else if (err.code === plupload.HTTP_ERROR) {
                    message = '<strong>' + err.message + '</strong>';
                    message += " <i>" + details + "</i>";
                    self.notify('error', message);
                    message_info = ""
                }
            });
            uploader.bind('PostInit', function (up) {
                // all buttons are optional, so they can be disabled and hidden
                if (!self.options.buttons.browse) {
                    self.browse_button.button('disable').hide();
                    up.disableBrowse(true);
                } else {
                    self.browse_button.button('enable');
                }
                if (!self.options.buttons.start) {
                    self.start_button.button('disable').hide();
                }
                if (!self.options.buttons.stop) {
                    self.stop_button.button('disable').hide();
                }
                if (!self.options.unique_names && self.options.rename) {
                    self._enableRenaming();
                }
                if (self.options.dragdrop && up.features.dragdrop) {
                    self.filelist.parent().addClass('plupload_dropbox');
                }
                self._enableViewSwitcher();
                self.start_button.click(function (e) {
                    if (!$(this).button('option', 'disabled')) {
                        self.start();
                    }
                    e.preventDefault();
                });
                self.stop_button.click(function (e) {
                    self.stop();
                    e.preventDefault();
                });
                self._trigger('ready', null, { up: up });
            });
            // check if file count doesn't exceed the limit
            if (self.options.max_file_count) {
                self.options.multiple_queues = false; // one go only
                uploader.bind('FilesAdded', function (up, selectedFiles) {
                    var selectedCount = selectedFiles.length
                        , extraCount = up.files.length + selectedCount - self.options.max_file_count;
                    if (extraCount > 0) {
                        selectedFiles.splice(selectedCount - extraCount, extraCount);
                        up.trigger('Error', {
                            code: self.FILE_COUNT_ERROR,
                            message: _('File count error.')
                        });
                    }
                });
            }
            // uploader internal events must run first
            uploader.init();
            uploader.bind('FileFiltered', function (up, file) {
                self._addFiles(file);
            });
            uploader.bind('FilesAdded', function (up, files) {
                if (files.length > 0) {
                    self._trigger('selected', null, { up: up, files: files });
                    // re-enable sortable
                    if (self.options.sortable && $.ui.sortable) {
                        self._enableSortingList();
                    }
                    self._trigger('updatelist', null, { filelist: self.filelist });
                    if (self.options.autostart) {
                        // set a little delay to make sure that QueueChanged triggered by the core has time to complete
                        setTimeout(function () {
                            self.start();
                        }, 10);
                    }
                } else {
                    message_info == "" || self.notify_err('error', '<strong class="err_message">' + _("Files has been filtering") + '</strong>', message_info);
                    message_info = ""
                }
            });
            uploader.bind('FilesRemoved', function (up, files) {
                self._trigger('removed', null, { up: up, files: files });
            });
            uploader.bind('QueueChanged StateChanged', function () {
                self._handleState();
            });
            uploader.bind('UploadFile', function (up, file) {
                self._handleFileStatus(file);
            });
            uploader.bind('FileUploaded', function (up, file, info) {
                self._handleFileStatus(file);
                file.response = JSON.parse(info.response)
                if (file.response.status == "true") {
                    $('#' + file.id + ' .plupload_file_dummy').show()
                    //$("#" + file.id + " .plupload_file_dummy").html("<img style='display: none' src='"+Pzoom.Config.displayImageUrl + file.response.ImgUrl + "'/>")
                    $("#" + file.id + " .plupload_file_size em").text(file.response.ImgWidth + "*" + file.response.ImgHeight)
                    /*$("#" + file.id + " .plupload_file_dummy img").autoResizeImage(306, 140, function () {
                     this.style.marginTop = (140 - this.height) * 0.5 + "px"
                     $(this).fadeIn(300)
                     })*/
                    $("#" + file.id + " .plupload_file_dummy").autoResizeImage({
                        maxWidth: 306,
                        maxHeight: 140,
                        src:  file.response.ImgUrl,
                        type: file.response.ImgFormat == ".swf" ? "flash" : "image"
                    })
                    self._addFormFields(file);
                }
                self._trigger('uploaded', null, { up: up, file: file, info: info });
            });
            uploader.bind('UploadProgress', function (up, file) {
                self._handleFileStatus(file);
                self._updateTotalProgress();
                self._trigger('progress', null, { up: up, file: file });
            });
            uploader.bind('UploadComplete', function (up, files) {
                //self.options.image_box_array
                var details = "", isError = false
                for (var i in files) {
                    self._handleFileStatus(files[i]);
                    if (files[i].response.status == "false") {
                        message == "" && (message = '<strong class="err_message">' + _("Files has been filtering") + '</strong>');
                        switch (files[i].response.ImgError) {
                            case "Img_003":
                                details = o.sprintf(_("Image: %s, size: %d"), files[i].name, files[i].response.ImgWidth + "*" + files[i].response.ImgHeight);
                                message_info += "<div class='err_details'>" + details + "," + o.sprintf(_("Info:%s"), _("Image size error.")) + "</div>";
                                break;
                        }
                        self._removeFiles(files[i], false)
                        isError = true
                    }
                }
                message_info == "" || self.notify_err('error', '<strong class="err_message">' + _("Files has been filtering") + '</strong>', message_info);
                message_info = ""
                self._trigger('complete', null, { up: up, files: files });
            });
        },
        _setOption: function (key, value) {
            var self = this;
            if (key == 'buttons' && typeof(value) == 'object') {
                value = $.extend(self.options.buttons, value);
                if (!value.browse) {
                    self.browse_button.button('disable').hide();
                    self.uploader.disableBrowse(true);
                } else {
                    self.browse_button.button('enable').show();
                    self.uploader.disableBrowse(false);
                }
                if (!value.start) {
                    self.start_button.button('disable').hide();
                } else {
                    self.start_button.button('enable').show();
                }
                if (!value.stop) {
                    self.stop_button.button('disable').hide();
                } else {
                    self.start_button.button('enable').show();
                }
            }
            self.uploader.settings[key] = value;
        },
        /**
         Start upload. Triggers `start` event.

         @method start
         */
        start: function () {
            this.uploader.start();
            this._trigger('start', null, { up: this.uploader });
        },
        /**
         Stop upload. Triggers `stop` event.

         @method stop
         */
        stop: function () {
            this.uploader.stop();
            this._trigger('stop', null, { up: this.uploader });
        },
        /**
         Enable browse button.

         @method enable
         */
        enable: function () {
            this.browse_button.button('enable');
            this.uploader.disableBrowse(false);
        },
        /**
         Disable browse button.

         @method disable
         */
        disable: function () {
            this.browse_button.button('disable');
            this.uploader.disableBrowse(true);
        },
        /**
         Retrieve file by it's unique id.

         @method getFile
         @param {String} id Unique id of the file
         @return {plupload.File}
         */
        getFile: function (id) {
            var file;
            if (typeof id === 'number') {
                file = this.uploader.files[id];
            } else {
                file = this.uploader.getFile(id);
            }
            return file;
        },
        /**
         Return array of files currently in the queue.

         @method getFiles
         @return {Array} Array of files in the queue represented by plupload.File objects
         */
        getFiles: function () {
            return this.uploader.files;
        },
        /**
         Remove the file from the queue.

         @method removeFile
         @param {plupload.File|String} file File to remove, might be specified directly or by it's unique id
         */
        removeFile: function (file) {
            if (plupload.typeOf(file) === 'string') {
                file = this.getFile(file);
            }
            this._removeFiles(file);
        },
        /**
         Clear the file queue.

         @method clearQueue
         */
        clearQueue: function () {
            this.uploader.splice();
        },
        /**
         Retrieve internal plupload.Uploader object (usually not required).

         @method getUploader
         @return {plupload.Uploader}
         */
        getUploader: function () {
            return this.uploader;
        },
        /**
         Trigger refresh procedure, specifically browse_button re-measure and re-position operations.
         Might get handy, when UI Widget is placed within the popup, that is constantly hidden and shown
         again - without calling this method after each show operation, dialog trigger might get displaced
         and disfunctional.

         @method refresh
         */
        refresh: function () {
            this.uploader.refresh();
        },
        /**
         Display a message in notification area.

         @method notify
         @param {Enum} type Type of the message, either `error` or `info`
         @param {String} message The text message to display.
         */
        notify: function (type, message) {
            var detail = detail || ""
            $(".notify").remove()
            var popup = $('<div class="plupload_message notify">' + '<span class="plupload_message_close ui-icon ui-icon-circle-close" title="' + _('Close') + '"></span>' + '<p><span class="ui-icon"></span>' + message + '</p></div>');
            popup.addClass('ui-state-' + (type === 'error' ? 'error' : 'highlight')).find('p .ui-icon').addClass('ui-icon-' + (type === 'error' ? 'alert' : 'info')).end().find('.plupload_message_close').click(function () {
                popup.remove();
            }).end();
            $('.plupload_header', this.container).append(popup);
        },
        notify_err: function (type, message, detail) {
            var detail = detail || ""
            $(".err_info").remove()
            var popup = $('<div class="plupload_message err_info">' + '<span class="plupload_message_close ui-icon ui-icon-circle-close" title="' + _('Close') + '"></span>' + '<p><span class="ui-icon"></span>' + message + '</p><div class="err_detail_info">' + detail + '</div>' + '</div>');
            popup.addClass('ui-state-' + (type === 'error' ? 'error' : 'highlight')).find('p .ui-icon').addClass('ui-icon-' + (type === 'error' ? 'alert' : 'info')).end().find('.plupload_message_close').click(function () {
                popup.remove();
            }).end();
            $('.plupload_header', this.container).append(popup);
        },
        /**
         Destroy the widget, the uploader, free associated resources and bring back original html.

         @method destroy
         */
        destroy: function () {
            this._removeFiles([].slice.call(this.uploader.files));
            // destroy uploader instance
            this.uploader.destroy();
            // unbind all button events
            $('.plupload_button', this.element).unbind();
            // destroy buttons
            if ($.ui.button) {
                $('.plupload_add, .plupload_start, .plupload_stop', this.container).button('destroy');
            }
            // destroy progressbar
            /*if ($.ui.progressbar) {
             this.progressbar.progressbar('destroy');
             }*/
            // destroy sortable behavior
            if ($.ui.sortable && this.options.sortable) {
                $('tbody', this.filelist).sortable('destroy');
            }
            // restore the elements initial state
            this.element.empty().html(this.contents_bak);
            this.contents_bak = '';
            $.Widget.prototype.destroy.apply(this);
        },
        _handleState: function () {
            var up = this.uploader;
            if (up.state === plupload.STARTED) {
                $(this.start_button).button('disable');
                $([]).add(this.stop_button).add('.plupload_started').removeClass('plupload_hidden');
                $('.plupload_upload_status', this.element).html(o.sprintf(_('Uploaded %d/%d files'), up.total.uploaded, up.files.length));
                $('.plupload_header_content', this.element).addClass('plupload_header_content_bw');
            } else if (up.state === plupload.STOPPED) {
                $([]).add(this.stop_button).add('.plupload_started').addClass('plupload_hidden');
                if (this.options.multiple_queues) {
                    $('.plupload_header_content', this.element).removeClass('plupload_header_content_bw');
                } else {
                    $([]).add(this.browse_button).add(this.start_button).button('disable');
                    up.disableBrowse();
                }
                if (up.files.length === (up.total.uploaded + up.total.failed)) {
                    this.start_button.button('disable');
                } else {
                    this.start_button.button('enable');
                }
                this._updateTotalProgress();
            }
            if (up.total.queued === 0) {
                $('.ui-button-text', this.browse_button).html(_('Add Files'));
            } else {
                $('.ui-button-text', this.browse_button).html(o.sprintf(_('%d files queued'), up.total.queued));
            }
            up.refresh();
        },
        _handleFileStatus: function (file) {
            var self = this, actionClass, iconClass;
            // since this method might be called asynchronously, file row might not yet be rendered
            if (!$('#' + file.id).length) {
                return;
            }
            switch (file.status) {
                case plupload.DONE:
                    actionClass = 'plupload_done';
                    //iconClass = 'ui-icon ui-icon-circle-check';
                    iconClass = 'ui-icon ui-icon-delete';
                    break;
                case plupload.FAILED:
                    actionClass = 'ui-state-error plupload_failed';
                    //iconClass = 'ui-icon ui-icon-alert';
                    iconClass = 'ui-icon ui-icon-delete';
                    break;
                case plupload.QUEUED:
                    actionClass = 'plupload_delete';
                    //iconClass = 'ui-icon ui-icon-circle-minus';
                    iconClass = 'ui-icon ui-icon-delete';
                    break;
                case plupload.UPLOADING:
                    actionClass = 'ui-state-highlight plupload_uploading';
                    //iconClass = 'ui-icon ui-icon-circle-arrow-w';
                    iconClass = 'ui-icon ui-icon-delete';
                    break;
            }
            actionClass += ' ui-state-default plupload_file';
            $('#' + file.id).attr('class', actionClass).find('.ui-icon').attr('class', iconClass).end().filter('.plupload_delete, .plupload_done, .plupload_failed').find('.ui-icon').click(function (e) {
                self._removeFiles(file);
                e.preventDefault();
            });
        },
        _updateTotalProgress: function () {
            var up = this.uploader;
            // Scroll to end of file list
            this.filelist[0].scrollTop = this.filelist[0].scrollHeight;
            //this.progressbar.progressbar('value', up.total.percent);
            //this.element.find('.plupload_total_status').html(up.total.percent + '%').end()
            this.element.find('.plupload_total_file_size').html(plupload.formatSize(up.total.size)).end().find('.plupload_upload_status').html(o.sprintf(_('Uploaded %d/%d files'), up.total.uploaded, up.files.length));
        },
        _displayThumbs: function () {
            var self = this
                , tw, th // thumb width/height
                , cols
                , num = 0 // number of simultaneously visible thumbs
                , thumbs = [] // array of thumbs to preload at any given moment
                , loading = false;
            if (!this.options.views.thumbs) {
                return;
            }
            function onLast(el, eventName, cb) {
                var timer;
                el.on(eventName, function () {
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        clearTimeout(timer);
                        cb();
                    }, 300);
                });
            }

            // calculate number of simultaneously visible thumbs
            function measure() {
                if (!tw || !th) {
                    var wrapper = $('.plupload_file:eq(0)', self.filelist);
                    tw = wrapper.outerWidth(true);
                    th = wrapper.outerHeight(true);
                }
                var aw = self.content.width(), ah = self.content.height();
                cols = Math.floor(aw / tw);
                num = cols * (Math.ceil(ah / th) + 1);
            }

            function pickThumbsToLoad() {
                // calculate index of virst visible thumb
                var startIdx = Math.floor(self.content.scrollTop() / th) * cols;
                // get potentially visible thumbs that are not yet visible
                thumbs = $('.plupload_file', self.filelist).slice(startIdx, startIdx + num).filter(':not(.plupload_file_thumb_loaded)').get();
            }

            function init() {
                function mpl() {
                    if (self.view_mode !== 'thumbs') {
                        return;
                    }
                    measure();
                    pickThumbsToLoad();
                    //lazyLoad();
                }

                if ($.fn.resizable) {
                    onLast(self.container, 'resize', mpl);
                }
                onLast(self.window, 'resize', mpl);
                onLast(self.content, 'scroll', mpl);
                self.element.on('viewchanged selected', mpl);
                mpl();
            }

            function preloadThumb(file, cb) {
                var img = new o.Image();
                img.onload = function () {
                    var thumb = $('#' + file.id + ' .plupload_file_thumb', self.filelist).html('');
                    this.embed(thumb[0], {
                        width: 306,
                        height: 140,
                        crop: false,
                        swf_url: o.resolveUrl(self.options.flash_swf_url),
                        xap_url: o.resolveUrl(self.options.silverlight_xap_url)
                    });
                };
                img.bind("embedded", function () {
                    $('#' + file.id + ' .plupload_file_thumb canvas').css("margin-top", (140 - $('#' + file.id + ' .plupload_file_thumb canvas').height()) * 0.5)
                })
                img.bind("embedded error", function () {
                    $('#' + file.id, self.filelist).addClass('plupload_file_thumb_loaded');
                    $('#' + file.id + ' .plupload_file_dummy').show()
                    this.destroy();
                    setTimeout(cb, 1); // detach, otherwise ui might hang (in SilverLight for example)
                });
                //console.log(file.getSource())
                img.load(file.getSource());
            }

            function lazyLoad() {
                if (self.view_mode !== 'thumbs' || loading) {
                    return;
                }
                pickThumbsToLoad();
                if (!thumbs.length) {
                    return;
                }
                loading = true;
                preloadThumb(self.getFile($(thumbs.shift()).attr('id')), function () {
                    loading = false;
                    lazyLoad();
                });
            }

            // this has to run only once to measure structures and bind listeners
            this.element.on('selected', function onselected() {
                self.element.off('selected', onselected);
                //init();
            });
        },
        _addFiles: function (files) {
            var self = this, file_html;
            file_html = '<li class="plupload_file ui-state-default" id="%id%">'
            file_html += '<div class="plupload_file_thumb">'
            //file_html += '<div class="plupload_file_percent"> </div>'
            file_html += '<div class="plupload_file_dummy ui-widget-content"><span class="ui-state-disabled">%ext%</span></div>'
            file_html += '</div>'
            file_html += '<div class="plupload_file_name" title="%name%"><span class="plupload_file_namespan">%name% </span></div>'
            file_html += '<div class="plupload_file_action"><div title="' + o.sprintf(_("Delete")) + '" class="ui-icon"> </div></div>'
            file_html += '<div class="plupload_file_size"><em style="color:#666">%width%*%height%</em></div>'
            file_html += '<div class="plupload_file_fields"> </div>'
            file_html += '</li>';
            if (plupload.typeOf(files) !== 'array') {
                files = [files];
            }
            $.each(files, function (i, file) {
                var ext = o.Mime.getFileExtension(file.name) || 'none';
                self.filelist.append(file_html.replace(/%(\w+)%/g, function ($0, $1) {
                    if ('size' === $1) {
                        return plupload.formatSize(file.size);
                    } else if ('ext' === $1) {
                        return ext.toUpperCase();
                    } else {
                        return file[$1] || '';
                    }
                }));
                self._handleFileStatus(file);
            });
            $('.plupload_content', this.container).scrollTop($('.plupload_content')[0].scrollHeight);
        },
        _removeFiles: function (files, animate) {
            var animate = typeof(animate) == "undefined" ? "true" : animate
            var self = this, up = this.uploader;
            if (plupload.typeOf(files) !== 'array') {
                files = [files];
            }
            // destroy sortable if enabled
            if ($.ui.sortable && this.options.sortable) {
                $('tbody', self.filelist).sortable('destroy');
            }
            $.each(files, function (i, file) {
                /*$('#' + file.id).toggle("highlight", function () {
                 this.remove();
                 });*/
                if (animate) {
                    $('#' + file.id).fadeOut(300, function () {
                        this.remove();
                    })
                } else {
                    $('#' + file.id).remove();
                }
                up.removeFile(file);
            });
            if (up.files.length) {
                // re-initialize sortable
                if (this.options.sortable && $.ui.sortable) {
                    this._enableSortingList();
                }
            }
            this._trigger('updatelist', null, { filelist: this.filelist });
        },
        _addFormFields: function (file) {
            var self = this;
            // re-add from fresh
            $('#' + file.id + ' .plupload_file_fields', this.filelist).html('');
            // plupload.each(this.uploader.files, function (file, count) {
            if (file.status == plupload.DONE) {
                var imageType = {
                    ".jpg": "IMAGE_JPEG",
                    ".swf": "FLASH",
                    ".png": "IMAGE_PNG",
                    ".gif": "IMAGE_GIF"
                }
                var fields = Pzoom.template($("#tplImageCreativeInfo").html())({id: file.id, mimeType: imageType[file.response.ImgFormat]})
                /*fields += '<div class="fields_item">' + $.t("creativeTitle") + ':<input class="txt_ipt" type="text" data-validate="name" id="' + file.id + '_creativeTitle"/></div>';
                 fields += '<div class="fields_item">' + $.t("creativeDisplayUrl") + ':<input inputtips="www.example.com" class="txt_ipt" data-validate="displayUrl" invalid_message="'+ $.t("_tips.urlError")+'" type="text" id="' + file.id + '_creativeDisplayUrl"/></div>';
                 fields += '<div class="fields_item">' + $.t("creativeCallUrl") + ':<select id="imageTargetNetPrefix"><option value="http://">http://</option><option value="https://">https://</option></select><input inputtips="www.example.com" class="txt_ipt" data-validate="destinationUrl" invalid_message="'+ $.t("_tips.urlError")+'" type="text" id="' + file.id + '_creativeCallUrl"/></div>';*/
                $('#' + file.id + ' .plupload_file_fields').html(fields);
                $('#' + file.id + '_targetNetPrefix').customSelect({ height: 24, width: 78})
                $('#' + file.id).inputTips()
                $("#" + file.id + "_creativeCallUrl").focusin(function () {
                    $(this).val($(this).val() == "" ? $("#" + file.id + "_creativeDisplayUrl").val() : $(this).val()).change()
                }).on('keyup',function(){
                    var displayUrl = $('#' + file.id + '_targetNetPrefix').val()+$(this).val();
                    if(Pzoom.Tool.domainValidate(displayUrl)){
                        var domainURI = function(str){
                                var durl=/(http|https):\/\/([^\/]+)(\/)?/i,
                                    domain = str.match(durl),
                                    result = '';
                                if(domain){
                                    result = domain[2]
                                }
                                return result;
                             }

                        $("#" + file.id + "_creativeDisplayUrl").val(domainURI(displayUrl)).keyup();
                    }else{
                        $("#" + file.id + "_creativeDisplayUrl").val('');
                    }

                });
            }
            //});
            this.counter.val(this.uploader.files.length);
            $('.plupload_content', this.container).scrollTop($('.plupload_content')[0].scrollHeight);
        },
        _viewChanged: function (view) {
            // update or write a new cookie
            if (this.options.views.remember && $.cookie) {
                $.cookie('plupload_ui_view', view, { expires: 7, path: '/' });
            }
            // ugly fix for IE6 - make content area stretchable
            if (o.Env.browser === 'IE' && o.Env.version < 7) {
                this.content.attr('style', 'height:expression(document.getElementById("' + this.id + '_container' + '").clientHeight - ' + (view === 'list' ? 133 : 103) + ');');
            }
            this.container.removeClass('plupload_view_list plupload_view_thumbs').addClass('plupload_view_' + view);
            this.view_mode = view;
            this._trigger('viewchanged', null, { view: view });
        },
        _enableViewSwitcher: function () {
            var self = this
                , view
                , switcher = $('.plupload_view_switch', this.container)
                , buttons
                , button;
            plupload.each(['list', 'thumbs'], function (view) {
                if (!self.options.views[view]) {
                    switcher.find('[for="' + self.id + '_view_' + view + '"], #' + self.id + '_view_' + view).remove();
                }
            });
            // check if any visible left
            buttons = switcher.find('.plupload_button');
            if (buttons.length === 1) {
                switcher.hide();
                view = buttons.eq(0).data('view');
                this._viewChanged(view);
            } else if ($.ui.button && buttons.length > 1) {
                if (this.options.views.remember && $.cookie) {
                    view = $.cookie('plupload_ui_view');
                }
                // if wierd case, bail out to default
                if (!~plupload.inArray(view, ['list', 'thumbs'])) {
                    view = this.options.views.active;
                }
                switcher.show().buttonset().find('.ui-button').click(function (e) {
                    view = $(this).data('view');
                    self._viewChanged(view);
                    e.preventDefault(); // avoid auto scrolling to widget in IE and FF (see #850)
                });
                // if view not active - happens when switcher wasn't clicked manually
                button = switcher.find('[for="' + self.id + '_view_' + view + '"]');
                if (button.length) {
                    button.trigger('click');
                }
            } else {
                switcher.show();
                this._viewChanged(this.options.views.active);
            }
            // initialize thumb viewer if requested
            if (this.options.views.thumbs) {
                this._displayThumbs();
            }
        },
        _enableRenaming: function () {
            var self = this;
            this.filelist.dblclick(function (e) {
                var nameSpan = $(e.target), nameInput, file, parts, name, ext = "";
                if (!nameSpan.hasClass('plupload_file_namespan')) {
                    return;
                }
                // Get file name and split out name and extension
                file = self.uploader.getFile(nameSpan.closest('.plupload_file')[0].id);
                name = file.name;
                parts = /^(.+)(\.[^.]+)$/.exec(name);
                if (parts) {
                    name = parts[1];
                    ext = parts[2];
                }
                // Display input element
                nameInput = $('<input class="plupload_file_rename" type="text" />').width(nameSpan.width()).insertAfter(nameSpan.hide());
                nameInput.val(name).blur(function () {
                    nameSpan.show().parent().scrollLeft(0).end().next().remove();
                }).keydown(function (e) {
                        var nameInput = $(this);
                        if ($.inArray(e.keyCode, [13, 27]) !== -1) {
                            e.preventDefault();
                            // Rename file and glue extension back on
                            if (e.keyCode === 13) {
                                file.name = nameInput.val() + ext;
                                nameSpan.html(file.name);
                            }
                            nameInput.blur();
                        }
                    })[0].focus();
            });
        },
        _enableSortingList: function () {
            var self = this;
            if ($('.plupload_file', this.filelist).length < 2) {
                return;
            }
            // destroy sortable if enabled
            $('tbody', this.filelist).sortable('destroy');
            // enable
            this.filelist.sortable({
                items: '.plupload_delete',
                cancel: 'object, .plupload_clearer',
                stop: function () {
                    var files = [];
                    $.each($(this).sortable('toArray'), function (i, id) {
                        files[files.length] = self.uploader.getFile(id);
                    });
                    files.unshift(files.length);
                    files.unshift(0);
                    // re-populate files array
                    Array.prototype.splice.apply(self.uploader.files, files);
                }
            });
        }
    });
}(window, document, plupload, mOxie, jQuery));
