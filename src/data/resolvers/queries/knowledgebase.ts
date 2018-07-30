import {
  KnowledgeBaseArticles as KnowledgeBaseArticlesModel,
  KnowledgeBaseCategories as KnowledgeBaseCategoriesModel,
  KnowledgeBaseTopics as KnowledgeBaseTopicsModel
} from "../../../db/models";

export default {
  /**
   * Find Topic detail data along with its categories
   * @return {Promise} topic detail
   */
  knowledgeBaseTopicsDetail(root: any, { topicId }: { topicId: string }) {
    return KnowledgeBaseTopicsModel.findOne({ _id: topicId });
  },

  /**
   * Find Category detail data along with its articles
   * @return {Promise} category detail
   */
  knowledgeBaseCategoriesDetail(
    root: any,
    { categoryId }: { categoryId: string }
  ) {
    return KnowledgeBaseCategoriesModel.findOne({ _id: categoryId });
  },

  /*
   * Search published articles that contain searchString (case insensitive)
   * in a topic found by topicId
   * @return {Promise} searched articles
   */
  async knowledgeBaseArticles(
    root: any,
    args: { topicId: string; searchString: string }
  ) {
    const { topicId, searchString } = args;

    let articleIds: string[] = [];

    const topic = await KnowledgeBaseTopicsModel.findOne({ _id: topicId });

    if (!topic) {
      return [];
    }

    const categories = await KnowledgeBaseCategoriesModel.find({
      _id: topic.categoryIds
    });

    categories.forEach(category => {
      articleIds = [...articleIds, ...category.articleIds];
    });

    return KnowledgeBaseArticlesModel.find({
      _id: { $in: articleIds },
      content: { $regex: `.*${searchString.trim()}.*`, $options: "i" },
      status: "publish"
    });
  },

  /**
   * return a KnowledgeBaseLoader object with only `loadType` field in it
   * @return {Promise} KnowledgeBaseLoader
   */
  knowledgeBaseLoader(root: any, { topicId }: { topicId: string }) {
    return KnowledgeBaseTopicsModel.findOne({ _id: topicId }, { loadType: 1 });
  }
};
