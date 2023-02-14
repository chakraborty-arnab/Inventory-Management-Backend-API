const express = require('express')
const logger = require('../configs/logger.config')
const db = require('../models/index')

const User = db.users

const router = express.Router()
const {
  fetchUserData,
  createUser,
  updateUserData,
} = require('../controllers/user.controller')
const authorizeToken = require('../middlewares/auth')(User, logger)

router.post('/v1/user/', createUser)
router.get('/v1/user/:id', authorizeToken, fetchUserData)
router.put('/v1/user/:id', authorizeToken, updateUserData)

module.exports = router
