# alerting.js

implement alert, confirm, prompt with Promise  
[![](https://img.shields.io/npm/v/alerting.js)](https://www.npmjs.com/package/alerting.js)
[![](https://badgen.net/packagephobia/install/alerting.js)](https://packagephobia.com/result?p=alerting.js)

## Usage

import both css and js to use, if you don't like the default css, you can override it by yourself

DO NOT ACCESS METHODS AND PROPERTIES WHOSE NAME STARTS WITH '\_' IN ALERTING.JS

```html
<link rel="stylesheet" href="https://unpkg.com/alerting.js/dist/alerting.min.css" />
<script src="https://unpkg.com/alerting.js/dist/alerting.umd.min.js"></script>
<script>
    // use Promise with .then()
    alerting.confirm("Are you sure?").then((bool) => {
        if (bool) alerting.alert("OK, I will do that");
        else alerting.alert("Will, canceled");
    });
    (async () => {
        // use async/await
        let resp = await alerting.prompt("How are you?");
        if (resp == null) alerting.alert("You didn't answer");
        else alerting.alert("You answered" + resp);
    })();
</script>
```

import with es6 module, keep in mind that you also need css imported

```js
// each call will create an object, and each of them has a standalone DOM
// every call will show a standalone model
import { alert as $alert, prompt as $prompt, confirm as $confirm } from "./dist/alerting.min.js";
$alert();
$prompt().then(console.log);
$confirm().then(console.log);

// only create single object, and each of them shares the same DOM
// if called twice time, the former one will be forced close
import { Alert, Prompt, Confirm } from "./dist/alerting.min.js";
const alert = new Alert();
const confirm = new Confirm();
const prompt = new Prompt();
window.$$alert = (msg) => alert.config(msg).wait();
window.$$confirm = (msg) => confirm.config(msg).wait();
window.$$prompt = (text, value) => prompt.config(text, value).wait();
```

public functions

```js
new Alert("Hello").makeMaskUnclickable().wait(); // alert "Hello", but the mask is unable to click

const myModel = new Confirm("Quit?");
myModel.config("Do you want to quit?"); // use config() to reset the message, return this
myModel.setTitle("This is a Confirm Model").wait().then(alert); // use setTitle() to overwrite default title
myModel.forceClose(); // force close, and the previous wait will receive default value instantly
let response = await myModel.wait(); // display the model and waiting for response
```

lifecycle hook

```js
// add listener
myModel.on("beforeOpen", () => console.log("beforeOpen"));
myModel.on("afterOpen", () => console.log("afterOpen"));
myModel.on("beforeClose", () => console.log("beforeClose"));
myModel.on("afterClose", () => console.log("afterClose"));

// remove listener
myModel.off("beforeOpen", funcName);

// if a model is closed by forceClose(), then beforeClose and afterClose will not be dispatched
// but will dispatch forceClose event
myModel.on("forceClose", () => console.log("forceClose"));
```

all the three Classes have the same API

## build

```bash
$ npm install
$ npm run build
```

## dev

```bash
$ npm run dev:js
$ npm run dev:css
```
