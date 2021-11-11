require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
let currentIdCount = 0;
const shortenedUrls = [];
const httpsRegex = /^https?:\/\//;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {

  const { url } = req.body;

  if(!httpsRegex.test(url)) {
    res.json({ error: 'Invalid url' });
  } else {

    const domain = url.split(httpsRegex)[1].split('/')[0];
    
    dns.lookup(domain, (err) => {
  
      if(err) return res.json({ error: 'Invalid url' });
  
      const newUrlShortened = {
        original_url: url,
        short_url: ++currentIdCount    
      };
    
      shortenedUrls.push(newUrlShortened);
      res.json(newUrlShortened);
    });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {

  const { short_url } = req.params;

  if(short_url) {

    const foundUrlObj = shortenedUrls.find(item => item.short_url === parseInt(short_url));

    if(foundUrlObj) return res.redirect(foundUrlObj.original_url);

    res.status(404).json({ message: "No resource was found." });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
