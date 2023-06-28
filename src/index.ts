import http, { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import DB from './libs/db';
import App from './app';
import { configDB } from './libs/dbHelpers';
import { PORT } from './utils/constants';

dotenv.config();

const server = http.createServer();

const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
  const db = new DB();
  const app = new App(db);
  await app.requestHandler(req, res);
};

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Server is listening on the port ${PORT}`);
  });
  server.on('request', requestHandler);
};

try {
  configDB.start();
  startServer();
  process.on('SIGINT', async () => {
    configDB.end();
    process.exit();
  });
} catch (error: unknown) {
  const err = error as Error;
  process.stderr.write(`App error - ${err.message}`);
  configDB.end();
  process.exit(1);
}
