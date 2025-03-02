import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import playformCompress from "@playform/compress";
import terser from "@rollup/plugin-terser";
import swup from "@swup/astro";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  site: "https://www.saroprock.com",
  output: "server", // Changed from static to server
  adapter: vercel(), // Added Vercel adapter
  integrations: [mdx(), swup(), icon(), terser({
    compress: true,
    mangle: true,
  }), sitemap(), tailwind(), pagefind(), playformCompress()],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});