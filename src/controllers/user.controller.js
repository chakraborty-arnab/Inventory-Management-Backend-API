const db = require('../models/index')
const logger = require('../configs/logger.config')
const appConfig = require('../configs/app.config')
const { hashPassword } = require('../utils/auth.util')

const User = db.users

const formatUser = (user) => {
  const {
    id,
    first_name,
    last_name,
    username,
    account_created,
    account_updated,
  } = user
  const data = {
    id,
    first_name,
    last_name,
    username,
    account_created,
    account_updated,
  }
  return data
}

const createUser = async (req, res) => {
  const { protocol, method, hostname, originalUrl } = req;
  const headers = { ...req.headers };
  const metaData = { protocol, method, hostname, originalUrl, headers };
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, { metaData });
  
  // Check if the email is in the correct format
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(req.body.username)) {
    return res.status(400).send({ message: 'Enter your Email ID in correct format. Example: abc@xyz.com' });
  }

  // Check if all required fields are present in the request body
  const { username, password, first_name, last_name } = req.body;
  if (!username || !password || !first_name || !last_name) {
    return res.status(400).send({ message: 'username, password, first_name, last_name are required fields' });
  }

  if (typeof username!== 'string' || typeof password !== 'string' || typeof first_name !== 'string' || typeof last_name !== 'string'){
    return res.status(400).send({ message: 'username : string, password : string, first_name : string, last_name : string' });

  }

  // Hash the password
  logger.info(`Hashing password for user ${first_name} ${last_name}`);
  const hash = await hashPassword(password);

  // Check if the user already exists
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res.status(400).send({ message: 'User already exists' });
  }

  // Create the new user
  const user = User.build({
    first_name,
    last_name,
    password: hash,
    username,
    account_created: new Date(new Date().toLocaleString('en', {timeZone: 'America/New_York'})),
    account_updated: new Date(new Date().toLocaleString('en', {timeZone: 'America/New_York'})),
  });
  
  try {
    const data = await user.save();
    const formattedData = formatUser(data.dataValues);
    return res.status(201).json(formattedData);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).send({ message: 'Username already exists' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).send({ message: 'Invalid username, should be an email' });
    }
    return res.status(500).send({ message: 'Internal server error' });
  }
};


const updateUserData = async (req, res) => {
  const { protocol, method, hostname, originalUrl } = req;
  const headers = { ...req.headers };
  const metaData = { protocol, method, hostname, originalUrl, headers };
  const { user } = req;
  const requestId = originalUrl.split("/").pop();
  const checkID = /^\d+$/.test(requestId);
  if (checkID === false){
    return res.status(404).json({ message: "url doesn't exist"});

  }

  if (parseInt(requestId) !== parseInt(user.id)) {
    return handleDifferentIdRequest(res, 'id different from the user');
  }
  
  if (req.body.id || req.body.username !== user.username || req.body.account_updated || req.body.account_created) {
    return handleInvalidRequest(res, 'id, username, account_created, and account_updated cannot be set');
  }
  
  if (!req.body.password && !req.body.first_name && !req.body.last_name) {
    return handleInvalidRequest(res, 'password, first_name, or last_name are required');
  }

  if (typeof req.body.username !== 'string' || typeof req.body.password !== 'string' || typeof req.body.first_name !== 'string' || typeof req.body.last_name !== 'string'){
    return res.status(400).send({ message: 'username : string, password : string, first_name : string, last_name : string' });

  }
  
  user.set({
    first_name: req.body.first_name || user.first_name,
    last_name: req.body.last_name || user.last_name,
    password: req.body.password ? await hashPassword(req.body.password) : user.password,
    account_updated: new Date(new Date(new Date().toLocaleString('en', {timeZone: 'America/New_York'}))),
  });
  
  try {
    await user.save();
    res.status(204).send();
    logRequestSuccess(req, metaData, user);
  } catch (err) {
    return handleError(res, err);
  }
};

const handleInvalidRequest = (res, message) => {
  logger.warn(`Invalid request body for user object: ${message}`);
  return res.status(400).json({ message });
};

const handleDifferentIdRequest = (res, message) => {
  logger.warn(`Invalid request body for user object: ${message}`);
  return res.status(403).json({ message });
};

const handleError = (res, err) => {
  logger.error('Internal server error', err);
  return res.status(500).json({ message: 'Internal server error', err });
};

const logRequestSuccess = (req, metaData, user) => {
  logger.info(`Updating and Storing user ${user.username} in db`);
  logger.info(`Requesting ${req.method} ${req.protocol}://${req.hostname}${req.originalUrl}`, { metaData });
};


const fetchUserData = async (req, res) => {
  const { protocol, method, hostname, originalUrl } = req;
  const headers = { ...req.headers };
  const metaData = { protocol, method, hostname, originalUrl, headers };
  logger.info(`Requesting ${method} ${protocol}://${hostname}${originalUrl}`, { metaData });
  const { id } = req.params;
  const checkID = /^\d+$/.test(id);
  if (checkID === false){
    return res.status(404).json({ message: "url doesn't exist"});

  }
  try{
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send({ message: 'Not Found!' });
    }
    const data = formatUser(user);
    if (id == data.id && user.username === req.user.username) {
      return res.status(200).json(data);
    }
    return res.status(403).send({ message: 'Forbidden' });
  }catch(err){
    return res.status(400).send({message: 'No user exists'})
  }
  
  
};


module.exports = {
  createUser,
  updateUserData,
  fetchUserData,
}
