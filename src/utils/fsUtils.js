const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const getData = async () => {
    const path_data = '../talker.json';
    try {
        const data = await fs.readFile(path.join(__dirname, path_data), 'utf-8')
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};


const getTalkerByID = async (id) => {
    const data = await getData();
    return data.find((talker) => talker.id === id);
}

const generateRandomToken = () => {
  const tokenLength = 16;
  return crypto.randomBytes(tokenLength/2).toString('hex');
};

const generateTokenLogin = (bodyContent) => {
    //const login = {... bodyContent};
    return generateRandomToken();
}





module.exports = {
    getData,
    getTalkerByID,
    generateTokenLogin
}