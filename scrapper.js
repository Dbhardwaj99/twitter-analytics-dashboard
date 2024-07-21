const puppeteer = require("puppeteer");

async function scrapeData() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 720 });

  await page.goto("https://x.com/i/flow/login", { waitUntil: "networkidle2" });

  console.log("Please log in manually in the opened browser window.");

  await page.waitForSelector(
    ".r-1ny4l3l .css-175oi2r .css-175oi2r .r-adyw6z span",
    { timeout: 0 }
  );
  console.log("Login successful, proceeding with scraping...");

  await page.goto("https://x.com/i/professionals", { waitUntil: "networkidle2" });

  const selectors = {
    impressions: "[aria-label='Impressions'] .r-1yjpyg1 span",
    engagementRate: "[aria-label='EngagementRate'] .r-1yjpyg1 span",
    profileVisits: "[aria-label='ProfileVisits'] .r-1yjpyg1 span",
    linkClicks: "[aria-label='LinkClicks'] .r-1yjpyg1 span",
  };

  const data = await page.evaluate((selectors) => {
    const getText = (selector) => {
      const element = document.querySelector(selector);
      return element ? element.innerText : null;
    };

    return {
      impressions: getText(selectors.impressions),
      engagementRate: getText(selectors.engagementRate),
      profileVisits: getText(selectors.profileVisits),
      linkClicks: getText(selectors.linkClicks),
    };
  }, selectors);

  await browser.close();
  return data;
}

module.exports = scrapeData;
