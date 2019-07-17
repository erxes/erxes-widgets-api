import form from './form';
import knowledgebase from './knowledgebase';
import messenger from './messenger';
import sendEvent from './sendEvent';

export default {
  ...form,
  ...messenger,
  ...knowledgebase,
  ...sendEvent,
};
