require('dotenv').config()

const {
  HOSTNAME,
  DBUSER,
  DBPASSWORD,
  PORT,
  DATABASE,
  DBPORT,
} = process.env

module.exports = {
  HOSTNAME,
  USER: DBUSER,
  PASSWORD: DBPASSWORD,
  PORT,
  DB: DATABASE,
  DBPORT,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  }
}
