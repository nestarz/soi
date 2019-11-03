const fs = require("fs-extra");
const path = require("path");
const glob = require("globby");
const jsYaml = require("js-yaml");
const screenshot = require("./screenshot");

const readYaml = file => jsYaml.load(fs.readFileSync(file, "utf8"));
const fetchYaml = async path => (await glob(path)).map(readYaml);
const slugify = text =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

const resources_files = "content/resources/**/*.yml";

module.exports = get = async () => {
  let resources = (await fetchYaml(resources_files)).map(resource => ({
    ...resource,
    slug: resource.slug || slugify(resource.title)
  }));
  const urls_path = resources.map(({ url, slug }) => ({
    url,
    w800: path.join("static", "screenshots", `${slug}.800.png`), // add process.cwd() for g-image
    w400: path.join("static", "screenshots", `${slug}.400.png`),
    w200: path.join("static", "screenshots", `${slug}.200.png`)
  }));
  const success = await screenshot(urls_path, 4);
  resources = resources.map(resource => {
    const screenshot = success.find(({ url }) => resource.url === url);
    return {
      ...resource,
      screenshot: {
        w800: screenshot ? screenshot.w800.replace('static', ''): null,
        w400: screenshot ? screenshot.w400.replace('static', '') : null,
        w200: screenshot ? screenshot.w200.replace('static', '') : null,
      }
    };
  });

  return resources;
};
