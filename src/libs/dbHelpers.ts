import { join, dirname } from 'path';
import fsp from 'fs/promises';
import fs from 'fs';
import { IUser } from '../types/types';

export const getDB = () => {
  return join(dirname(__dirname), 'libs', 'db.json');
};

export const readDB = async () => {
  const dbPath = getDB();
  const data = await fsp.readFile(dbPath, 'utf-8');
  return JSON.parse(data) as IUser[];
};

export const updateDB = async (data: IUser[]) => {
  const dbPath = getDB();
  await fsp.writeFile(dbPath, JSON.stringify(data));
};

export const configDB = {
  dbPath: getDB(),
  start() {
    fs.writeFile(this.dbPath, '[]', (err) => {
      if (err) throw err;
    });
  },
  end() {
    fs.unlink(this.dbPath, (err) => {
      if (err) throw err;
    });
  },
};
