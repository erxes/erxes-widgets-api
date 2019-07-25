import { HTTPCache, RESTDataSource } from 'apollo-datasource-rest';

export default class EngagesAPI extends RESTDataSource {
  constructor() {
    super();

    const { ENGAGES_API_DOMAIN } = process.env;

    this.baseURL = ENGAGES_API_DOMAIN;
    this.httpCache = new HTTPCache();
  }

  public async engagesList(params) {
    return this.post(`/engages/list`, params);
  }
}
