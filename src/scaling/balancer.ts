import http, { IncomingMessage, ServerResponse } from 'http';
import cluster, { Worker } from 'cluster';
import dotenv from 'dotenv';
import { cpus } from 'os';
import { pid } from 'process';
import { configDB } from '../libs/dbHelpers';
import { PORT } from '../utils/constants';
import DB from '../libs/db';
import App from '../app';
dotenv.config();

const server = http.createServer();
const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
  const db = new DB();
  const app = new App(db);
  await app.requestHandler(req, res);
};

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Worker is listening on the port ${PORT}`);
  });
  server.on('request', requestHandler);
};

try {
  configDB.start();
  if (cluster.isPrimary) {
    const parallelism = cpus().length - 1;
    console.log(`Master ${pid} is running`);
    startServer();

    for (let i = 1; i <= parallelism; i++) {
      cluster.fork({ PORT: Number(PORT) + i });
    }

    cluster.on('exit', (worker: Worker, _code: number, _signal: string) => {
      console.log(`Worker ${worker.process?.pid} died`);
    });
  } else {
    startServer();
  }

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
