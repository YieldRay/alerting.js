
function alerting(options, callback) {

    return new Promise((resolve, reject) => {

        let buttons, content;
        let container = document.createElement("div")
        container.className = "alerting-container"
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
            }


            if ("elements" in options) {
                let elements = options.elements

                for (name in elements) {

                    if (name == "close") {
                        let close = document.createElement("div")
                        close.innerHTML = '✖'
                        close.className = 'alerting-close'
                        close.onclick = () => waitClose().then(() => resolve(null))
                        container.prepend(close)
                        continue
                    }

                    let ele = typeof elements[name] == "function" ? elements[name]() : elements[name]
                    container.append(ele)
                }
            }


            if ("buttons" in options) {
                let buttons = options.buttons

                for (name in buttons) {
                    let $btn = document.createElement("button")
                    let btn = buttons[name]
                    $btn.innerHTML = btn.content ? btn.content : 'button'

                    if (name == "confirm") {
                        $btn.className += " alerting-confirm"
                        $btn.innerHTML = btn.content ? btn.content : `Confirm`
                    }

                    if (name == "cancel") {
                        $btn.className += " alerting-cancel"
                        $btn.innerHTML = btn.content ? btn.content : `Cancel`
                    }

                    btn.style ? $btn.style.cssText = btn.style : ""
                    btn.class ? $btn.className += ' ' + btn.class : "";
                    $btn.addEventListener('click', () => {
                        if (typeof btn.data == "undefined") {
                            btn.data = (name == "confirm") ? true : ((name == "cancel") ? false : '')
                        } else {
                            btn.data = (typeof btn.data == "function") ? btn.data() : btn.data
                        }

                        if ("close" in btn && btn.close == false) {
                            resolve(btn.data)
                        } else {
                            waitClose().then(() => resolve(btn.data))
                        }
                    })
                    container.append($btn)
                }
            }


            content = options.content
        } else {
            modal.className += " alerting-notObject-modal"
            container.className += " alerting-notObject-container"
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
                });
            })
        } // end function



        mask.addEventListener('click', () => {
            console.debug("clicked mask")
            waitClose().then(() => resolve(null))
        })

        document.body.append(mask, modal)

    })
}
