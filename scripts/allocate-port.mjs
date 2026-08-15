import { createServer } from 'node:net';

const server = createServer();
server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  if (!address || typeof address === 'string') {
    process.exitCode = 1;
    server.close();
    return;
  }
  process.stdout.write(String(address.port));
  server.close();
});
