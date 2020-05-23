      (function () {
            let style = document.createElement("style")
            style.innerText = `
        .alerting-mask {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background: rgba(0, 0, 0, 0.2);
            width: 100%;
            height: 100%;
            transition: opacity 0.4s ease-in
        }

        .alerting-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            max-width: 100%;
            max-height: 100%;
            transform: translate(-50%, -50%);
            border-radius: 2px;
            background: #fff;
            box-shadow: 2px 3px 20px rgba(0, 0, 0, 0.2);
            transition: opacity 0.4s ease-in
        }

        .alerting-container {
            width: 100%;
            height: 100%;
            overflow: auto
        }

        .alerting-confirm {
            border: 0;
            border-radius: 3px;
            background-color: deepskyblue;
            color: snow
        }

        .alerting-cancel {
            border: 0;
            border-radius: 3px;
            background-color: lightcoral;
            color: snow
        }

        .alerting-fadeOut {
            animation-duration: 0.4s;
            animation-name: fade-out;
        }

        .alerting-fadeIn {
            animation-duration: 0.4s;
            animation-name: fade-in;
        }

        @keyframes fade-in {
            from {
                opacity: 0
            }

            to {
                opacity: 1
            }
        }

        @keyframes fade-out {
            from {
                opacity: 1
            }

            to {
                opacity: 0
            }
        }`
            document.head.append(style)


        })()





        

        function alerting(options, callback) {

            return new Promise((resolve, reject) => {

                let buttons, content;
                let container = document.createElement("div")
                container.className = "alerting-container "
                let mask = document.createElement("div")
                mask.className = "alerting-mask"
                let modal = document.createElement("div")
                modal.className = "alerting-modal"


                if (typeof options == "object") {

                    if ("timeout" in options) {
                        if (!isNaN(Number(options.timeout))) {
                            setTimeout(() => waitClose().then(() => resolve(null)), Number(options.timeout))
                        }
                    }
                    if ("style" in options) {
                        modal.style.cssText = options.style.modal
                        container.style.cssText = options.style.container
                        modal.style.cssText = options.style.modal
                    }


                    if ("elements" in options) {
                        let elements = options.elements

                        for (name in elements) {
                            let ele = typeof elements[name] == "function" ? elements[name]() : elements[name]
                            container.append(ele)
                        }
                    }


                    if ("buttons" in options) {
                        let buttons = options.buttons

                        for (name in buttons) {
                            let $btn = document.createElement("button")
                            let btn = buttons[name]
                            $btn.innerHTML = btn.content
                            btn.style ? $btn.style.cssText = btn.style : ""
                            $btn.addEventListener('click', () => {
                                btn.data = typeof btn.data == "function" ? btn.data() : btn.data
                                if ("close" in btn && btn.close == false) {
                                    resolve(btn.data)
                                } else {
                                    waitClose().then(() => resolve(btn.data))
                                }
                            }, true)
                            container.append($btn)
                        }
                    }


                    content = options.content
                } else {
                    content = options.toString()
                } // end if


                container.insertAdjacentHTML('afterbegin', content)
                modal.prepend(container)
                callback ? callback(container) : ""



                function waitClose() {
                    return new Promise((resolve, reject) => {
                        modal.className += " alerting-fadeOut"
                        mask.className += " alerting-fadeOut"
                        modal.addEventListener("animationend", () => {
                            modal.remove()
                            mask.remove()
                            resolve()
                        }, false);
                    })
                } // end function



                mask.addEventListener('click', () => {
                    waitClose().then(() => resolve(null))
                }, true)

                document.body.append(mask, modal)

            })
        }