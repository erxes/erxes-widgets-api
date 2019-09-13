import knowledgebase from './knowledgebase';
import lead from './lead';
import messenger from './messenger';

export default {
  ...lead,
  ...messenger,
  ...knowledgebase,
};
