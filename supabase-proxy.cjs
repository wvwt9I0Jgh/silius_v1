/**
 * Supabase API Proxy Server
 * Forwards all requests to the Supabase project URL, adding apikey header.
 * Used for TestSprite backend testing.
 * Running on port 4174 -> https://uxmdcaxeotyzhuhqnzpd.supabase.co
 */
const http = require('http');
const https = require('https');
const url = require('url');

const SUPABASE_URL = 'https://uxmdcaxeotyzhuhqnzpd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWRjYXhlb3R5emh1aHFuenBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTEzMTYsImV4cCI6MjA4MjIyNzMxNn0.vkxQal7hRGwafrtGBgCluiRiDejUcvQhyG8jjym97rc';
const PROXY_PORT = 4174;

const target = url.parse(SUPABASE_URL);

const server = http.createServer((req, res) => {
  const options = {
    hostname: target.hostname,
    port: 443,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: target.hostname,
      apikey: SUPABASE_ANON_KEY,
    }
  };

  // Remove transfer-encoding and content-length to avoid issues
  delete options.headers['transfer-encoding'];

  const proxyReq = https.request(options, (proxyRes) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, Prefer');

    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502);
    res.end('Proxy error: ' + err.message);
  });

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, Prefer',
    });
    res.end();
    return;
  }

  req.pipe(proxyReq, { end: true });
});

server.listen(PROXY_PORT, () => {
  console.log(`Supabase proxy running on http://localhost:${PROXY_PORT}`);
  console.log(`Forwarding to: ${SUPABASE_URL}`);
});
