import {
  IKbArticleDocument,
  IKbCategoryDocument,
  IKbTopicDocument,
  KnowledgeBaseArticles as KnowledgeBaseArticlesModel,
  KnowledgeBaseCategories as KnowledgeBaseCategoriesModel,
  Users,
} from '../../db/models';

export const knowledgeBaseArticle = {
  author(article: IKbArticleDocument) {
    return Users.findOne({ _id: article.createdBy });
  },
};

export const knowledgeBaseTopic = {
  categories(topic: IKbTopicDocument) {
    return KnowledgeBaseCategoriesModel.find({
      _id: { $in: topic.categoryIds },
    });
  },
};

export const knowledgeBaseCategory = {
  articles(category: IKbCategoryDocument) {
    return KnowledgeBaseArticlesModel.find({
      _id: { $in: category.articleIds },
      status: 'publish',
    });
  },

  async authors(category: IKbCategoryDocument) {
    const articles = await KnowledgeBaseArticlesModel.find(
      {
        _id: { $in: category.articleIds },
        status: 'publish',
      },
      { createdBy: 1 },
    );

    const authorIds = articles.map(article => article.createdBy);

    return Users.find({
      _id: { $in: authorIds },
    });
  },

  numOfArticles(category: IKbCategoryDocument) {
    return KnowledgeBaseArticlesModel.find({
      _id: { $in: category.articleIds },
      status: 'publish',
    }).countDocuments();
  },
};
