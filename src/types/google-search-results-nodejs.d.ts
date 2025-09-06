// E:\newsgenie\types\google-search-results-nodejs.d.ts
declare module 'google-search-results-nodejs' {
  export interface SearchParams {
    [key: string]: string | number | boolean | undefined;
  }

  export interface SearchResult {
    [key: string]: unknown;
  }

  class SerpApi {
    constructor(apiKey: string);

    json(params: SearchParams): Promise<SearchResult>;
  }

  export = SerpApi;
}
