import {
  Users,
  KnowledgeBaseCategories as KnowledgeBaseCategoriesModel,
  KnowledgeBaseArticles as KnowledgeBaseArticlesModel,
} from '../../db/models';

export const KnowledgeBaseArticle = {
  author(article) {
    return Users.findOne({ _id: article.createdBy });
  },
};

export const KnowledgeBaseTopic = {
  categories(topic) {
    return KnowledgeBaseCategoriesModel.find({ _id: { $in: topic.categoryIds } });
  },
};

export const KnowledgeBaseCategory = {
  articles(category) {
    return KnowledgeBaseArticlesModel.find({
      _id: { $in: category.articleIds },
      status: 'publish',
    });
  },

  async authors(category) {
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

  numOfArticles(category) {
    return KnowledgeBaseArticlesModel.find({
      _id: { $in: category.articleIds },
      status: 'publish',
    }).count();
  },
};
