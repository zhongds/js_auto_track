import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import { uglify } from "rollup-plugin-uglify";
import replace from '@rollup/plugin-replace';
import pkg from './package.json' assert { type: 'json' };

export default {
  input: "src/index.ts",
  output: {
    file: "dist/auto_track.js",
    format: "umd",
    name: "autoTrackObj"
  },
  plugins: [
    replace({
      preventAssignment: true,
      VERSION: pkg.version,
      delimiters: ['{{', '}}']
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
