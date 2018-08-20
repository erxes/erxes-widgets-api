// TODO: readd strict mode and fix below import
import * as requestify from "requestify";

export const mutateAppApi = (query: string) => {
  const { MAIN_API_URL } = process.env;

  // Don't do anything in test mode
  if (process.env.NODE_ENV === "test") {
    return;
  }

  requestify
    .request(MAIN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { query }
    })
    .catch((e: Error) => {
      console.log(e); // eslint-disable-line
    });
};
