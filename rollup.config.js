import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default {
    input: "./src/alerting.ts",
    output: [
        {
            file: pkg.module,
            format: "es",
            external: [/@babel\/runtime/],
            plugins: [terser({ ecma: 2015 })],
        },
        {
            file: pkg.umd,
            format: "umd",
            name: "alerting",
            external: [/@babel\/runtime/],
            plugins: [terser({ ecma: 5 })],
        },
    ],
    plugins: [resolve(), commonjs(), typescript()],
};
