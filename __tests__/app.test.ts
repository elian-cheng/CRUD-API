import request from 'supertest';
import { createServer } from 'http';
import { v4 } from 'uuid';
import { IUser } from '../src/types/types';
import App from '../src/app';
import DB from '../src/libs/db';
import { configDB } from '../src/libs/dbHelpers';
import { BASE_URL, ErrorMessages } from '../src/utils/constants';

const db = new DB();
const app = new App(db);
const mockServer = createServer(async (req, res) => await app.requestHandler(req, res));
const mockApp = request(mockServer);

const testUser: Omit<IUser, 'id'> = {
  username: 'John',
  age: 32,
  hobbies: ['sports', 'music'],
};

const testUser2: Omit<IUser, 'id'> = {
  username: '',
  age: 32,
  hobbies: ['sports', 'music'],
};

const testUser3: Omit<IUser, 'id'> = {
  username: 'John',
  age: 0,
  hobbies: ['sports', 'music'],
};

let newUser: IUser;

beforeAll(() => {
  configDB.start();
});

afterAll(() => {
  mockServer.close();
  configDB.end();
});

describe('Case #1. Test CRUD API methods', () => {
  it('should return an empty array of users on the first GET /api/users request', async () => {
    const response = await mockApp.get(BASE_URL);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should create and return a new user on the POST /api/users request', async () => {
    const response = await mockApp.post(BASE_URL).send(testUser);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ ...testUser, id: response.body.id });
    newUser = response.body;
  });

  it('should return the user by id on the GET /api/users/:id request', async () => {
    const response = await mockApp.get(`${BASE_URL}/${newUser.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(newUser);
  });

  it('should update the user info on the PUT /api/users/:id request', async () => {
    const response = await mockApp.put(`${BASE_URL}/${newUser.id}`).send({ age: 28 });
    const updatedUser = { ...newUser, age: 28 };
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(updatedUser);
  });

  it('should delete user on the DELETE /api/users/:id request', async () => {
    const response = await mockApp.delete(`${BASE_URL}/${newUser.id}`);
    expect(response.statusCode).toBe(204);
  });
});

describe('Case #2. Test error handling', () => {
  const validId = v4();
  const invalidId = validId.split('-').join('');

  it('should respond with status 404 on the GET request for non-existing endpoint', async () => {
    const response = await mockApp.get('/test');
    expect(response.statusCode).toBe(404);
  });

  it('should respond with status 404 when trying to use the unsupported method', async () => {
    const response = await mockApp.patch(BASE_URL);
    expect(response.statusCode).toBe(501);
    expect(response.body.error).toEqual(ErrorMessages.UNSUPPORTED_METHOD);
  });

  it('should respond with 404 error on GET /api/users/:id request with valid UUID', async () => {
    const response = await mockApp.get(`${BASE_URL}/${validId}`);
    expect(response.statusCode).toBe(404);
  });

  it('should respond with 400 error on GET /api/users/:id request with invalid UUID', async () => {
    const response = await mockApp.get(`${BASE_URL}/${invalidId}`);
    expect(response.statusCode).toBe(400);
  });

  it('should respond with 404 error on PUT /api/users/:id request with valid UUID', async () => {
    const response = await mockApp.put(`${BASE_URL}/${validId}`).send({ age: 30 });
    expect(response.statusCode).toBe(404);
  });

  it('should respond with 400 error on PUT /api/users/:id request with invalid UUID', async () => {
    const response = await mockApp.put(`${BASE_URL}/${invalidId}`).send({ age: 30 });
    expect(response.statusCode).toBe(400);
  });

  it('should respond with 404 error on DELETE /api/users/:id request with valid UUID', async () => {
    const response = await mockApp.delete(`${BASE_URL}/${validId}`);
    expect(response.statusCode).toBe(404);
  });

  it('should respond with 400 error on DELETE /api/users/:id request with invalid UUID', async () => {
    const response = await mockApp.delete(`${BASE_URL}/${invalidId}`);
    expect(response.statusCode).toBe(400);
  });
});

describe('Case #3. Test user data validation', () => {
  it('should respond with 400 error on POST /api/users/ request with the lack of the "username" field', async () => {
    const partialUser: Partial<IUser> = { ...testUser };
    delete partialUser['username'];
    const response = await mockApp.post(BASE_URL).send(partialUser);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(ErrorMessages.INVALID_DATA);
  });

  it('should respond with 400 error on POST /api/users/ request with the empty string in the "username" field', async () => {
    const response = await mockApp.post(BASE_URL).send(testUser2);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(ErrorMessages.INVALID_DATA);
  });

  it('should respond with 400 error on POST /api/users/ request with the lack of the "age" field', async () => {
    const partialUser: Partial<IUser> = { ...testUser };
    delete partialUser['age'];
    const response = await mockApp.post(BASE_URL).send(partialUser);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(ErrorMessages.INVALID_DATA);
  });

  it('should respond with 400 error on POST /api/users/ request with the incorrect "age" field', async () => {
    const response = await mockApp.post(BASE_URL).send(testUser3);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(ErrorMessages.INVALID_DATA);
  });

  it('should respond with 400 error on POST /api/users/ request with the lack of the "hobbies" field', async () => {
    const partialUser: Partial<IUser> = { ...testUser };
    delete partialUser['hobbies'];
    const response = await mockApp.post(BASE_URL).send(partialUser);
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(ErrorMessages.INVALID_DATA);
  });
});
