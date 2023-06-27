import http from 'http';

const sendResponse = <T>(res: http.ServerResponse, statusCode: number, data: T) => {
  res.statusCode = statusCode;
  res.write(JSON.stringify(data));
  res.end();
};

export default sendResponse;
