gameRequests = [];

const addRequest = (requesterName, responserName) => {
  const request = { requesterName, responserName };
  gameRequests.push(request);
  return request;
};

const getRequest = (username) => {
  const request = gameRequests.find((request) => {
    return (
      request.requesterName === username || request.responserName === username
    );
  });
  return request;
};

const getRequesterName = (username) => {
  const request = getRequest(username);
  if (request) {
    return request.requesterName;
  }
};

const getResponserName = (username) => {
  const request = getRequest(username);
  return request.responserName;
};

const removeRequest = (username) => {
  const index = gameRequests.findIndex((request) => {
    return (
      request.requesterName === username || request.responserName === username
    );
  });
  if (index !== -1) {
    return gameRequests.splice(index, 1)[0];
  }
};

const getGameRequests = () => {
  return gameRequests;
};

const getOpponentName = (username) => {
  const request = getRequest(username);
  return request.requesterName === username
    ? request.responserName
    : request.requesterName;
};

module.exports = {
  addRequest,
  getResponserName,
  getRequesterName,
  removeRequest,
  getGameRequests,
  getRequest,
  getOpponentName,
};
