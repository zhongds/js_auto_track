import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import { uglify } from "rollup-plugin-uglify";
import replace from 'rollup-plugin-replace';
import {string} from 'rollup-plugin-string';
let pkg = require('./package.json');

export default {
  input: "src/index.ts",
  output: {
    file: "dist/auto_track.js",
    format: "umd",
    name: "AutoTrackObj"
  },
  plugins: [
    replace({
      VERSION: pkg.version,
      delimiters: ['{{', '}}']
    }),
    string({
      // 匹配需要转换的文件类型
      include: ['**/worker.js'],
    }),
    typescript(),
    commonjs({ extensions: [".js", ".ts"] }),
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    babel({
      exclude: "node_modules/**"
    }),
    process.env.BUILD === 'production' ? uglify() : null
  ]
};
