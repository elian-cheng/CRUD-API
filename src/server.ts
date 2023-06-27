import http, { IncomingMessage, ServerResponse } from 'http';
import DB from './libs/db';
import App from './app';

const PORT = process.env.PORT || 4000;

const server = http.createServer();

const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
  const db = new DB();
  const app = new App(db);
  await app.handleRequest(req, res);
};

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
  server.on('request', handleRequest);
};

export default startServer;
