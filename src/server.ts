import http from 'http';

const PORT = process.env.PORT || 4000;

const server = http.createServer();

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
};

export default startServer;
