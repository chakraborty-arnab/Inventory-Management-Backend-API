const db = require('../models/index')
const logger = require('../configs/logger.config')
const appConfig = require('../configs/app.config')
const { getUserPasswordAuth } = require('../utils/auth.util')
const { Console } = require('winston/lib/winston/transports')

const Product = db.products
const User = db.users

const formatProduct = (product) => {
  const {
    id,
    name,
    description,
    sku,
    manufacturer,
    quantity,
    date_added,
    date_last_updated,
    owner_user_id
  } = product
  const data = {
    id,
    name,
    description,
    sku,
    manufacturer,
    quantity,
    date_added,
    date_last_updated,
    owner_user_id
  }
  return data
}

const createProduct = async (req, res) => {
  const { protocol, method, hostname, originalUrl } = req;
  const headers = { ...req.headers };
  const metaData = { protocol, method, hostname, originalUrl, headers };
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, { metaData });
  

  // Check if all required fields are present in the request body
  const { name, description, sku, manufacturer, quantity} = req.body;
  // if quantity in req.body
  if (!name || !description || !sku || !manufacturer|| !quantity===undefined) {
    return res.status(400).send({ message: 'name, description, sku, manufacturer, quantity are required fields' });
  }
  console.log(typeof req.body.quantity)
  // if (typeof req.body.quantity !== 'number' || typeof req.body.name !== 'string' || typeof req.body.description !== 'string' || typeof req.body.sku !== 'string' || typeof req.body.manufacturer !== 'string'){
  //   return res.status(400).send({ message: 'name : string, description : string, sku : string, manufacturer : string, quantity : number' });

  // }
  if ( !Number.isInteger(req.body.quantity) || typeof req.body.name !== 'string' || typeof req.body.description !== 'string' || typeof req.body.sku !== 'string' || typeof req.body.manufacturer !== 'string'){
    return res.status(400).send({ message: 'name : string, description : string, sku : string, manufacturer : string, quantity : number-Integer' });

  }
  for (const key in req.body) {
    if (!["name","description","sku","manufacturer","quantity"].includes(key)){
      return res.status(400).send({ message: 'only name, description, sku, manufacturer, quantity are allowed' });
    }
  }

  

  // Hash the password
  const hash = await getUserPasswordAuth(headers.authorization);
  const ownerId = await User.findOne({where: { username : hash.username}})
  // Check if the product already exists
  const existingProduct = await Product.findOne({ where: { sku } });
  if (existingProduct) {
    return res.status(400).send({ message: 'Product sku already exists' });
  }

  // Create the new product
  const product = Product.build({
    name,
    description,
    sku,
    manufacturer,
    quantity,
    date_added: new Date(new Date().toLocaleString('en', {timeZone: 'America/New_York'})),
    date_last_updated: new Date(new Date().toLocaleString('en', {timeZone: 'America/New_York'})),
    owner_user_id: ownerId.id,
  });

  try {
    const data = await product.save();
    const formattedData = formatProduct(data.dataValues);
    return res.status(201).json(formattedData);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({ message: 'Product already exists' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).send({ message: 'quantity should be > 0 and < 100' });
    }
    return res.status(500).send({ message: 'Internal server error' });
  }
};


const updatePutProductData = async (req, res) => {
  const { protocol, method, hostname, originalUrl } = req;
  const headers = { ...req.headers };
  const metaData = { protocol, method, hostname, originalUrl, headers };
  
  
  const requestId = originalUrl.split("/").pop();
  const checkID = /^\d+$/.test(requestId);
  if (checkID === false){
    return res.status(404).json({ message: "url doesn't exist"});

  }

  const product = await Product.findOne({ where: { id: requestId } });
  if (product === null){
    return res.status(404).send({ message: 'Product not found' });
  }
  console.log(product)
  const ownerId = product.owner_user_id
  const hash = await getUserPasswordAuth(headers.authorization);
  const authId = await User.findOne({where: { username : hash.username}})
  if (parseInt(ownerId) !== parseInt(authId.id)) {
    return handleForbiddenRequest(res, 'product not created by this user ');
  }

  if (!req.body.quantity || !req.body.name || !req.body.description || !req.body.sku || !req.body.manufacturer){
    return res.status(400).send({ message: ' required : name, description, sku, manufacturer, quantity' });

  }
  
  if (req.body.id || req.body.date_added || req.body.date_last_updated) {
    return handleInvalidRequest(res, 'id, date_added, and date_last_updated cannot be set');
  }
  if (!Number.isInteger(req.body.quantity)|| typeof req.body.name !== 'string' || typeof req.body.description !== 'string' || typeof req.body.sku !== 'string' || typeof req.body.manufacturer !== 'string'){
    return res.status(400).send({ message: 'name : string, description : string, sku : string, manufacturer : string, quantity : number' });

  }
  for (const key in req.body) {
    if (!["name","description","sku","manufacturer","quantity"].includes(key)){
      return res.status(400).send({ message: 'only name, description, sku, manufacturer, quantity are allowed' });
    }
  }
  const skuCheck = req.body.sku
  const existingUser = await Product.findOne({ where: { sku : skuCheck} });
  if (existingUser) {
    return res.status(400).send({ message: 'Product sku already exists' });
  }
  
  product.set({
    name: req.body.name || product.name,
    description: req.body.description || product.description,
    sku: req.body.sku || product.sku,
    manufacturer: req.body.manufacturer || product.manufacturer,
    quantity: req.body.quantity || product.quantity,
    date_last_updated: new Date(new Date().toLocaleString('en', {timeZone: 'America/New_York'})),
    owner_user_id: req.body.owner_user_id || product.owner_user_id,
  });
  
  try {
    await product.save();
    res.status(204).send();
    logRequestSuccess(req, metaData, product);
  } catch (err) {
    return handleError(res, err);
  }
};


