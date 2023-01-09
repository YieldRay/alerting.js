import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

import pkg from "./package.json" assert { type: "json" };
export default {
    input: "./src/alerting.ts",
    output: [
        // {
        //     file: pkg.module,
        //     format: "es",
        //     plugins: [terser({ ecma: 2015 })],
        // },
        {
            file: pkg.umd,
            format: "umd",
            name: "alerting",
            plugins: [terser({ ecma: 5 })],
        },
    ],
    plugins: [
        resolve(),
        commonjs({ browser: true }),
        typescript(),
        babel({
            babelHelpers: "runtime",
            include: ["src/**/*"],
            exclude: ["node_modules/**/*"],
            extensions: [".js", ".ts"],
            configFile: "./.babelrc",
        }),
    ],
};
