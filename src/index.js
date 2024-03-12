const express = require('express');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

const crypto = require('crypto');
const { getData, 
  getTalkerByID, 
  writeTalker, 
  deleteTalker, 
  updateTalker, 
} = require('./utils/fsUtils');

// não remova esse endpoint, e para o avaliador funcionar

function generateToken() {
  return crypto.randomBytes(16 / 2).toString('hex');
}

const isValidEmail = (email) => {
  const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isDateValid = (date) => {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  return dateRegex.test(date);
}

const validationTalker = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) { return res.status(400).json({ message: 'O campo "email" é obrigatório' }); }

  const emailValid = isValidEmail(email);
  if (!emailValid) {
    return res.status(400).json(
      { message: 'O "email" deve ter o formato "email@email.com"' },
    );
  }
  if (!password) { return res.status(400).json({ message: 'O campo "password" é obrigatório' }); }
  if (password.length < 6) {
    return res.status(400).json(
      { message: 'O "password" deve ter pelo menos 6 caracteres' },
    );
  }

  next();
};

const validateDataTalker = (req, res, next) => {
  const { name, age, talk } = req.body;
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Token não encontrado' });
  if (typeof header !== 'string' || header.length < 16) return res.status(401).json({ message: 'Token inválido' });
  if (!name) { return res.status(400).json({ message: 'O campo "name" é obrigatório' }); }
  if (name.length < 3) { 
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  if (!age) { return res.status(400).json({ message: 'O campo "age" é obrigatório' }); }
  if (age < 18 || !Number.isInteger(age)) { 
    return res.status(400).json(
      { message: 'O campo "age" deve ser um número inteiro igual ou maior que 18' },
    );
  }
  if (!talk) {
    return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  }
  if (!('watchedAt' in talk)) {
    return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
  }
  if (!('rate' in talk)) {
    return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  }
  if (('rate' in talk)) {
    const rateValue = talk.rate;
    if (!Number.isInteger(rateValue) || rateValue < 1 || rateValue > 5) {
      return res.status(400).json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' });
    }
  }
  if ('watchedAt' in talk) {
    const watchedValue = talk.watchedAt;
    if (!isDateValid(watchedValue)) {
      return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
    }
  }
  next();
};

app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker', async (req, res) => {
  const talkers = await getData();
  res.status(200).json(talkers);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkersPerID = await getTalkerByID(Number(id));
  if (talkersPerID) {
    return res.status(200).json(talkersPerID);
  }
  
  res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
});

app.post('/login', validationTalker, (req, res) => {
  const token = generateToken();
  console.log(token);
  res.setHeader('authorization', token);
  console.log(req.headers);
  res.status(200).json({ token });
});

app.post('/talker', validateDataTalker, async (req, res) => {
  const token = req.headers.authorization;
  // if (!token) return res.status(401).json({ message: 'Token inválido' })
  if (typeof token !== 'string' || token.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  const newTalker = req.body;
  const addTalker = await writeTalker(newTalker);
  res.status(201).json(addTalker);
});

app.delete('/talker/:id', (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Token não encontrado' });
  if (typeof token !== 'string' || token.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  const { id } = req.params;
  deleteTalker(id);
  res.status(204).end();
});

app.put('/talker/:id', validateDataTalker, async (req, res) => {
  const token = req.headers.authorization;
  if (typeof token !== 'string' || token.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  const { id } = req.params;
  const updated = req.body;
  const data = await getData();
  const talkersID = data.map((talker) => talker.id);
  const updatedTalker = await updateTalker(Number(id), updated);
  if (!talkersID.includes(Number(id))) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  return res.status(200).json(updatedTalker);
});
