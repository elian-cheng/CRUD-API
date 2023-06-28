import DB from './libs/db';
import http from 'http';
import sendResponse from './utils/sendResponse';
import { BASE_URL, ErrorMessages, HttpStatusCodes } from './utils/constants';
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
        error: ErrorMessages.INVALID_ID,
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
          error: ErrorMessages.INVALID_DATA,
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
          error: ErrorMessages.INVALID_ID,
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
            message: ErrorMessages.DELETED_USER,
          });
        } else {
          sendResponse(res, HttpStatusCodes.NOT_FOUND, {
            error: `User with id ${id} does not exist`,
          });
        }
      } else {
        sendResponse(res, HttpStatusCodes.BAD_REQUEST, {
          error: ErrorMessages.INVALID_ID,
        });
      }
    } else {
      sendResponse(res, HttpStatusCodes.NOT_FOUND, { error: ErrorMessages.NO_USER_ID });
    }
  }

  async requestHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    try {
      res.setHeader('Content-Type', 'application/json');

      const url = req.url;

      if (url && !url.startsWith(BASE_URL) && !/\/api\/users/.test(url)) {
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
            error: ErrorMessages.UNSUPPORTED_METHOD,
          });
      }
    } catch (error) {
      configDB.end();
      sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
        error: ErrorMessages.SERVER_ERROR,
      });
    }
  }
}

export default App;
