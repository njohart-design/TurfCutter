const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

function proxyCensus(reqUrl, res) {
  const u = new URL(reqUrl, 'http://localhost');
  const address = u.searchParams.get('address');
  if (!address) { res.writeHead(400); res.end('Missing address'); return; }

  const params = new URLSearchParams({
    address,
    benchmark: 'Public_AR_Current',
    format: 'json'
  });

  const target = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?' + params;

  https.get(target, { headers: { 'User-Agent': 'TurfCutter/1.0' } }, censusRes => {
    let body = '';
    censusRes.on('data', d => body += d);
    censusRes.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(body);
    });
  }).on('error', () => { res.writeHead(502); res.end('{}'); });
}

http.createServer((req, res) => {
  if (req.url.startsWith('/geocode')) {
    proxyCensus(req.url, res);
    return;
  }
  fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
    if (err) { res.writeHead(500); res.end('Error'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}).listen(PORT, () => console.log('TurfCutter running on port ' + PORT));
