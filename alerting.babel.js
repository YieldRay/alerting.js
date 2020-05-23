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

(function() {
  var style = document.createElement("style");
  style.innerText =
    "\n        .alerting-mask {\n            position: fixed;\n            top: 0;\n            right: 0;\n            bottom: 0;\n            left: 0;\n            background: rgba(0, 0, 0, 0.2);\n            width: 100%;\n            height: 100%;\n            transition: opacity 0.4s ease-in\n        }\n\n        .alerting-modal {\n            position: fixed;\n            top: 50%;\n            left: 50%;\n            max-width: 100%;\n            max-height: 100%;\n            transform: translate(-50%, -50%);\n            border-radius: 2px;\n            background: #fff;\n            box-shadow: 2px 3px 20px rgba(0, 0, 0, 0.2);\n            transition: opacity 0.4s ease-in\n        }\n\n        .alerting-container {\n            width: 100%;\n            height: 100%;\n            overflow: auto\n        }\n\n        .alerting-confirm {\n            border: 0;\n            border-radius: 3px;\n            background-color: deepskyblue;\n            color: snow\n        }\n\n        .alerting-cancel {\n            border: 0;\n            border-radius: 3px;\n            background-color: lightcoral;\n            color: snow\n        }\n\n        .alerting-fadeOut {\n            animation-duration: 0.4s;\n            animation-name: fade-out;\n        }\n\n        .alerting-fadeIn {\n            animation-duration: 0.4s;\n            animation-name: fade-in;\n        }\n\n        @keyframes fade-in {\n            from {\n                opacity: 0\n            }\n\n            to {\n                opacity: 1\n            }\n        }\n\n        @keyframes fade-out {\n            from {\n                opacity: 1\n            }\n\n            to {\n                opacity: 0\n            }\n        }";
  document.head.append(style);
})();

function alerting(options, callback) {
  return new Promise(function(resolve, reject) {
    var buttons, content;
    var container = document.createElement("div");
    container.className = "alerting-container ";
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
          $btn.innerHTML = btn.content;
          btn.style ? ($btn.style.cssText = btn.style) : "";
          $btn.addEventListener(
            "click",
            function() {
              btn.data = typeof btn.data == "function" ? btn.data() : btn.data;

              if ("close" in btn && btn.close == false) {
                resolve(btn.data);
              } else {
                waitClose().then(function() {
                  return resolve(btn.data);
                });
              }
            },
            true
          );
          container.append($btn);
        };

        for (name in _buttons) {
          _loop();
        }
      }

      content = options.content;
    } else {
      content = options.toString();
    } // end if

    container.insertAdjacentHTML("afterbegin", content);
    modal.prepend(container);
    callback ? callback(container) : "";

    function waitClose() {
      return new Promise(function(resolve, reject) {
        modal.className += " alerting-fadeOut";
        mask.className += " alerting-fadeOut";
        modal.addEventListener(
          "animationend",
          function() {
            modal.remove();
            mask.remove();
            resolve();
          },
          false
        );
      });
    } // end function

    mask.addEventListener(
      "click",
      function() {
        waitClose().then(function() {
          return resolve(null);
        });
      },
      true
    );
    document.body.append(mask, modal);
  });
}
