import { KbTopics, KbCategories } from '../../../db/models';

export default {
  kbTopic(root, { topicId }) {
    return KbTopics.findOne({ _id: topicId }).then(topic => ({
      title: topic.title,
      categories: KbCategories.find({ topicId: topicId }),
    }));
  },
};