const updatePatchProductData = async (req, res) => {
  const { protocol, method, hostname, originalUrl } = req;
  const headers = { ...req.headers };
  const metaData = { protocol, method, hostname, originalUrl, headers };
  
  
  const requestId = originalUrl.split("/").pop();
  const checkID = /^\d+$/.test(requestId);
  if (checkID === false){
    return res.status(404).json({ message: "url doesn't exist"});

  }

  const product = await Product.findOne({ where: { id: requestId } });
  if (product === null){
    return res.status(404).send({ message: 'Product not found' });
  }
  const ownerId = product.owner_user_id
  const hash = await getUserPasswordAuth(headers.authorization);
  const authId = await User.findOne({where: { username : hash.username}})
  
  console.log(ownerId)
  console.log(authId.id)
  if (parseInt(ownerId) !== parseInt(authId.id)) {
    return handleForbiddenRequest(res, 'product not created by this user ');
  }

  if (req.body.id || req.body.date_added || req.body.date_last_updated) {
    return handleInvalidRequest(res, 'id, date_added, and date_last_updated cannot be set');
  }
  if (req.body.quantity && !Number.isInteger(req.body.quantity)){
    return res.status(400).send({ message: 'quantity : number' });

  }
  if (req.body.name && typeof req.body.name !== 'string' ){
    return res.status(400).send({ message: 'name : string' });

  }
  if (req.body.description && typeof req.body.description !== 'string' ){
    return res.status(400).send({ message: 'quantity : string' });

  }
  if (req.body.sku && typeof req.body.sku !== 'string' ){
    return res.status(400).send({ message: 'quantity : string' });

  }
  if (req.body.manufacturer && typeof req.body.manufacturer !== 'string' ){
    return res.status(400).send({ message: 'quantity : string' });

  }
  // || typeof req.body.name !== 'string' || typeof req.body.description !== 'string' || typeof req.body.sku !== 'string' || typeof req.body.manufacturer !== 'string'){
  //   return res.status(400).send({ message: 'name : string, description : string, sku : string, manufacturer : string, quantity : number' });

  // }
  for (const key in req.body) {
    if (!["name","description","sku","manufacturer","quantity"].includes(key)){
      return res.status(400).send({ message: 'only name, description, sku, manufacturer, quantity are allowed' });
    }
  }
  const skuCheck = req.body.sku
  const existingUser = await Product.findOne({ where: { sku : skuCheck} });
  if (existingUser) {
    return res.status(400).send({ message: 'Product sku already exists' });
  }
  
  product.set({
    name: req.body.name || product.name,
    description: req.body.description || product.description,
    sku: req.body.sku || product.sku,
    manufacturer: req.body.manufacturer || product.manufacturer,
    quantity: req.body.quantity || product.quantity,
    date_last_updated: new Date(new Date().toLocaleString('en', {timeZone: 'America/New_York'})),
    owner_user_id: req.body.owner_user_id || product.owner_user_id,
  });
  
  try {
    await product.save();
    res.status(204).send();
    logRequestSuccess(req, metaData, product);
  } catch (err) {
    return handleError(res, err);
  }
};

const handleInvalidRequest = (res, message) => {
  logger.warn(`Invalid request body for product object: ${message}`);
  return res.status(400).json({ message });
};

const handleForbiddenRequest = (res, message) => {
  logger.warn(`Permission denied: ${message}`);
  return res.status(403).json({ message });
};

const handleError = (res, err) => {
  logger.error('Internal server error', err);
  return res.status(500).json({ message: 'Internal server error', err });
};

const logRequestSuccess = (req, metaData, product) => {
  logger.info(`Updating and Storing product ${product.id} in db`);
  logger.info(`Requesting ${req.method} ${req.protocol}://${req.hostname}${req.originalUrl}`, { metaData });
};


const fetchProductData = async (req, res) => {
  const { protocol, method, hostname, originalUrl } = req;
  const headers = { ...req.headers };
  const metaData = { protocol, method, hostname, originalUrl, headers };
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, { metaData });
  const { id } = req.params;
  const checkID = /^\d+$/.test(id);
  if (checkID === false){
    return res.status(404).json({ message: "url doesn't exist"});

  }
  const product = await Product.findByPk(id);
  if (!product) {
    return res.status(404).send({ message: 'Not Found!' });
  }
  const data = formatProduct(product);
  if (id == data.id ) {
    return res.status(200).json(data);
  }
};

const deleteProduct = async (req, res) => {
  const { protocol, method, hostname, originalUrl } = req;
  const headers = { ...req.headers };
  const metaData = { protocol, method, hostname, originalUrl, headers };
  
  
  const requestId = originalUrl.split("/").pop();
  const checkID = /^\d+$/.test(requestId);
  if (checkID === false){
    return res.status(404).json({ message: "url doesn't exist"});

  }
  const product = await Product.findOne({ where: { id: requestId } });
  if (!product) {
    return res.status(404).send({ message: 'Not Found!' });
  }
  console.log(product)
  const ownerId = product.owner_user_id
  const hash = await getUserPasswordAuth(headers.authorization);
  const authId = await User.findOne({where: { username : hash.username}})
  if (parseInt(ownerId) !== parseInt(authId.id)) {
    return handleForbiddenRequest(res, 'product not created by this user ');
  }

  try {
    const productDel = await Product.destroy({ where: { id: requestId } });
    res.status(204).send();
    logRequestSuccess(req, metaData, product);
  } catch (err) {
    return handleError(res, err);
  }
};


module.exports = {
  createProduct,
  updatePutProductData,
  updatePatchProductData,
  fetchProductData,
  deleteProduct
}
