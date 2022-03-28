abstract class Module {
    protected mask = document.createElement("div");
    constructor() {
        this.mask.className = "alerting-mask";
    }
    public abstract open(): void;
    public abstract close(): void;
    public abstract wait(): Promise<any>;
}

class Alert extends Module {
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
class Prompt extends Module {
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
class Confirm extends Module {
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
