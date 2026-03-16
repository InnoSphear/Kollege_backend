import { MeiliSearch } from 'meilisearch';

let meili;

export const getSearchClient = () => {
  if (!process.env.MEILI_HOST) return null;
  if (!meili) {
    meili = new MeiliSearch({
      host: process.env.MEILI_HOST,
      apiKey: process.env.MEILI_KEY || undefined,
    });
  }
  return meili;
};
