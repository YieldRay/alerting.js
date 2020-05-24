"use strict";

function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }
  return _typeof(obj);
}

function alerting(options, callback) {
  return new Promise(function(resolve, reject) {
    var buttons, content;
    var container = document.createElement("div");
    container.className = "alerting-container";
    var mask = document.createElement("div");
    mask.className = "alerting-mask";
    var modal = document.createElement("div");
    modal.className = "alerting-modal";

    if (_typeof(options) == "object") {
      if ("timeout" in options) {
        if (!isNaN(Number(options.timeout))) {
          setTimeout(function() {
            return waitClose().then(function() {
              return resolve(null);
            });
          }, Number(options.timeout));
        }
      }

      if ("style" in options) {
        modal.style.cssText = options.style.modal;
        container.style.cssText = options.style.container;
        modal.style.cssText = options.style.modal;
      }

      if ("elements" in options) {
        var elements = options.elements;

        for (name in elements) {
          if (name == "close") {
            var close = document.createElement("div");
            close.innerHTML = "✖";
            close.className = "alerting-close";

            close.onclick = function() {
              return waitClose().then(function() {
                return resolve(null);
              });
            };

            container.prepend(close);
            continue;
          }

          var ele =
            typeof elements[name] == "function"
              ? elements[name]()
              : elements[name];
          container.append(ele);
        }
      }

      if ("buttons" in options) {
        var _buttons = options.buttons;

        var _loop = function _loop() {
          var $btn = document.createElement("button");
          var btn = _buttons[name];
          $btn.innerHTML = btn.content ? btn.content : "button";

          if (name == "confirm") {
            $btn.className += " alerting-confirm";
            $btn.innerHTML = btn.content ? btn.content : "Confirm";
          }

          if (name == "cancel") {
            $btn.className += " alerting-cancel";
            $btn.innerHTML = btn.content ? btn.content : "Cancel";
          }

          btn.style ? ($btn.style.cssText = btn.style) : "";
          btn.class ? ($btn.className += " " + btn.class) : "";
          $btn.addEventListener("click", function() {
            if (typeof btn.data == "undefined") {
              btn.data =
                name == "confirm" ? true : name == "cancel" ? false : "";
            } else {
              btn.data = typeof btn.data == "function" ? btn.data() : btn.data;
            }

            if ("close" in btn && btn.close == false) {
              resolve(btn.data);
            } else {
              waitClose().then(function() {
                return resolve(btn.data);
              });
            }
          });
          container.append($btn);
        };

        for (name in _buttons) {
          _loop();
        }
      }

      content = options.content;
    } else {
      modal.className += " alerting-notObject-modal";
      container.className += " alerting-notObject-container";
      content = options.toString();
    } // end if

    container.insertAdjacentHTML("afterbegin", content);
    modal.prepend(container);
    callback ? callback(container) : "";

    function waitClose() {
      return new Promise(function(resolve, reject) {
        modal.className += " alerting-fadeOut";
        mask.className += " alerting-fadeOut";
        modal.addEventListener("animationend", function() {
          modal.remove();
          mask.remove();
          resolve();
        });
      });
    } // end function

    mask.addEventListener("click", function() {
      console.debug("clicked mask");
      waitClose().then(function() {
        return resolve(null);
      });
    });
    document.body.append(mask, modal);
  });
}
