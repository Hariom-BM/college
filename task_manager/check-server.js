// Quick check script to verify server status
const http = require('http');

const checkServer = () => {
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server is running! Status: ${res.statusCode}`);
    console.log(`✅ Access at: http://localhost:5173`);
  });

  req.on('error', (e) => {
    console.log(`❌ Server is NOT running. Error: ${e.message}`);
    console.log(`\n💡 Solution: Run 'npm run dev' in terminal`);
  });

  req.end();
};

console.log('Checking if Vite dev server is running...\n');
checkServer();
