const animationDuration = 200;
class AlertingEvent {
    _eventTarget = new EventTarget();
    constructor() {}

    on(eventName: string, listener: EventListenerOrEventListenerObject): void {
        this._eventTarget.addEventListener(eventName, listener);
    }
    off(eventName: string, listener: EventListenerOrEventListenerObject): void {
        this._eventTarget.removeEventListener(eventName, listener);
    }
    emit(eventName: string, data?: any): boolean {
        return this._eventTarget.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }
}

class Model {
    // the Model has: title, content, buttons
    protected _isOpen = false;
    protected _isMaskClickable = true;
    protected _mask = document.createElement("div");
    protected _model = document.createElement("div");
    protected _title = document.createElement("div");
    protected _content = document.createElement("div");
    protected _buttons = document.createElement("div");
    protected _events = new AlertingEvent();
    public on = this._events.on.bind(this._events);
    public off = this._events.off.bind(this._events);
    protected emit = this._events.emit.bind(this._events);
    protected _display: any = {
        language: navigator.language.startsWith("zh") ? "zh" : "en",
        en: {
            says: "says",
            confirm: "OK",
            cancel: "Cancel",
        },
        zh: {
            says: "显示",
            confirm: "确认",
            cancel: "取消",
        },
    };
    constructor() {
        this._mask.className = "alerting-mask";
        this._model.className = "alerting-model";
        this._title.className = "alerting-title";
        this._content.className = "alerting-content";
        this._buttons.className = "alerting-buttons";
        this._title.innerHTML = location.host + " " + this._display[this._display.language].says;
        this._model.appendChild(this._title);
        this._model.appendChild(this._content);
        this._model.appendChild(this._buttons);
    }
    // public on(eventName: string, listener: EventListenerOrEventListenerObject): void {
    //     this._events.on(eventName, listener);
    // }
    // public off(eventName: string, listener: EventListenerOrEventListenerObject): void {
    //     this._events.off(eventName, listener);
    // }
    // public emit(eventName: string, data?: any): boolean {
    //     return this._events.emit(eventName, { detail: data });
    // }
    public makeMaskUnclickable() {
        this._isMaskClickable = false;
        return this;
    }
    public setTitle(title: string) {
        this._title.innerHTML = title;
    }
    // as the Model is the Principal, only Model is listening to the event
    protected open(): Promise<boolean> {
        // TODO: rewrite with display:none may be better
        if (this._isOpen) return Promise.resolve(false);
        this.emit("beforeOpen");
        this._mask.classList.remove("alerting-animation-close");
        this._model.classList.remove("alerting-animation-close");
        return new Promise((resolve) => {
            document.body.appendChild(this._mask);
            document.body.appendChild(this._model);
            // this._model.addEventListener("animationend", () => {
            setTimeout(() => {
                this._isOpen = true;
                this.emit("afterOpen");
                resolve(true);
            }, animationDuration);
        });
    }
    protected close(): Promise<boolean> {
        if (!this._isOpen) return Promise.resolve(false);
        this.emit("beforeClose");
        return new Promise((resolve) => {
            this._mask.classList.add("alerting-animation-close");
            this._model.classList.add("alerting-animation-close");
            // this._model.addEventListener("animationend", () => {
            setTimeout(() => {
                // window.document.body.removeChild(this._model);
                // window.document.body.removeChild(this._mask);
                this._model.remove();
                this._mask.remove();
                this._isOpen = false;
                this.emit("afterClose");
                resolve(true);
            }, animationDuration);
        });
    }
    /**
     * @description force close and dispatch the event, the remaining await will receive default value instantly
     */
    public forceClose(): void {
        this._model.remove();
        this._mask.remove();
        this._isOpen = false;
        this.emit("forceClose");
    }
}

class Alert extends Model {
    private _buttonConfirm = document.createElement("button");
    constructor(message: string = "") {
        super();
        this._content.innerHTML = message;
        this._buttonConfirm.innerHTML = this._display[this._display.language].confirm;
        this._buttonConfirm.className = "alerting-button-confirm";
        this._buttons.appendChild(this._buttonConfirm);
    }
    public config(message: string = ""): Alert {
        this._content.innerHTML = message;
        return this;
    }

    public async wait(): Promise<void> {
        await this.open();
        return await new Promise((resolve) => {
            if (this._isMaskClickable) {
                this._mask.addEventListener("click", async () => {
                    await this.close();
                    resolve();
                });
            }
            this._buttonConfirm.addEventListener("click", async () => {
                await this.close();
                resolve();
            });
            this.on("forceClose", () => {
                resolve();
            });
        });
    }
}

class Confirm extends Model {
    private _buttonConfirm = document.createElement("button");
    private _buttonCancel = document.createElement("button");
    constructor(message: string = "") {
        super();
        this._content.innerHTML = message;
        this._buttonConfirm.innerHTML = this._display[this._display.language].confirm;
        this._buttonConfirm.className = "alerting-button-confirm";
        this._buttonCancel.innerHTML = this._display[this._display.language].cancel;
        this._buttonCancel.className = "alerting-button-cancel";
        this._buttons.appendChild(this._buttonConfirm);
        this._buttons.appendChild(this._buttonCancel);
    }
    public config(message: string = ""): Confirm {
        this._content.innerHTML = message;
        return this;
    }
    public async wait(): Promise<boolean> {
        await this.open();
        return await new Promise((resolve) => {
            if (this._isMaskClickable) {
                this._mask.addEventListener("click", async () => {
                    await this.close();
                    resolve(false);
                });
            }
            this._buttonConfirm.addEventListener("click", async () => {
                await this.close();
                resolve(true);
            });
            this._buttonCancel.addEventListener("click", async () => {
                await this.close();
                resolve(false);
            });
            this.on("forceClose", () => {
                resolve(false);
            });
        });
    }
}

class Prompt extends Model {
    private _textNode = document.createTextNode("");
    private _input = document.createElement("input");
    private _buttonConfirm = document.createElement("button");
    private _buttonCancel = document.createElement("button");
    constructor(text: string = "", value?: string) {
        super();
        this._textNode.nodeValue = text;
        this._content.appendChild(this._textNode);
        this._input.className = "alerting-input";
        this._input.value = value || "";
        this._content.appendChild(this._input);
        this._buttonConfirm.innerHTML = this._display[this._display.language].confirm;
        this._buttonConfirm.className = "alerting-button-confirm";
        this._buttonCancel.innerHTML = this._display[this._display.language].cancel;
        this._buttonCancel.className = "alerting-button-cancel";
        this._buttons.appendChild(this._buttonConfirm);
        this._buttons.appendChild(this._buttonCancel);
    }
    public config(text: string = "", value?: string): Prompt {
        this._textNode.nodeValue = text;
        this._input.value = value || "";
        return this;
    }
    public async wait(): Promise<string | null> {
        await this.open();
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
                    await this.close();
                    resolve(null);
                });
            }
            this._buttonConfirm.addEventListener("click", async () => {
                await this.close();
                resolve(this._input.value);
            });
            this._buttonCancel.addEventListener("click", async () => {
                await this.close();
                resolve(null);
            });
            this.on("forceClose", () => {
                resolve(null);
            });
        });
    }
}

export { Alert, Prompt, Confirm };
