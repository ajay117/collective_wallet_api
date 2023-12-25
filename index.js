const app = require("./app");
const config = require("./config");
const port = config.server.port;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
