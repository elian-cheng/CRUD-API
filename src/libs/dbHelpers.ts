import { join, dirname } from 'path';
import fsp from 'fs/promises';
import { IUser } from 'types/types';

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
