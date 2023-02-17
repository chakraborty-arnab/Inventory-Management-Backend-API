require('dotenv').config()
const express = require('express')
const helmet = require('helmet')

const { ENVIRONMENT, PORT, HOSTNAME } = process.env
const app = express()

const {
  userRoutes,
  health,
  productRoutes
} = require('./src/routes/index.routes')
const db = require('./src/models')
const logger = require('./src/configs/logger.config')
const User = db.users;
const Product = db.products;

//ADD LINE
Product.belongsTo(User, {foreignKey: 'owner_user_id'});
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json())

app.use('/', health, userRoutes, productRoutes)
app.use((req, res, next) => {
  res.status(404).send({ message: 'endpoint not found' });
});

if (ENVIRONMENT !== 'test') {
  db.connectionTest()
  db.sequelize.query("CREATE SCHEMA IF NOT EXISTS public;").then("SCHEMA created");
  db.sequelize.sync({alter: true})
}
app.listen(PORT, () => {
  if (ENVIRONMENT !== 'prod')
    logger.info(`Server running at http://${HOSTNAME}:${PORT}`)
})

module.exports = app
