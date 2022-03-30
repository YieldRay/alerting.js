# alerting.js

implement alert, confirm, prompt with Promise

## dev

```bash
$ npm run dev:js
$ npm run dev:css
```

## build

```bash
$ npm run build
```

## Usage

```js
import { Alert, Prompt, Confirm } from "./dist/alerting.js";

// each call will create an object, and each of them has a standalone DOM
// every call will show a standalone model
window.myAlert = (msg) => new Alert(msg).wait();
window.myConfirm = (msg) => new Confirm(msg).wait();
window.myPrompt = (text, value) => new Prompt(text, value).wait();

// only create single object, and each of them shares the same DOM
// if called twice time, the former one will be forced close
const alert = new Alert();
const confirm = new Confirm();
const prompt = new Prompt();
window._alert = (msg) => alert.config(msg).wait();
window._confirm = (msg) => confirm.config(msg).wait();
window._prompt = (text, value) => prompt.config(text, value).wait();
```

public functions

```js
new Alert().makeMaskUnclickable().wait("Hello"); // alert "Hello", but the mask is unable to click

const myModel = new Confirm("Quit?");
myModel.config("Do you want to quit?"); // use config() to reset the message, return this
myModel.setTitle("This is a Confirm Model").wait().then(alert); // use setTitle() to overwrite default title
myModel.forceClose(); // force close, and the previous wait will receive default value instantly
```

lifecycle hook

```js
myModel.on("beforeOpen", () => console.log("before"));
myModel.on("afterOpen", () => console.log("after"));
myModel.on("beforeClose", () => console.log("before"));
myModel.on("afterClose", () => console.log("after"));
```

all the three Classes have the same API
