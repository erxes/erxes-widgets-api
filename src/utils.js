import requestify from 'requestify';

export const mutateAppApi = query => {
  const { APP_API_URL } = process.env;

  if (!APP_API_URL) {
    return;
  }

  requestify
    .request(APP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { query },
    })
    .catch(e => {
      console.log(e); // eslint-disable-line
    });
};
