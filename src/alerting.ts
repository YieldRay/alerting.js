class Model {
    // the Model has: title, content, buttons
    protected isMaskClickable = true;
    protected mask = document.createElement("div");
    protected model = document.createElement("div");
    protected title = document.createElement("div");
    protected content = document.createElement("div");
    protected buttons = document.createElement("div");
    constructor() {
        this.mask.className = "alerting-mask";
        this.model.className = "alerting-model";
        this.title.className = "alerting-title";
        this.content.className = "alerting-content";
        this.buttons.className = "alerting-buttons";
        this.title.innerHTML = location.host + " " + "显示";
        this.model.appendChild(this.title);
        this.model.appendChild(this.content);
        this.model.appendChild(this.buttons);
    }
    public makeMaskUnclickable() {
        this.isMaskClickable = false;
        return this;
    }
    public setTitle(title: string) {
        this.title.innerHTML = title;
    }
    // as the Model is the Principal, only Model is listening to the event
    protected open(): Promise<void> {
        document.body.appendChild(this.mask);
        document.body.appendChild(this.model);
        return new Promise<void>((resolve) => {
            this.model.addEventListener("animationend", () => {
                resolve();
            });
        });
    }
    protected close(): Promise<void> {
        this.mask.classList.add("alerting-animation-close");
        this.model.classList.add("alerting-animation-close");
        return new Promise<void>((resolve) => {
            this.model.addEventListener("animationend", () => {
                this.model.remove();
                this.mask.remove();
                resolve();
            });
        });
    }
    // public wait(): Promise<any>;
}

class Alert extends Model {
    constructor(message: string = "") {
        super();
        this.content.innerHTML = message;
    }
    public async wait(): Promise<void> {
        this.open();
        const buttonConfirm = document.createElement("button");
        buttonConfirm.innerHTML = "确定";
        buttonConfirm.className = "alerting-button-confirm";
        this.buttons.appendChild(buttonConfirm);
        return await new Promise((resolve) => {
            if (this.isMaskClickable) {
                this.mask.addEventListener("click", async () => {
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
        this.content.innerHTML = message;
    }
    public async wait(): Promise<boolean> {
        this.open();
        const buttonConfirm = document.createElement("button");
        buttonConfirm.innerHTML = "确定";
        buttonConfirm.className = "alerting-button-confirm";
        const buttonCancel = document.createElement("button");
        buttonCancel.innerHTML = "取消";
        buttonCancel.className = "alerting-button-cancel";
        this.buttons.appendChild(buttonConfirm);
        this.buttons.appendChild(buttonCancel);
        return await new Promise((resolve) => {
            if (this.isMaskClickable) {
                this.mask.addEventListener("click", async () => {
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
        this.content.innerHTML = text;
        this.input.className = "alerting-input";
        this.input.value = value || "";
        this.content.appendChild(this.input);
    }
    public async wait(): Promise<string | null> {
        this.open();
        const buttonConfirm = document.createElement("button");
        buttonConfirm.innerHTML = "确定";
        buttonConfirm.className = "alerting-button-confirm";
        const buttonCancel = document.createElement("button");
        buttonCancel.innerHTML = "取消";
        buttonCancel.className = "alerting-button-cancel";
        this.buttons.appendChild(buttonConfirm);
        this.buttons.appendChild(buttonCancel);
        // after the button is available, the input can be focused
        this.input.focus();
        this.input.select();
        this.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                buttonConfirm.click();
            }
        });
        return await new Promise((resolve) => {
            if (this.isMaskClickable) {
                this.mask.addEventListener("click", async () => {
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
