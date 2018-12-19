const bodyParser = require('body-parser');
const express = require('express');
const request = require('request-promise-native');
const { JSDOM } = require('jsdom');

const DEFAULT_JSDOM_OPTIONS = {
  resources: 'usable',
  runScripts: 'dangerously',
};
const DEFAULT_REQUEST_OPTIONS = {
  rejectUnauthorized: false,
  resolveWithFullResponse: true,
  simple: false,
  time: true,
};
const DEFAULT_TIMEOUT = 5 * 1000;
const PORT = 8080;

const app = express();

app.post('/scrape', bodyParser.json(), async (req, res) => {
  const url = req.body.url;
  const timeout = parseInt(req.body.timeout) || DEFAULT_TIMEOUT;
  if (!url) {
    return res.sendStatus(422);
  }
  try {
    // scrape URL and keep track of details
    console.log(`Scraping ${url}`);
    const requestOpts = Object.assign({}, DEFAULT_REQUEST_OPTIONS, { timeout, url });
    const {
      request: { href: finalURL },
      body,
      statusCode,
      timings: { end: responseTime },
    } = await request(requestOpts);

    // process scripts for final html of scraped content
    const jsdomOpts = Object.assign({}, DEFAULT_JSDOM_OPTIONS, { url: finalURL });
    const dom = new JSDOM(body, jsdomOpts);
    const content = dom.serialize();
    dom.window.close();
    res.json({
      content,
      finalURL,
      statusCode,
      timing: Math.round(responseTime),
      url,
    });
  } catch (error) {
    console.log(`Error: ${error}`);
    res.status(500).json({ error });
  }
});

app.use('*', (req, res) => res.sendStatus(404));

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
