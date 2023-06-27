import DB from './libs/db';
import http from 'http';
import sendResponse from './utils/sendResponse';
import HttpStatusCodes from './utils/constants';
import parseRequest from './utils/parseRequest';
import { validateUserData, validateUuid } from './utils/validation';
import { configDB } from './libs/dbHelpers';

class App {
  constructor(private db: DB) {
    this.db = db;
  }

  async getUsers(res: http.ServerResponse) {
    const users = await this.db.getUsers();
    sendResponse(res, HttpStatusCodes.OK, users);
  }

  async getUser(id: string, res: http.ServerResponse) {
    const isValidId = validateUuid(id);

    if (isValidId) {
      const user = await this.db.getUser(id);
      if (user) {
        sendResponse(res, HttpStatusCodes.OK, user);
      } else {
        sendResponse(res, HttpStatusCodes.NOT_FOUND, {
          error: `User with id ${id} not found`,
        });
      }
    } else {
      sendResponse(res, HttpStatusCodes.BAD_REQUEST, {
        error: 'Provided id is not a valid id (uuid)',
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

  async getReqHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    const id = req.url ? parseRequest(req.url) : null;

    if (id) {
      await this.getUser(id, res);
    } else {
      await this.getUsers(res);
    }
  }

  async postReqHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    let data: string = '';

    req.on('data', (dataChunk) => {
      data += dataChunk;
    });

    req.on('end', async () => {
      const body = JSON.parse(data);
      const isValidUser = validateUserData(body);

      if (isValidUser) {
        const newUser = await this.db.createUser(body);

        sendResponse(res, HttpStatusCodes.CREATED, newUser);
      } else {
        sendResponse(res, HttpStatusCodes.BAD_REQUEST, {
          error: 'User data has incorrect format',
        });
      }
    });
  }

  async putReqHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    const id = req.url ? parseRequest(req.url) : null;

    if (id) {
      const isValidId = validateUuid(id);

      if (isValidId) {
        await this.updateUser(req, res, id);
      } else {
        sendResponse(res, HttpStatusCodes.BAD_REQUEST, {
          error: 'Provided id is not a valid id (uuid)',
        });
      }
    } else {
      sendResponse(res, HttpStatusCodes.NOT_FOUND, { error: `User id is not provided` });
    }
  }

  async deleteReqHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    const id = req.url ? parseRequest(req.url) : null;

    if (id) {
      const isValidId = validateUuid(id);

      if (isValidId) {
        const deletedUser = await this.db.deleteUser(id);

        if (deletedUser) {
          sendResponse(res, HttpStatusCodes.NO_CONTENT, {
            message: 'User was successfully deleted',
          });
        } else {
          sendResponse(res, HttpStatusCodes.NOT_FOUND, {
            error: `User with id ${id} does not exist`,
          });
        }
      } else {
        sendResponse(res, HttpStatusCodes.BAD_REQUEST, {
          error: 'Provided id is not a valid id (uuid)',
        });
      }
    } else {
      sendResponse(res, HttpStatusCodes.NOT_FOUND, { error: `User id was not provided` });
    }
  }

  async requestHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    try {
      res.setHeader('Content-Type', 'application/json');

      const url = req.url;

      if (url && !url.startsWith('/api/users') && !/\/api\/users/.test(url)) {
        sendResponse(res, HttpStatusCodes.NOT_FOUND, { error: `${url} path does not exist` });
        return;
      }

      switch (req.method) {
        case 'GET':
          await this.getReqHandler(req, res);
          break;
        case 'POST':
          await this.postReqHandler(req, res);
          break;
        case 'PUT':
          await this.putReqHandler(req, res);
          break;
        case 'DELETE':
          await this.deleteReqHandler(req, res);
          break;
        default:
          sendResponse(res, HttpStatusCodes.NOT_SUPPORTED, {
            error: 'HTTP method is not supported',
          });
      }
    } catch (error) {
      configDB.end();
      sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
        error: 'Internal Server Error',
      });
    }
  }
}

export default App;
