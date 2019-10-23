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
const scpath = "screenshots";

module.exports = get = async () => {
  const resources = await fetchYaml(resources_files);
  resources.forEach(r => (r.slug = r.slug || slugify(r.title)));
  resources.forEach(r => (r.screenshot = path.join(scpath, `${r.slug}.png`)));

  const urls = resources.map(({ url }) => url);
  const dests = resources.map(r => path.join("static/", r.screenshot));

  await screenshot(urls, dests, 4);
  return resources;
};
