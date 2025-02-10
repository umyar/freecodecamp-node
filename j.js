const dns = require('dns');

dns.lookup('google.com', (error, address, version) => {
  console.log({ error, address, version });
});
