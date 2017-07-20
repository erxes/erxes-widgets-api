import { KbTopics } from '../../../db/models';

export default {
  knowledgebase_topic(root, { topicId }) {
    return KbTopics.findOne({ _id: topicId }).then(topic => ({
      title: topic.title,
    }));
  },
};
