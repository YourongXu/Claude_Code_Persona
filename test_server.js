const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<h1>Test Server Working!</h1><p>This is a simple test to verify server connectivity.</p>');
});

server.listen(3001, '127.0.0.1', () => {
    console.log('Test server running on http://127.0.0.1:3001');
});