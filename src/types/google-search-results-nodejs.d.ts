// E:\newsgenie\types\google-search-results-nodejs.d.ts
declare module 'google-search-results-nodejs' {
  class SerpApi {
    constructor(apiKey: string);
    json(params: any): Promise<any>;
  }
  export = SerpApi;
}