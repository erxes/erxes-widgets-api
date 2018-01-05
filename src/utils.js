import requestify from 'requestify';

export const mutateAppApi = query => {
  const { APP_API_URL } = process.env;

  // Don't do anything in test mode
  if (process.env.NODE_ENV === 'test') {
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
