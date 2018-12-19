const bodyParser = require('body-parser');
const express = require('express');
const { JSDOM } = require('jsdom');

const PORT = 8080;
const OPTIONS = {
  resources: 'usable',
  runScripts: 'dangerously',
};

const app = express();

app.post('/scrape', bodyParser.json(), async (req, res) => {
  const url = req.body.url;
  if (!url) {
    return res.sendStatus(422);
  }
  try {
    console.log(`Scraping ${url}`);
    const dom = await JSDOM.fromURL(url, OPTIONS);
    const content = dom.serialize();
    console.log(`Found content length: ${content.length}`);
    dom.window.close();
    res.send(content);
  } catch (err) {
    const errString = err.toString();
    console.log(errString);
    res.status(500).send(errString);
  }
});

app.use('*', (req, res) => res.sendStatus(404));

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
