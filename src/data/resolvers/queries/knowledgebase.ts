import {
  KnowledgeBaseTopics as KnowledgeBaseTopicsModel,
  KnowledgeBaseCategories as KnowledgeBaseCategoriesModel,
  KnowledgeBaseArticles as KnowledgeBaseArticlesModel,
} from '../../../db/models';

export default {
  /**
   * Find Topic detail data along with its categories
   * @param {Object} args
   * @param {Object} args.topicId
   * @return {Promise} topic detail
   */
  knowledgeBaseTopicsDetail(root, { topicId }) {
    return KnowledgeBaseTopicsModel.findOne({ _id: topicId });
  },

  /**
   * Find Category detail data along with its articles
   * @param {Object} args
   * @param {Object} args.categoryId
   * @return {Promise} category detail
   */
  knowledgeBaseCategoriesDetail(root, { categoryId }) {
    return KnowledgeBaseCategoriesModel.findOne({ _id: categoryId });
  },

  /**
   * Search published articles that contain searchString (case insensitive)
   * in a topic found by topicId
   * @param {Object} args
   * @param {Object} args.topicId
   * @return {Promise} searched articles
   */
  async knowledgeBaseArticles(root, { topicId, searchString }) {
    let articleIds = [];
    const topic = await KnowledgeBaseTopicsModel.findOne({ _id: topicId });
    const categories = await KnowledgeBaseCategoriesModel.find({ _id: topic.categoryIds });
    categories.forEach(category => {
      articleIds = [...articleIds, ...category.articleIds];
    });

    return KnowledgeBaseArticlesModel.find({
      _id: { $in: articleIds },
      content: { $regex: `.*${searchString.trim()}.*`, $options: 'i' },
      status: 'publish',
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
