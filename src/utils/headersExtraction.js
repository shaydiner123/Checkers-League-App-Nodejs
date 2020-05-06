const getReqHeaderValue = (data, key) => {
  cookie = data.headers.cookie;
  if (cookie) {
    cookies = cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      if (cookies[i].includes(key)) {
        let value = cookies[i].split("=")[1];
        return value;
      }
    }
  }
};

module.exports = getReqHeaderValue;
