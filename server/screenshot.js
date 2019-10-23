const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const { dirname } = require("path");

const chunks = (array, parts) => {
  let result = [];
  for (let i = parts; i > 0; i--) {
    result.push(array.slice(0, Math.ceil(array.length / i)));
  }
  return result;
};

const screenshot = async (urls, paths, instances = 2) => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: true,
    args: ["--enable-features=NetworkService"]
  });

  const zip = urls.map((url, i) => ({ url, path: paths[i] }));
  const runs = chunks(zip, instances).map(async chunk => {
    const page = await browser.newPage();
    for (const { url, path } of chunk) {
      if (!url) {
        console.log("Url null. ", url, path);
        continue;
      }

      if (fs.existsSync(path)) {
        console.log("File exists. Aborting.", path);
        continue;
      }
      
      fs.mkdir(dirname(path), { recursive: true }, err => {
        err && console.log("Error", err);
      });

      try {
        const gotoconf = { waitUntil: "networkidle0", timeout: 30000 };
        await page.goto(url, gotoconf);
        await page.screenshot({ path });
      } catch (error) {
        console.log("Error.", error.toString().slice(180), url);
      }
    }
  });

  await Promise.all(runs);
  await browser.close();
  return true;
};

module.exports = screenshot;
