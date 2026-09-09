import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const cssFiles = ["base.css", "layout.css", "content.css", "funding.css"];
const cssHash = createHash("md5");
for (const file of cssFiles) {
  cssHash.update(readFileSync(`src/assets/${file}`));
}

export default function (eleventyConfig) {
  eleventyConfig.addGlobalData("cssFiles", cssFiles);
  eleventyConfig.addGlobalData("cssHash", cssHash.digest("hex").slice(0, 8));
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/_headers");
  eleventyConfig.addFilter("date", (value) => value ? String(value).slice(0, 10) : "—");
  eleventyConfig.addFilter("money", (value, currency = "") => value == null ? "—" : `${new Intl.NumberFormat("en-US").format(value)} ${currency}`.trim());
  eleventyConfig.addFilter("slugLabel", (value = "") => value.replaceAll("-", " "));

  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
