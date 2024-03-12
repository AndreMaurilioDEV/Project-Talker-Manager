const fs = require('fs').promises;
const path = require('path');

const pathData = '../talker.json';
const getData = async () => {
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

const writeTalker = async (newTalker) => {
  try {
    const oldTalker = await getData();
    const nextId = oldTalker.length + 1;
    const talkerID = { id: nextId, ...newTalker };
    const newTalkers = JSON.stringify([...oldTalker, talkerID]);
    await fs.writeFile(path.join(__dirname, pathData), newTalkers);
    return talkerID;
  } catch (error) {
    return null;
  }
};

const deleteTalker = async (id) => {
  try {
    const data = await getData();
    const arrayPosition = data.findIndex((talker) => talker.id === Number(id));
    data.splice(arrayPosition, 1);
    await fs.writeFile(path.join(__dirname, pathData), JSON.stringify(data));
  } catch (error) {
    return null;
  }
};

const updateTalker = async (id, updated) => {
  const oldTalker = await getData();
  const updatedTalker = { id, ...updated };
  const talkerUpdate = oldTalker.reduce((talkerList, currentTalker) => {
    if (currentTalker.id === updatedTalker.id) {
      return [...talkerList, updatedTalker];
    } 
    return [...talkerList, currentTalker];
  }, []);

  const updateData = JSON.stringify(talkerUpdate);
  try {
    await fs.writeFile(path.resolve(__dirname, pathData), updateData);
    return updatedTalker;
  } catch (error) {
    return null;
  }
};
// const login = {... bodyContent};

module.exports = {
  getData,
  getTalkerByID,
  writeTalker,
  deleteTalker,
  updateTalker,
};