import { ApolloServer, PlaygroundConfig } from "apollo-server-express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as dotenv from "dotenv";
import * as express from "express";
import resolvers from "./data/resolvers";
import typeDefs from "./data/schema";
import { connect } from "./db/connection";

// load environment variables
dotenv.config();

// connect to mongo database
const connectionPromise = connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

const { NODE_ENV, PORT } = process.env;

let playground: PlaygroundConfig = false;

if (NODE_ENV !== "production") {
  playground = {
    settings: {
      "general.betaUpdates": false,
      "editor.theme": "dark",
      "editor.cursorShape": "line",
      "editor.reuseHeaders": true,
      "tracing.hideTracingResponse": true,
      "editor.fontSize": 14,
      "editor.fontFamily": `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
      "request.credentials": "include"
    }
  };
}

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  playground
});

// for health check
app.get("/status", async (_, res) => {
  res.end("ok");
});

app.get("/script-manager", async (req, res) => {
  const { WIDGET_URL } = process.env;

  const instance = await connectionPromise;

  const script = await instance.connection.db
    .collection("scripts")
    .findOne({ _id: req.query.id });

  if (!script) {
    res.end("Not found");
  }

  const generateScript = type => {
    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${WIDGET_URL}/build/${type}Widget.bundle.js";
        script.async = true;
        
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    `;
  };

  let erxesSettings = "{";
  let includeScripts = "";

  if (script.messengerBrandCode) {
    erxesSettings += `messenger: { brand_id: "${script.messengerBrandCode}" },`;
    includeScripts += generateScript("messenger");
  }

  if (script.kbTopicId) {
    erxesSettings += `knowledgeBase: { topic_id: "${script.kbTopicId}" },`;
    includeScripts += generateScript("knowledgebase");
  }

  if (script.leadMaps) {
    erxesSettings += "forms: [";

    script.leadMaps.forEach(map => {
      erxesSettings += `{ brand_id: "${map.brandCode}", form_id: "${
        map.formCode
      }" },`;
      includeScripts += generateScript("form");
    });

    erxesSettings += "],";
  }

  erxesSettings = `${erxesSettings}}`;

  res.end(`window.erxesSettings=${erxesSettings};${includeScripts}`);
});

apolloServer.applyMiddleware({ app, path: "/graphql" });

app.listen(PORT, () => {
  console.log(`Websocket server is running on port ${PORT}`);
});
