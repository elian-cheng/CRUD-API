import * as dotenv from 'dotenv';
import startServer from './server';
dotenv.config();

try {
  startServer();
  process.on('SIGINT', async () => {
    process.exit();
  });
} catch (error: unknown) {
  const err = error as Error;
  process.stderr.write(`App error - ${err.message}`);
  process.exit(1);
}
