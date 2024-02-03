require("dotenv").config();
module.exports = {
  development: {
    client: "postgres",
    connection: {
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASSWORD || "t(qlbiyq&",
      database: process.env.DATABASE,
    },
  },
};
