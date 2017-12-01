import requestify from 'requestify';
import { Customers } from './db/models';

/*
 * returns requested user's ip address
 */
export const getIP = async remoteAddress => {
  if (process.env.NODE_ENV === 'production') {
    return remoteAddress;
  }

  const res = await requestify.get('https://jsonip.com');

  return JSON.parse(res.body).ip;
};

/*
 * returns requested user's geolocation info
 */
export const getLocationInfo = async remoteAddress => {
  // Don't do anything in test mode
  if (process.env.NODE_ENV === 'test') {
    return {
      city: 'Ulaanbaatar',
      country: 'Mongolia',
    };
  }

  const ip = await getIP(remoteAddress);
  const response = await requestify.get(`http://ipinfo.io/${ip}/json`);
  const data = JSON.parse(response.body);

  return {
    city: data.city,
    country: data.country,
  };
};

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

export const createCustomer = async (mainInfo, data, remoteAddress) => {
  const location = await getLocationInfo(remoteAddress);

  return Customers.createCustomer({ ...mainInfo, remoteAddress, location }, data);
};
