import * as dotenv from 'dotenv';
import mongoose = require('mongoose');
import { debugDb } from '../debuggers';

dotenv.config();

const { MONGO_URL = '' } = process.env;

mongoose.Promise = global.Promise;

mongoose.set('useFindAndModify', false);

mongoose.connection
  .on('connected', () => {
    debugDb(`Connected to the database: ${MONGO_URL}`);
  })
  .on('disconnected', () => {
    debugDb(`Disconnected from the database: ${MONGO_URL}`);
  })
  .on('error', error => {
    debugDb(`Database connection error: ${MONGO_URL}`, error);
  });

export function connect() {
  return mongoose.connect(
    MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true },
  );
}

export function disconnect() {
  return mongoose.connection.close();
}
