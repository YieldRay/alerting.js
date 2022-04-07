declare class AlertingEvent {
    protected _eventTarget: EventTarget;
    constructor();
    on(eventName: string, listener: EventListenerOrEventListenerObject): void;
    off(eventName: string, listener: EventListenerOrEventListenerObject): void;
    emit(eventName: string, data?: any): boolean;
}
declare class Modal {
    protected _isOpen: boolean;
    protected _isMaskClickable: boolean;
    protected _mask: HTMLDivElement;
    protected _modal: HTMLDivElement;
    protected _title: HTMLDivElement;
    protected _content: HTMLDivElement;
    protected _buttons: HTMLDivElement;
    protected _events: AlertingEvent;
    on: (eventName: string, listener: EventListenerOrEventListenerObject) => void;
    off: (eventName: string, listener: EventListenerOrEventListenerObject) => void;
    protected _emit: (eventName: string, data?: any) => boolean;
    protected _display: any;
    constructor();
    protected _open(): Promise<void>;
    protected _close(): Promise<boolean>;
    makeMaskUnclickable(): this;
    setTitle(title: string): this;
    forceClose(): this;
}
declare class Alert extends Modal {
    private _buttonConfirm;
    constructor(message?: string);
    config(message?: string): Alert;
    wait(): Promise<void>;
}
declare class Confirm extends Modal {
    private _buttonConfirm;
    private _buttonCancel;
    constructor(message?: string);
    config(message?: string): Confirm;
    wait(): Promise<boolean>;
}
declare class Prompt extends Modal {
    private _textNode;
    private _input;
    private _buttonConfirm;
    private _buttonCancel;
    constructor(text?: string, value?: string);
    config(text?: string, value?: string): Prompt;
    wait(): Promise<string | null>;
}
declare const alert: (msg: string) => Promise<void>;
declare const confirm: (msg: string) => Promise<boolean>;
declare const prompt: (text: string, value?: string | undefined) => Promise<string | null>;
export { Alert, Confirm, Prompt };
export { alert, confirm, prompt };
