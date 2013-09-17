// Generated by CoffeeScript 1.6.3
(function() {
  var uniqid;

  (function($) {
    var NeklandEditor;
    if (window.nekland == null) {
      window.nekland = {};
    }
    if (window.nekland.lang == null) {
      window.nekland.lang = {};
    }
    window.nekland.lang.editor = {};
    window.nekland.lang.editor['en'] = {
      swapToText: 'swap to text',
      swapToHtml: 'swap to html',
      italic: 'italic',
      bold: 'bold',
      addLink: 'add link',
      close: 'close',
      insertLink: 'insert link',
      link: 'link',
      removeLink: 'remove link',
      notALink: 'your link is not a valid link'
    };
    /*
      Nekland Editor
    
      For options parameter, see documentation
      For templates parameter, all is function, see documentation
    
      TODO:
        -> Handle copy/paste process
        -> Add image/link/etc support
    */

    $.fn.neklandEditor = function(_options, _templates) {
      if (_options == null) {
        _options = {};
      }
      if (_templates == null) {
        _templates = {};
      }
      return this.each(function() {
        var $this, editor;
        $this = $(this);
        editor = $this.data('nekland-editor');
        if (!editor) {
          return $this.data('nekland-editor', new NeklandEditor($this, _options, _templates));
        }
      });
    };
    NeklandEditor = (function() {
      function NeklandEditor($textarea, _options, _templates) {
        var self;
        self = this;
        this.settings = $.extend({
          mode: 'classical',
          uid: uniqid(),
          lang: 'en'
        }, _options);
        this.translations = window.nekland.lang.editor[this.settings.lang];
        /*
          Templates definition.
          In this plugin, templates are simple functions.
        */

        this.templates = $.extend({
          buttons: function(buttons) {
            var button, tpl, _i, _len;
            tpl = '<div>';
            for (_i = 0, _len = buttons.length; _i < _len; _i++) {
              button = buttons[_i];
              tpl += button();
            }
            return tpl += '</div>';
          },
          classicalButtons: function() {
            var tpl;
            tpl = '<button type="button" class="btn nekland-editor-command" data-editor-command="bold"><b>' + self.translate('bold', {
              ucfirst: true
            }) + '</b></button>';
            return tpl += '<button type="button" class="btn nekland-editor-command" data-editor-command="italic"><i>' + self.translate('italic', {
              ucfirst: true
            }) + '</i></button>';
          },
          linkButton: function() {
            return "<div class=\"btn-group\">            <a class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\">              " + self.translate('link', {
              ucfirst: true
            }) + "            <span class=\"caret\"></span>            </a>            <ul class=\"dropdown-menu\">              <li>                <a href=\"#\" class=\"open-link-modal\">                  " + self.translate('insertLink', {
              ucfirst: true
            }) + "                </a>              </li>              <li>                <a href=\"#\" class=\"nekland-editor-command\" data-editor-command=\"unlink\" data-prevent=\"no\">                  " + self.translate('removeLink', {
              ucfirst: true
            }) + "                </a>              </li>            </ul>          </div>";
          },
          main: function(buttons, size) {
            var tpl;
            tpl = buttons;
            return tpl += '<div class="nekland-editor-html" style="width:' + size[0] + 'px;height:' + size[1] + 'px" contenteditable="true"></div>';
          },
          switchButton: function(css_class) {
            return '<a href="#" class="' + css_class + '"></a>';
          },
          modals: function() {
            return "<div class=\"modal hide fade nekland-editor-link\" role=\"dialog\" aria-hidden=\"true\">            <div class=\"modal-header\">              <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>              <h3>" + self.translate('addLink', {
              ucfirst: true
            }) + "</h3>            </div>            <div class=\"modal-body\">              <input type=\"text\" class=\"link-input\" style=\"width: 250px;\" />              <p class=\"error link-error\"></p>            </div>            <div class=\"modal-footer\">              <button type=\"button\" class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">" + self.translate('close', {
              ucfirst: true
            }) + "</button>              <button type=\"button\" class=\"btn btn-primary nekland-editor-command\" data-dismiss=\"modal\"                      data-option-selector=\".link-input\" data-editor-command=\"createLink\"                      data-prevent=\"no\">" + self.translate('insertLink', {
              ucfirst: true
            }) + "              </button>            </div>          </div>";
          },
          load: function($element, uid) {
            var $wrapper, html;
            $wrapper = $('<div>', {
              id: 'nekland-editor-wrapper-' + uid
            });
            $element.wrap($wrapper);
            $element.before(this.main(this.buttons([this.classicalButtons, this.linkButton]), [$element.width(), $element.height()]));
            $element.after(this.switchButton('nekland-switch-button'));
            $element.css('display', 'block').hide();
            $wrapper = $('#nekland-editor-wrapper-' + uid);
            if (html = $element.val()) {
              $wrapper.find('.nekland-editor-html').html(html);
            } else {
              $wrapper.find('.nekland-editor-html').html('<p></p>');
            }
            $wrapper.append(this.modals());
            $wrapper.find('.nekland-switch-button').html(self.translate('swapToHtml', {
              ucfirst: true
            }));
            return $wrapper;
          }
        }, _templates);
        this.$wrapper = this.templates.load($textarea, this.settings.uid);
        this.$textarea = $textarea;
        this.$editor = this.$wrapper.find('.nekland-editor-html');
        this.$editor = this.$editor.html(this.p_ize(this.$editor.html()));
        this.lastKey = null;
        this.addEvents();
      }

      NeklandEditor.prototype.command = function($button) {
        var command, node, option, prevent;
        option = null;
        command = $button.data('editor-command');
        if (option = $button.data('option-selector')) {
          option = this.$wrapper.find(option).val();
        }
        if (command === 'createLink') {
          if (!/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(option)) {
            this.$wrapper.find('.link-error').html(this.translate('notALink', {
              ucfirst: true
            }));
            return false;
          }
        } else if (command === 'unlink') {
          node = this.getCurrentNode();
          if (node.tagName === 'A') {
            $(node).replaceWith($(node).text());
            this.synchronize();
            return;
          }
          this.replaceSelection();
        }
        if (this.$editor.is(':visible')) {
          document.execCommand(command, false, option);
        }
        this.synchronize();
        if (prevent = $button.data('prevent')) {
          if (prevent === 'no') {
            return true;
          }
        }
        return false;
      };

      NeklandEditor.prototype.switchEditor = function($switcher) {
        if (this.$editor.is(':visible')) {
          this.$editor.hide();
          this.$textarea.val(this.clearHtml(this.$textarea.val()));
          this.$textarea.show();
          $switcher.html(this.translate('swapToText', {
            ucfirst: true
          }));
        } else {
          this.$editor.html(this.clearHtml(this.$textarea.val()));
          this.$textarea.hide();
          this.$editor.show();
          $switcher.html(this.translate('swapToHtml', {
            ucfirst: true
          }));
        }
        return false;
      };

      NeklandEditor.prototype.addEvents = function() {
        var $switcher, self;
        $switcher = this.$wrapper.find('.nekland-switch-button');
        $switcher.click($.proxy(this.switchEditor, this, $switcher));
        self = this;
        this.$wrapper.find('.nekland-editor-command').click(function() {
          return self.command($(this));
        });
        this.$editor.keyup($.proxy(this.onKeyUp, this));
        this.$wrapper.find('.open-link-modal').click($.proxy(function() {
          this.saveSelection();
          return this.$wrapper.find('.nekland-editor-link').modal('show');
        }, this));
        this.$wrapper.find('.link-input').keydown(this.removeEnter);
      };

      NeklandEditor.prototype.onKeyUp = function(event) {
        this.synchronize();
      };

      NeklandEditor.prototype.synchronize = function() {
        return this.$textarea.val(this.$editor.html());
      };

      NeklandEditor.prototype.translate = function(str, options) {
        var res;
        if (options == null) {
          options = {};
        }
        if (this.translations[str] != null) {
          res = this.translations[str];
        } else {
          throw new Error('Translation missing');
        }
        if (options.ucfirst != null) {
          res = res.charAt(0).toUpperCase() + res.slice(1);
        }
        return res;
      };

      /*
        DOM Manipulation:
      */


      NeklandEditor.prototype.p_ize = function(str) {
        str = $.trim(str);
        if (str === '' || str === '<p></p>') {
          return '<p><br /></p>';
        }
        return str;
      };

      NeklandEditor.prototype.getSelection = function() {
        if (window.getSelection != null) {
          return window.getSelection();
        } else if (document.getSelection != null) {
          return document.getSelection();
        } else {
          return document.selection.createRange();
        }
      };

      NeklandEditor.prototype.setSelection = function(orgn, orgo, focn, foco) {
        var r, sel;
        if (focn === null) {
          focn = orgn;
        }
        if (foco === null) {
          foco = orgo;
        }
        sel = this.getSelection();
        if (!sel) {
          return;
        }
        if (sel.collapse && sel.extend) {
          sel.collapse(orgn, orgo);
          return sel.extend(focn, foco);
        } else {
          r = document.createRange();
          r.setStart(orgn, orgo);
          r.setEnd(focn, foco);
          try {
            sel.removeAllRanges();
          } catch (_error) {}
          return sel.addRange(r);
        }
      };

      NeklandEditor.prototype.getCurrentNode = function() {
        if (window.getSelection != null) {
          return this.getSelectedNode().parentNode;
        }
      };

      NeklandEditor.prototype.getParentNode = function() {
        return $(this.getCurrentNode()).parent()[0];
      };

      NeklandEditor.prototype.getSelectedNode = function() {
        var s;
        if (window.getSelection != null) {
          s = window.getSelection();
          if (s.rangeCount > 0) {
            return this.getSelection().getRangeAt(0).commonAncestorContainer;
          } else {
            return false;
          }
        } else if (document.selection != null) {
          return this.getSelection();
        }
      };

      NeklandEditor.prototype.setFocusNode = function(node) {
        var range, selection;
        range = document.createRange();
        selection = this.getSelection();
        if (selection !== null) {
          selection.collapse(node, 0);
          selection.extend(node, 0);
        }
        return this.$editor.trigger('focus');
      };

      NeklandEditor.prototype.insertNodeAtCaret = function(node) {
        var range, sel;
        sel = this.getSelection;
        if (window.getSelection) {
          if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.collapse(false);
            range.insertNode(node);
            range = range.cloneRange();
            range.selectNodeContents(node);
            range.collapse(false);
            sel.removeAllRanges();
            return sel.addRange(range);
          }
        }
      };

      NeklandEditor.prototype.replaceSelection = function() {
        if ((this.savedSel != null) && (this.savedSelObj != null) && this.savedSel[0].tagName !== 'BODY') {
          if ($(this.savedSel[0]).closest('.nekland-editor-html').size() === 0) {
            return this.$editor.focus();
          } else {
            return this.setSelection(this.savedSel[0], this.savedSel[1], this.savedSelObj[0], this.savedSelObj[1]);
          }
        } else {
          return this.$editor.focus();
        }
      };

      NeklandEditor.prototype.saveSelection = function() {
        this.$editor.focus();
        this.savedSel = this.getOrigin();
        return this.savedSelObj = this.getFocus();
      };

      NeklandEditor.prototype.getOrigin = function() {
        var sel;
        if (!((sel = this.getSelection()) && (sel.anchorNode !== null))) {
          return null;
        }
        return [sel.anchorNode, sel.anchorOffset];
      };

      NeklandEditor.prototype.getFocus = function() {
        var sel;
        if (!((sel = this.getSelection()) && (sel.focusNode !== null))) {
          return null;
        }
        return [sel.focusNode, sel.focusOffset];
      };

      NeklandEditor.prototype.removeEnter = function(e) {
        if (e.which === 13) {
          return e.preventDefault();
        }
      };

      NeklandEditor.prototype.clearHtml = function(html) {
        return html.replace(/&nbsp;/g, ' ', html);
      };

      return NeklandEditor;

    })();
  })(jQuery);

  uniqid = function(prefix, more_entropy) {
    var formatSeed, retId;
    if (typeof prefix === 'undefined') {
      prefix = "";
    }
    formatSeed = function(seed, reqWidth) {
      seed = parseInt(seed, 10).toString(16);
      if (reqWidth < seed.length) {
        return seed.slice(seed.length - reqWidth);
      }
      if (reqWidth > seed.length) {
        return Array(1 + (reqWidth - seed.length)).join('0') + seed;
      }
      return seed;
    };
    if (!this.php_js) {
      this.php_js = {};
    }
    if (!this.php_js.uniqidSeed) {
      this.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
    }
    this.php_js.uniqidSeed++;
    retId = prefix;
    retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
    retId += formatSeed(this.php_js.uniqidSeed, 5);
    if (more_entropy) {
      retId += (Math.random() * 10).toFixed(8).toString();
    }
    return retId;
  };

}).call(this);

/*
//@ sourceMappingURL=nekland-editor.map
*/
