const server = require("./app");

require("./socketio/namespaces/stats");
require("./socketio/namespaces/games");

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
