const express = require('express')
const logger = require('../configs/logger.config')
const db = require('../models/index')

const User = db.users

const router = express.Router()
const {
  fetchProductData,
  createProduct,
  updatePutProductData,
  updatePatchProductData,
  deleteProduct
} = require('../controllers/product.controller')
const authorizeToken = require('../middlewares/auth')(User, logger)

router.post('/v1/product/', authorizeToken, createProduct)
router.get('/v1/product/:id', fetchProductData)
router.put('/v1/product/:id', authorizeToken, updatePutProductData)
router.patch('/v1/product/:id', authorizeToken, updatePatchProductData)
router.delete('/v1/product/:id', authorizeToken, deleteProduct)

module.exports = router
