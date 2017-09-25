import {
  KnowledgeBaseTopics as KnowledgeBaseTopicsModel,
  KnowledgeBaseArticles as KnowledgeBaseArticlesModel,
} from '../../../db/models';

export default {
  /**
   * Find Topic detail data all the way to the articles its categories contain
   * @param {Object} args
   * @param {Object} args.topicId
   * @return {Promise} topic detail
   */
  knowledgeBaseTopicsDetail(root, { topicId }) {
    return KnowledgeBaseTopicsModel.findOne({ _id: topicId });
  },

  /**
   * Search published articles that contain searchString (case insensitive)
   * in a topic found by topicId
   * @param {Object} args
   * @param {Object} args.topicId
   * @return {Promise} searched articles
   */
  knowledgeBaseArticlesSearch(root, { topicId, searchString }) {
    return KnowledgeBaseTopicsModel.findOne({
      _id: topicId,
    }).then(topic => {
      let articleIds = [];
      topic.categories.forEach(category => {
        articleIds = [...articleIds, ...category.articleIds];
      });
      return KnowledgeBaseArticlesModel.find({
        _id: {
          $in: articleIds,
        },
        content: { $regex: `.*${searchString.trim()}.*`, $options: 'i' },
        status: 'publish',
      });
    });
  },
  /**
   * return a KnowledgeBaseLoader object with only `loadType` field in it
   * @param {Object} args
   * @param {Object} args.topicId
   * @return {Promise} KnowledgeBaseLoader
   */
  knowledgeBaseLoader(root, { topicId }) {
    return KnowledgeBaseTopicsModel.findOne({ _id: topicId }, { loadType: 1 });
  },
};
