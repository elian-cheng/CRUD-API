import { IUser } from 'types/types';
import { User } from 'models/User';
import { readDB, updateDB } from './dbHelpers';

export class DB {
  async getUsers() {
    return await readDB();
  }

  async getUser(id: string) {
    const users = await readDB();
    return users.find((user) => user.id === id);
  }

  async createUser(data: Omit<IUser, 'id'>) {
    const createdUser = new User(data);
    const users = await readDB();

    users.push(createdUser);
    await updateDB(users);

    return createdUser;
  }

  async updateUser(id: string, data: Partial<Omit<IUser, 'id'>>) {
    const users = await readDB();
    const currentUserIndex = users.findIndex((user) => user.id === id);

    if (currentUserIndex !== -1) {
      users[currentUserIndex] = { ...users[currentUserIndex], ...data };
      await updateDB(users);
      return users[currentUserIndex];
    } else {
      return null;
    }
  }

  async deleteUser(id: string) {
    const users = await readDB();
    const deletedUser = users.find((user) => user.id === id);
    const updatedUsersList = users.filter((user) => user.id !== id);
    await updateDB(updatedUsersList);
    return deletedUser;
  }
}

const db = new DB();

export default db;
