(function (arr) {
    // polyfill for .remove()
    // https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
    arr.forEach(function (item) {
        if (item.hasOwnProperty("remove")) {
            return;
        }
        Object.defineProperty(item, "remove", {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function remove() {
                this.parentNode.removeChild(this);
            },
        });
    });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

class SimpleCustomEvent {
    type: string;
    data: any;
    constructor(type: string, data: any) {
        this.type = type;
        this.data = data;
    }
}

class SimpleEventTarget {
    _listener_map: { [type: string]: Function[] } = {};
    addEventListener(type: string, listener: Function) {
        if (!this._listener_map[type]) {
            this._listener_map[type] = [];
        }
        this._listener_map[type].push(listener);
    }
    removeEventListener(type: string, listener: Function) {
        if (!this._listener_map[type]) return;
        const index = this._listener_map[type].indexOf(listener);
        if (index > -1) this._listener_map[type].splice(index, 1);
    }
    dispatchEvent(event: CustomEvent | SimpleCustomEvent) {
        if (!this._listener_map[event.type]) return true;
        this._listener_map[event.type].forEach((listener) => {
            typeof listener === "function" && listener(event);
        });
        return true; // always true because no preventDefault()
    }
}

class AlertingEvent {
    protected _eventTarget: EventTarget | SimpleEventTarget;
    constructor() {
        this._eventTarget = "EventTarget" in window ? new EventTarget() : new SimpleEventTarget();
    }
    public on(eventName: string, listener: Function): void {
        this._eventTarget.addEventListener(eventName, listener as EventListener);
    }
    public off(eventName: string, listener: Function): void {
        this._eventTarget.removeEventListener(eventName, listener as EventListener);
    }
    public emit(eventName: string, data?: any): boolean {
        return this._eventTarget.dispatchEvent(
            "EventTarget" in window ? new CustomEvent(eventName, { detail: data }) : (new SimpleCustomEvent(eventName, { detail: data }) as any as CustomEvent)
        );
    }
}
// patch event for lifecycle hook

const animationDuration = 200; // ms, animation duration as a substitute for animation end event

function replaceContent(el: HTMLElement, content: string, renderAsHTML = false) {
    el.innerHTML = "";
    if (renderAsHTML) el.innerHTML = content;
    else el.appendChild(document.createTextNode(content));
}

class Modal {
    // the modal has: title, content, buttons
    protected _isOpen = false;
    protected _isMaskClickable = true;
    protected _isRenderAsHTML = false;
    protected _mask = document.createElement("div");
    protected _modal = document.createElement("div");
    protected _title = document.createElement("div");
    protected _content = document.createElement("div");
    protected _buttons = document.createElement("div");
    protected _events = new AlertingEvent();
    public on = this._events.on.bind(this._events);
    public off = this._events.off.bind(this._events);
    protected _emit = this._events.emit.bind(this._events);
    protected _display: any = {
        language: new Set(["en", "zh-CN"]).has(navigator.language) ? navigator.language : "en",
        en: {
            says: "says",
            confirm: "OK",
            cancel: "Cancel",
        },
        "zh-CN": {
            says: "显示",
            confirm: "确认",
            cancel: "取消",
        },
    };
    constructor() {
        this._mask.className = "alerting-mask";
        this._modal.className = "alerting-modal";
        this._title.className = "alerting-title";
        this._content.className = "alerting-content";
        this._buttons.className = "alerting-buttons";
        this._title.innerHTML = location.host + " " + this._display[this._display.language].says;
        this._modal.appendChild(this._title);
        this._modal.appendChild(this._content);
        this._modal.appendChild(this._buttons);
    }

    // as the modal is the principal, only modal is listening to the event
    protected _open(): Promise<void> {
        if (this._isOpen) this.forceClose();
        this._emit("beforeOpen");
        this._mask.classList.remove("alerting-animation-close");
        this._modal.classList.remove("alerting-animation-close");
        return new Promise((resolve) => {
            document.body.appendChild(this._mask);
            document.body.appendChild(this._modal);
            // this._modal.addEventListener("animationend", () => {
            setTimeout(() => {
                this._isOpen = true;
                this._emit("afterOpen");
                resolve();
            }, animationDuration);
        });
    }

    protected _close(): Promise<boolean> {
        if (!this._isOpen) return Promise.resolve(false);
        this._emit("beforeClose");
        return new Promise((resolve) => {
            this._mask.classList.add("alerting-animation-close");
            this._modal.classList.add("alerting-animation-close");
            // this._modal.addEventListener("animationend", () => {
            setTimeout(() => {
                this._modal.remove();
                this._mask.remove();
                this._isOpen = false;
                this._emit("afterClose");
                resolve(true);
            }, animationDuration);
        });
    }

    /**
     * @description set the title of the modal, if not set, the title will be the hostname just like the native style
     */
    public setTitle(title: string): this {
        replaceContent(this._title, title, this._isRenderAsHTML);
        return this;
    }

    public settings(options: { maskClickable?: boolean; renderAsHTML?: boolean; title?: string }): this {
        if (typeof options !== "object") throw new TypeError("options must be an object");
        if (typeof options.renderAsHTML !== "undefined") this._isRenderAsHTML = Boolean(options.renderAsHTML);
        this._isMaskClickable = Boolean(options.maskClickable);
        if (options.title) this.setTitle(options.title);
        return this;
    }

    /**
     * @description force close and dispatch the event, the remaining await will receive default value instantly
     */
    public forceClose(): this {
        this._modal.remove();
        this._mask.remove();
        this._isOpen = false;
        this._emit("forceClose");
        return this;
    }
}

class Alert extends Modal {
    private _buttonConfirm = document.createElement("button");
    constructor(message: string = "") {
        super();
        replaceContent(this._content, message, this._isRenderAsHTML);
        this._buttonConfirm.innerHTML = this._display[this._display.language].confirm;
        this._buttonConfirm.className = "alerting-button-confirm";
        this._buttons.appendChild(this._buttonConfirm);
    }

    public setContent(message: string): Alert {
        replaceContent(this._content, message, this._isRenderAsHTML);
        return this;
    }

    public async wait(): Promise<void> {
        await this._open();
        this._buttonConfirm.focus();
        return await new Promise((resolve) => {
            if (this._isMaskClickable) {
                this._mask.addEventListener("click", async () => {
                    await this._close();
                    resolve();
                });
            }
            this._buttonConfirm.addEventListener("click", async () => {
                await this._close();
                resolve();
            });
            this.on("forceClose", () => {
                resolve();
            });
        });
    }
}

class Confirm extends Modal {
    private _buttonConfirm = document.createElement("button");
    private _buttonCancel = document.createElement("button");
    constructor(message: string = "") {
        super();
        replaceContent(this._content, message, this._isRenderAsHTML);
        this._buttonConfirm.innerHTML = this._display[this._display.language].confirm;
        this._buttonConfirm.className = "alerting-button-confirm";
        this._buttonCancel.innerHTML = this._display[this._display.language].cancel;
        this._buttonCancel.className = "alerting-button-cancel";
        this._buttons.appendChild(this._buttonConfirm);
        this._buttons.appendChild(this._buttonCancel);
    }

    public setContent(message: string): Confirm {
        replaceContent(this._content, message, this._isRenderAsHTML);
        return this;
    }

    public async wait(): Promise<boolean> {
        await this._open();
        this._buttonConfirm.focus();
        return await new Promise((resolve) => {
            if (this._isMaskClickable) {
                this._mask.addEventListener("click", async () => {
                    await this._close();
                    resolve(false);
                });
            }
            this._buttonConfirm.addEventListener("click", async () => {
                await this._close();
                resolve(true);
            });
            this._buttonCancel.addEventListener("click", async () => {
                await this._close();
                resolve(false);
            });
            this.on("forceClose", () => {
                resolve(false);
            });
        });
    }
}

class Prompt extends Modal {
    private _textNode = document.createTextNode("");
    private _input = document.createElement("input");
    private _buttonConfirm = document.createElement("button");
    private _buttonCancel = document.createElement("button");
    constructor(text: string = "", value?: string) {
        super();
        this._textNode.nodeValue = text;
        this._content.appendChild(this._textNode); // set text
        this._input.className = "alerting-input";
        this._input.value = value || "";
        this._content.appendChild(this._input); // set input
        this._buttonConfirm.innerHTML = this._display[this._display.language].confirm;
        this._buttonConfirm.className = "alerting-button-confirm";
        this._buttonCancel.innerHTML = this._display[this._display.language].cancel;
        this._buttonCancel.className = "alerting-button-cancel";
        this._buttons.appendChild(this._buttonConfirm);
        this._buttons.appendChild(this._buttonCancel);
    }

    public setContent(text: string, value?: string): Prompt {
        this._textNode.nodeValue = text;
        this._input.value = value || "";
        return this;
    }

    public async wait(): Promise<string | null> {
        await this._open();
        // after the button is available, the input can be focused
        this._input.focus();
        this._input.select();
        this._input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this._buttonConfirm.click();
            }
        });
        return await new Promise<string | null>((resolve) => {
            if (this._isMaskClickable) {
                this._mask.addEventListener("click", async () => {
                    await this._close();
                    resolve(null);
                });
            }
            this._buttonConfirm.addEventListener("click", async () => {
                await this._close();
                resolve(this._input.value);
            });
            this._buttonCancel.addEventListener("click", async () => {
                await this._close();
                resolve(null);
            });
            this.on("forceClose", () => {
                resolve(null);
            });
        });
    }
}

const alert = (msg: string) => new Alert(msg).wait();
const confirm = (msg: string) => new Confirm(msg).wait();
const prompt = (text: string, value?: string) => new Prompt(text, value).wait();

export { Alert, Confirm, Prompt };
export { alert, confirm, prompt };
