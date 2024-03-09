const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const getData = async () => {
  const pathData = '../talker.json';
  try {
    const data = await fs.readFile(path.join(__dirname, pathData), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const getTalkerByID = async (id) => {
  const data = await getData();
  return data.find((talker) => talker.id === id);
};

const generateRandomToken = () => {
  const tokenLength = 16;
  return crypto.randomBytes(tokenLength / 2).toString('hex');
};

const generateTokenLogin = () => 
// const login = {... bodyContent};
  generateRandomToken();

module.exports = {
  getData,
  getTalkerByID,
  generateTokenLogin,
};