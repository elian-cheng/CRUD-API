import * as dotenv from 'dotenv';
import { configDB } from './libs/dbHelpers';
import startServer from './server';
dotenv.config();

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
  process.exit(1);
}
