module.exports = {
  node_environment: process.env.NODE_ENV,
  //   server: {
  //     port: process.env.SERVER_PORT,
  //   },
  database: {
    mongodb_pwd: process.env.DB_PASSWORD,
  },
  jwt_key: process.env.JSON_WEB_TOKEN_SECRET_KEY,
};
