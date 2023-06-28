import { IUser } from '../types/types';

export const validateUuid = (id: string) => {
  const regexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return regexExp.test(id);
};

export const validateUserData = (object: unknown): object is Omit<IUser, 'id'> => {
  if (typeof object === 'object' && object !== null) {
    const { age, username, hobbies } = object as Partial<IUser>;
    return (
      typeof age === 'number' &&
      age > 0 &&
      typeof username === 'string' &&
      username.trim() !== '' &&
      Array.isArray(hobbies)
    );
  }
  return false;
};
