// LAN host (also runs inside the Windows app). Players open http://HOST_IP:3000 or enter the IP in the app.
const http = require('http'), fs = require('fs'), os = require('os');
const clients = new Set(), pk = {}; let n = 0;
const root = fs.existsSync(__dirname + '/www') ? __dirname + '/www/' : __dirname + '/';
const ips = () => Object.values(os.networkInterfaces()).flat().filter(l => l.family === 'IPv4' && !l.internal).map(l => l.address + ':3000');
const send = o => { for (const c of clients) c.write('data: ' + JSON.stringify(o) + '\n\n'); };
setInterval(() => {
  if (!clients.size) return;
  const i = Math.random() * 6 | 0; if (pk[i]) return;
  pk[i] = 'hsrb'[Math.random() * 4 | 0]; send({ t: 'U', i, k: pk[i] });
}, 6000);
const types = { html: 'text/html', js: 'text/javascript', json: 'application/json', png: 'image/png' };
const cors = { 'Access-Control-Allow-Origin': '*' };
http.createServer((q, s) => {
  if (q.url === '/events') {
    s.writeHead(200, { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    s.write('data: {"t":"T","team":' + (n++ % 2) + '}\n\n');
    for (const i in pk) s.write('data: ' + JSON.stringify({ t: 'U', i, k: pk[i] }) + '\n\n');
    clients.add(s); q.on('close', () => clients.delete(s));
  } else if (q.url === '/s' && q.method === 'POST') {
    let b = ''; q.on('data', d => (b += d));
    q.on('end', () => { try { const o = JSON.parse(b); if (o.t === 'X') delete pk[o.i]; send(o); } catch (e) {} s.writeHead(200, cors); s.end(); });
  } else if (q.url === '/ip') {
    s.writeHead(200, { ...cors, 'Content-Type': 'text/plain' }); s.end(ips().join('   '));
  } else {
    const f = q.url.split('?')[0].slice(1) || 'index.html';
    if (!/^[\w.-]+$/.test(f)) { s.writeHead(404); return s.end(); }
    fs.readFile(root + f, (e, d) => { s.writeHead(e ? 404 : 200, { 'Content-Type': types[f.split('.').pop()] || 'text/plain' }); s.end(d); });
  }
}).on('error', () => {}).listen(3000, '0.0.0.0', () => console.log('Players open: http://' + (ips()[0] || 'localhost:3000')));
