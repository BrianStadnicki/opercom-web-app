import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import typescript from '@rollup/plugin-typescript';
import {sveltePreprocess} from "svelte-preprocess/dist/autoProcess.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        scss: { prependData: '@import "src/theme.scss";' }
      })
}),
  typescript({ sourceMap: false })
]})
