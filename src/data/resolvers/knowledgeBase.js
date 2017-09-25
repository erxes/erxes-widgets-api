import {
  Users,
  KnowledgeBaseCategories as KnowledgeBaseCategoriesModel,
  KnowledgeBaseArticles as KnowledgeBaseArticlesModel,
} from '../../db/models';

export const KnowledgeBaseArticle = {
  authorDetails(article) {
    return Users.findOne({ _id: article.createdBy }).then(user => {
      return user.details;
    });
  },
};

export const KnowledgeBaseTopic = {
  categories(topic) {
    return KnowledgeBaseCategoriesModel.find({ _id: { $in: topic.categoryIds } });
  },
};

export const KnowledgeBaseCategory = {
  articles(category) {
    return KnowledgeBaseArticlesModel.find({ _id: { $in: category.articleIds } });
  },
  authors(category) {
    let authors = {};
    let authorsArray = [];

    return KnowledgeBaseArticlesModel.find({ _id: { $in: category.articleIds } }).then(articles => {
      articles.forEach(article => {
        authors[article['createdBy']] = authors[article.createdBy] || {
          details: {},
          articleCount: 0,
        };
        authors[article.createdBy].articleCount++;
      });

      let authorIds = Object.keys(authors);

      return Users.find({
        _id: { $in: authorIds },
      }).then(users => {
        users.forEach(user => {
          authors[user._id].details = user.details;
        });

        authorIds.forEach(k => {
          authorsArray.push(authors[k]);
        });

        authorsArray.sort((a, b) => a.articleCount - b.articleCount);
        return authorsArray;
      });
    });
  },
  numOfArticles(category) {
    return KnowledgeBaseArticlesModel.find({
      _id: { $in: category.articleIds },
      status: 'publish',
    }).then(articles => {
      return articles.length;
    });
  },
};
