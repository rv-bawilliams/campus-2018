const express = require('express');
const winston = require('winston');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json())

const pets = [];
let id = 1;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' }),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ],
});

app.get('/health', (req, res) => {
  logger.log('info', 'Health check successful');
  res.send('healthy');
});

app.post('/pets', (req, res) => {
  const pet = { ...req.body, id: id++ };
  pets.push(pet);
  logger.log('info', `Pet ID ${id} created`);
  res.status(201).json(pet);
});

app.get('/pets', (req, res) => {
  res.json(pets);
});

app.get('/pets/:petId', (req, res) => {
  const pet = pets.find(pet => pet.id === +req.params.petId)

  if (!pet) {
    logger.log('error', `Pet ID ${req.params.petId} was not found`);
    return res.status(404).send();
  }

  res.json(pet);
});

app.put('/pets/:petId', (req, res) => {
  let pet = pets.find(pet => pet.id === +req.params.petId)

  if (!pet) {
    logger.log('error', `Pet ID ${req.params.petId} was not found - could not update`);
    return res.status(404).send();
  }

  pet = { ...pet, ...req.body, id: pet.id };

  logger.log('info', `Pet ID ${req.params.petId} was updated`);
  res.json(pet);
});

app.delete('/pets/:petId', (req, res) => {
  const index = pets.findIndex(pet => pet.id === +req.params.petId)

  if (index < 0) {
    logger.log('error', `Pet ID ${req.params.petId} was not found - could not delete`);
    return res.status(404).send();
  }

  pets.splice(index, 1);

  logger.log('info', `Pet ID ${req.params.petId} was deleted`);
  res.status(204).send();
});

const port = process.env.PORT || 3000;

app.listen(port, () => logger.log('info', `Listening on ${port}`));
