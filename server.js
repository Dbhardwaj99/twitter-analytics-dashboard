const express = require('express');
const scrapeData = require('./scrapper');

const app = express();
const port = 3000;

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const data = await scrapeData();
    console.log(data);
    res.send(data);
  } catch (error) {
    console.error('Error scraping the page:', error);
    res.status(500).send('Error scraping the page');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});