class Model {
    // the Model has: title, content, buttons
    protected _isMaskClickable = true;
    protected _mask = document.createElement("div");
    protected _model = document.createElement("div");
    protected _title = document.createElement("div");
    protected _content = document.createElement("div");
    protected _buttons = document.createElement("div");
    protected _display: any = {
        language: navigator.language.startsWith("zh") ? "zh" : "en",
        en: {
            says: "says",
            confirm: "OK",
            cancel: "cancel",
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
    public makeMaskUnclickable() {
        this._isMaskClickable = false;
        return this;
    }
    public setTitle(title: string) {
        this._title.innerHTML = title;
    }
    // as the Model is the Principal, only Model is listening to the event
    protected open(): Promise<void> {
        document.body.appendChild(this._mask);
        document.body.appendChild(this._model);
        return new Promise<void>((resolve) => {
            this._model.addEventListener("animationend", () => {
                resolve();
            });
        });
    }
    protected close(): Promise<void> {
        this._mask.classList.add("alerting-animation-close");
        this._model.classList.add("alerting-animation-close");
        return new Promise<void>((resolve) => {
            this._model.addEventListener("animationend", () => {
                this._model.remove();
                this._mask.remove();
                resolve();
            });
        });
    }
    // public wait(): Promise<any>;
}

class Alert extends Model {
    constructor(message: string = "") {
        super();
        this._content.innerHTML = message;
    }
    public config(message: string = ""): Alert {
        this._content.innerHTML = message;
        return this;
    }
    public async wait(): Promise<void> {
        this.open();
        const buttonConfirm = document.createElement("button");
        buttonConfirm.innerHTML = this._display[this._display.language].confirm;
        buttonConfirm.className = "alerting-button-confirm";
        this._buttons.appendChild(buttonConfirm);
        return await new Promise((resolve) => {
            if (this._isMaskClickable) {
                this._mask.addEventListener("click", async () => {
                    await this.close();
                    resolve();
                });
            }
            buttonConfirm.addEventListener("click", async () => {
                await this.close();
                resolve();
            });
        });
    }
}

class Confirm extends Model {
    constructor(message: string = "") {
        super();
        this._content.innerHTML = message;
    }
    public config(message: string = ""): Confirm {
        this._content.innerHTML = message;
        return this;
    }
    public async wait(): Promise<boolean> {
        this.open();
        const buttonConfirm = document.createElement("button");
        buttonConfirm.innerHTML = this._display[this._display.language].confirm;
        buttonConfirm.className = "alerting-button-confirm";
        const buttonCancel = document.createElement("button");
        buttonCancel.innerHTML = this._display[this._display.language].cancel;
        buttonCancel.className = "alerting-button-cancel";
        this._buttons.appendChild(buttonConfirm);
        this._buttons.appendChild(buttonCancel);
        return await new Promise((resolve) => {
            if (this._isMaskClickable) {
                this._mask.addEventListener("click", async () => {
                    await this.close();
                    resolve(false);
                });
            }
            buttonConfirm.addEventListener("click", async () => {
                await this.close();
                resolve(true);
            });
            buttonCancel.addEventListener("click", async () => {
                await this.close();
                resolve(false);
            });
        });
    }
}

class Prompt extends Model {
    protected input = document.createElement("input");
    constructor(text: string = "", value?: string) {
        super();
        this._content.innerHTML = text;
        this.input.className = "alerting-input";
        this.input.value = value || "";
        this._content.appendChild(this.input);
    }
    public config(text: string = "", value?: string): Prompt {
        this._content.innerHTML = text;
        this.input.value = value || "";
        return this;
    }
    public async wait(): Promise<string | null> {
        this.open();
        const buttonConfirm = document.createElement("button");
        buttonConfirm.innerHTML = this._display[this._display.language].confirm;
        buttonConfirm.className = "alerting-button-confirm";
        const buttonCancel = document.createElement("button");
        buttonCancel.innerHTML = this._display[this._display.language].cancel;
        buttonCancel.className = "alerting-button-cancel";
        this._buttons.appendChild(buttonConfirm);
        this._buttons.appendChild(buttonCancel);
        // after the button is available, the input can be focused
        this.input.focus();
        this.input.select();
        this.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                buttonConfirm.click();
            }
        });
        return await new Promise<string | null>((resolve) => {
            if (this._isMaskClickable) {
                this._mask.addEventListener("click", async () => {
                    await this.close();
                    resolve(null);
                });
            }
            buttonConfirm.addEventListener("click", async () => {
                await this.close();
                resolve(this.input.value);
            });
            buttonCancel.addEventListener("click", async () => {
                await this.close();
                resolve(null);
            });
        });
    }
}

export { Alert, Prompt, Confirm };
