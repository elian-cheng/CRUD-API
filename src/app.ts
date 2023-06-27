import { DB } from 'libs/db';
import http from 'http';
import sendResponse from './utils/sendResponse';
import HttpStatusCodes from './utils/constants';
import parseRequest from './utils/parseRequest';

class App {
  constructor(private db: DB) {
    this.db = db;
  }

  async getUsers(res: http.ServerResponse) {
    const users = await this.db.getUsers();
    sendResponse(res, HttpStatusCodes.OK, users);
  }

  async getUser(id: string, res: http.ServerResponse) {
    const user = await this.db.getUser(id);
    if (user) {
      sendResponse(res, HttpStatusCodes.OK, user);
    } else {
      sendResponse(res, HttpStatusCodes.NOT_FOUND, {
        error: `User with id ${id} not found`,
      });
    }
  }

  async updateUser(req: http.IncomingMessage, res: http.ServerResponse, id: string) {
    let data: string = '';

    req.on('data', (dataChunk) => {
      data += dataChunk;
    });

    req.on('end', async () => {
      const body = JSON.parse(data);
      const updatedUser = await this.db.updateUser(id, body);

      if (updatedUser) {
        sendResponse(res, HttpStatusCodes.OK, updatedUser);
      } else {
        sendResponse(res, HttpStatusCodes.NOT_FOUND, {
          error: `User with id ${id} not found`,
        });
      }
    });
  }

  async handleGetRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const id = req.url ? parseRequest(req.url) : null;

    if (id) {
      await this.getUser(id, res);
    } else {
      await this.getUsers(res);
    }
  }

  async handlePostRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    let data: string = '';

    req.on('data', (dataChunk) => {
      data += dataChunk;
    });

    req.on('end', async () => {
      const body = JSON.parse(data);
      const newUser = await this.db.createUser(body);
      sendResponse(res, HttpStatusCodes.CREATED, newUser);
    });
  }

  async handlePutRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const id = req.url ? parseRequest(req.url) : null;

    if (id) {
      await this.updateUser(req, res, id);
    } else {
      sendResponse(res, HttpStatusCodes.BAD_REQUEST, {
        error: 'Provided id is not a valid id (uuid)',
      });
    }
  }

  async handleDeleteRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const id = req.url ? parseRequest(req.url) : null;

    if (id) {
      const deletedUser = await this.db.deleteUser(id);

      if (deletedUser) {
        sendResponse(res, HttpStatusCodes.NO_CONTENT, deletedUser);
      } else {
        sendResponse(res, HttpStatusCodes.NOT_FOUND, {
          error: `User with id ${id} doesn't exist`,
        });
      }
    } else {
      sendResponse(res, HttpStatusCodes.BAD_REQUEST, {
        error: 'Provided id is not a valid id (uuid)',
      });
    }
  }

  async handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    try {
      res.setHeader('Content-Type', 'application/json');

      const url = req.url;

      if (url && !url.startsWith('/api/users') && !/\/api\/users/.test(url)) {
        sendResponse(res, HttpStatusCodes.NOT_FOUND, { error: `${url} path does not exist` });
        return;
      }

      switch (req.method) {
        case 'GET':
          await this.handleGetRequest(req, res);
          break;
        case 'POST':
          await this.handlePostRequest(req, res);
          break;
        case 'PUT':
          await this.handlePutRequest(req, res);
          break;
        case 'DELETE':
          await this.handleDeleteRequest(req, res);
          break;
        default:
          sendResponse(res, HttpStatusCodes.NOT_SUPPORTED, {
            error: 'HTTP method is not supported',
          });
      }
    } catch (error) {
      sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
        error: 'Internal Server Error',
      });
    }
  }
}

export default App;
