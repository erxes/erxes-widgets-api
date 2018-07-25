import {
  Users,
  KnowledgeBaseCategories as KnowledgeBaseCategoriesModel,
  KnowledgeBaseArticles as KnowledgeBaseArticlesModel,
  IKbArticleDocument,
  IKbTopicDocument,
  IKbCategoryDocument,
} from '../../db/models';

export const KnowledgeBaseArticle = {
  author(article: IKbArticleDocument) {
    return Users.findOne({ _id: article.createdBy });
  },
};

export const KnowledgeBaseTopic = {
  categories(topic: IKbTopicDocument) {
    return KnowledgeBaseCategoriesModel.find({ _id: { $in: topic.categoryIds } });
  },
};

export const KnowledgeBaseCategory = {
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
    }).count();
  },
};
