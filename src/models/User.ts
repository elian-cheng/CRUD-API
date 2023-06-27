import { IUser } from 'types/types';
import { v4 } from 'uuid';

export class User implements IUser {
  public id: string;
  public username: string;
  public age: number;
  public hobbies: Array<string>;

  constructor(data: Omit<IUser, 'id'>) {
    this.id = v4();
    this.username = data.username;
    this.age = data.age;
    this.hobbies = data.hobbies;
  }
}
