const puppeteer = require("puppeteer");
const fs = require('fs');
const path = require('path');

const SESSION_FILE_PATH = path.resolve(__dirname, 'session.json');

async function saveSessionData(page) {
  const cookies = await page.cookies();
  const localStorage = await page.evaluate(() => {
    const json = {};
    for (const key in localStorage) {
      json[key] = localStorage.getItem(key);
    }
    return json;
  });

  fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify({ cookies, localStorage }));
}

async function loadSessionData(page) {
  if (fs.existsSync(SESSION_FILE_PATH)) {
    const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, 'utf-8'));

    if (sessionData.cookies) {
      await page.setCookie(...sessionData.cookies);
    }

    if (sessionData.localStorage) {
      await page.evaluate((localStorageData) => {
        for (const key in localStorageData) {
          localStorage.setItem(key, localStorageData[key]);
        }
      }, sessionData.localStorage);
    }
  }
}

async function scrapeData() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 720 });

  await loadSessionData(page);

  await page.goto("https://x.com/i/flow/login", { waitUntil: "networkidle2" });

  const loginSuccess = await page.waitForSelector(".r-1ny4l3l .css-175oi2r .css-175oi2r .r-adyw6z span", { timeout: 0 })
    .then(() => true)
    .catch(() => false);

  if (!loginSuccess) {
    console.log('Please log in manually in the opened browser window.');
    await page.waitForSelector(".r-1ny4l3l .css-175oi2r .css-175oi2r .r-adyw6z span", { timeout: 0 });
    console.log('Login successful, proceeding with scraping...');
    await saveSessionData(page);
  }

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
