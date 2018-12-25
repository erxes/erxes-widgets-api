import * as dotenv from "dotenv";
import mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// prevent deprecated warning related findAndModify
// https://github.com/Automattic/mongoose/issues/6880
mongoose.set("useFindAndModify", false);

// load environment variables
dotenv.config();

beforeAll(() => {
  jest.setTimeout(30000);

  const { TEST_MONGO_URL } = process.env;

  return mongoose.connect(
    TEST_MONGO_URL || "mongodb://localhost/test",
    { useNewUrlParser: true, useCreateIndex: true }
  );
});

afterAll(() => {
  return mongoose.connection.db.dropDatabase();
});
