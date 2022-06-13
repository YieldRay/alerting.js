# alerting.js

implement alert, confirm, prompt with Promise  
[![](https://img.shields.io/npm/v/alerting.js)](https://www.npmjs.com/package/alerting.js)
[![](https://badgen.net/packagephobia/install/alerting.js)](https://packagephobia.com/result?p=alerting.js)

## Usage

while this library is v0.x.x, you should at least specify v0.[number].x to avoid changes in API

## browser (umd)

import both css and js to use, if you don't like the default css, you can override it by yourself

DO NOT ACCESS METHODS AND PROPERTIES WHOSE NAME STARTS WITH '\_' IN ALERTING.JS

```html
<!-- support IE11 only if you have Promise in global -->
<script src="https://unpkg.com/promise-polyfill@8/dist/polyfill.min.js"></script>
<!-- or -->
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
<!-- remove above script if you do not need to support IE -->
<link rel="stylesheet" href="https://unpkg.com/alerting.js/dist/alerting.css" />
<script src="https://unpkg.com/alerting.js/dist/alerting.umd.js"></script>
<script>
    // use Promise with .then()
    alerting.confirm("Are you sure?").then(function (bool) {
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

## browser (module)

import with es6 module (for chrome>=61), keep in mind that **you also need to import css**

```js
// each call will create an object, and each of them has a standalone DOM
// every call will show a standalone model
import { alert as $alert, prompt as $prompt, confirm as $confirm } from "./dist/alerting.module.js";
$alert();
$prompt().then(console.log);
$confirm().then(console.log);

// only create single object, and each of them shares the same DOM
// if called twice time, the former one will be forced close
import { Alert, Prompt, Confirm } from "./dist/alerting.module.js";
const alert = new Alert();
const confirm = new Confirm();
const prompt = new Prompt();
window.$$alert = (msg) => alert.setContent(msg).wait();
window.$$confirm = (msg) => confirm.setContent(msg).wait();
window.$$prompt = (text, value) => prompt.setContent(text, value).wait();
```

## node.js

```sh
$ npm install alerting.js
```

## addtional

public functions

```js
new Alert("<h3>Hello</h3>").settings({ maskClickable: false, renderAsHTML: true }).wait();
// alert "Hello", but the mask is unable to click, while the title and content will be rendered as HTML
// renderAsHTML only works before setContent() is called
// while renderAsHTML is default to false, the text passed in the constructor will be rendered as textNode
// so normally if you want to render some HTML, you should call:
new Alert().settings({ renderAsHTML: true }).setContent(html);

const myModel = new Confirm("Quit?");
myModel.setTitle("This is a Confirm Model").wait().then(alert); // use setTitle() to overwrite default title
myModel.setContent("Do you want to quit?"); // use setContent() to reset the message, return this
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
as we illustrated Alert for example, it also works in Prompt and Confirm

# build

```bash
$ npm install
$ npm run build
```

# dev

```bash
$ npm run dev:js
$ npm run dev:css
```
