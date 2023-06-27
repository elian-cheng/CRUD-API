const parseRequest = (url: string) => {
  const userId = url.replace('/api/users', '');
  return userId.length > 1 ? userId.slice(1) : null;
};

export default parseRequest;
