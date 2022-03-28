abstract class Model {
    protected mask = document.createElement("div");
    protected model = document.createElement("div");
    constructor() {
        this.mask.className = "alerting-mask";
        this.model.className = "alerting-model";
    }
    public abstract open(): void;
    public abstract close(): void;
    public abstract wait(): Promise<any>;
}

class Alert extends Model {
    constructor(message: string) {
        super();
    }
    public open() {
        document.body.appendChild(this.mask);
    }
    public close() {
        document.body.removeChild(this.mask);
    }
    public async wait(): Promise<void> {}
}

class Prompt extends Model {
    constructor(text: string, value?: string) {
        super();
    }
    public open() {
        document.body.appendChild(this.mask);
    }
    public close() {
        document.body.removeChild(this.mask);
    }
    public async wait(): Promise<string> {
        return "";
    }
}

class Confirm extends Model {
    constructor(message: string) {
        super();
    }
    public open() {
        document.body.appendChild(this.mask);
    }
    public close() {
        document.body.removeChild(this.mask);
    }
    public async wait(): Promise<boolean> {
        return true;
    }
}
