export const BASE_URL = '/api/users';

export enum HttpStatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  NOT_SUPPORTED = 501,
}

export enum ErrorMessages {
  INVALID_ID = 'Provided id is not a valid id (uuid)',
  INVALID_DATA = 'User data has incorrect format',
  DELETED_USER = 'User was successfully deleted',
  NO_USER_ID = 'User id was not provided',
  UNSUPPORTED_METHOD = 'HTTP method is not supported',
  SERVER_ERROR = 'Internal Server Error',
}
