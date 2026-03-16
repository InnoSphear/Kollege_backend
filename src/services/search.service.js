import { getSearchClient } from '../config/search.js';

const indexDefs = {
  colleges: {
    primaryKey: '_id',
    searchable: ['name', 'city', 'state', 'country', 'overview', 'examsAccepted'],
    filterable: ['city', 'state', 'country', 'feesMax', 'ranking', 'avgPackage'],
    sortable: ['rating', 'ranking', 'feesMax', 'avgPackage'],
  },
};

export const initSearchIndexes = async () => {
  const client = getSearchClient();
  if (!client) return;

  await Promise.all(
    Object.entries(indexDefs).map(async ([name, config]) => {
      const task = await client.createIndex(name, { primaryKey: config.primaryKey }).catch(() => null);
      if (task?.taskUid) await client.waitForTask(task.taskUid);

      const index = client.index(name);
      await Promise.all([
        index.updateSearchableAttributes(config.searchable),
        index.updateFilterableAttributes(config.filterable),
        index.updateSortableAttributes(config.sortable),
      ]);
    })
  );
};

export const searchCollegesIndex = async (query, options = {}) => {
  const client = getSearchClient();
  if (!client) return null;

  const index = client.index('colleges');
  return index.search(query || '', options);
};

export const upsertCollegesToIndex = async (documents) => {
  const client = getSearchClient();
  if (!client || !documents?.length) return;
  const index = client.index('colleges');
  await index.addDocuments(documents);
};
