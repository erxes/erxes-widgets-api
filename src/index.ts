import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as dotenv from "dotenv";
import * as express from "express";
import { graphiqlExpress, graphqlExpress } from "graphql-server-express";
import schema from "./data";
import { connect } from "./db/connection";

// load environment variables
dotenv.config();

// connect to mongo database
connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.use("/graphql", graphqlExpress(() => ({ schema })));

if (process.env.NODE_ENV === "development") {
  app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));
}

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Websocket server is running on port ${PORT}`);
});
