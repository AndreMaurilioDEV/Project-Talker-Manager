const express = require('express');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

const {getData, getTalkerByID, generateTokenLogin} = require('./utils/fsUtils');

// não remova esse endpoint, e para o avaliador funcionar

const isValidEmail = (email) => {
  const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validationTalker = (req, res, next) => {
  const {email, password} = req.body;
  const emailValid = isValidEmail(email);
  if (!email) { return res.status(400).json({message: 'O campo \"email\" é obrigatório' })}
  if (!emailValid) {return res.status(400).json({message: 'O \"email\" deve ter o formato \"email@email.com\"' })}
  if (!password) { return res.status(400).json({message: 'O campo \"password\" é obrigatório' })}
  if (password.length <  6) { return res.status(400).json({message: 'O \"password\" deve ter pelo menos 6 caracteres' })}
}

app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker', async (req, res) => {
  const talkers = await getData();
  res.status(200).json(talkers)
});

app.get('/talker/:id', async (req, res) => {
  const {id} = req.params;
  const talkersPerID = await getTalkerByID(Number(id));
  if (talkersPerID) {
    return res.status(200).json(talkersPerID)
  }
    else {
    } res.status(404).json({message: "Pessoa palestrante não encontrada"});
      
});

app.post('/login', validationTalker, async (req, res) => {
  const randomToken = generateTokenLogin();
  res.status(200).json({token: randomToken})
});