import { KbTopics, KbCategories, KbArticles, Users } from '../../../db/models';

export default {
  kbTopic(root, { topicId }) {
    return KbTopics.findOne({ _id: topicId }).then(topic => ({
      _id: topic._id,
      title: topic.title,
      description: topic.description,
      categories: KbCategories.find({ _id: { $in: topic.categoryIds } }).then(categories => {
        return categories.map(category => {
          return KbArticles.find({
            _id: { $in: category.articleIds },
            status: 'publish',
          }).then(articles => {
            let numOfArticles = 0;
            let authors = {};
            let authorsArray = [];

            numOfArticles = articles.length;
            articles.forEach(article => {
              authors[article['createdBy']] = authors[article.createdBy] || {
                details: {},
                articleCount: 0,
              };
              authors[article.createdBy].articleCount++;
            });

            let authorIds = Object.keys(authors);

            return Users.find({ _id: { $in: authorIds } }).then(users => {
              users.forEach(user => {
                authors[user._id].details = user.details;
              });

              authorIds.forEach(k => {
                authorsArray.push(authors[k]);
              });

              authorsArray.sort((a, b) => a.articleCount - b.articleCount);

              return {
                _id: category._id,
                title: category.title,
                description: category.description,
                icon: category.icon,
                numOfArticles,
                authors: authorsArray,
                articles,
              };
            });
          });
        });
      }),
    }));
  },
  kbSearchArticles(root, { topicId, searchString }) {
    return KbTopics.findOne({ _id: topicId }).then(topic => {
      return KbCategories.find({ _id: { $in: topic.categoryIds } }).then(categories => {
        let articleIds = [];

        categories.forEach(category => {
          articleIds = [...articleIds, ...category.articleIds];
        });

        return KbArticles.find({
          _id: {
            $in: articleIds,
            content: { $regex: '.*' + searchString + '.*' },
          },
          status: 'publish',
        });
      });
    });
  },
};

// const topic = await KbTopics.findOne({_id: topicId});
// const categories = await KbCategories.find({ _id: { $in: topic.categoryIds } });
//
// let articleIds = [];
//
// categories.forEach((category) => {
//   articleIds = [...articleIds, ...category.articleIds];
// });
//
// return KbArticles.find({
//   _id: {
//     $in: articleIds,
//   },
// });

// const topic = await KbTopics.findOne({_id: topicId});
// const categories = await KbCategories.find({ _id: { $in: topic.categoryIds } });
//
// let articleIds = [];
//
// categories.forEach((category) => {
//   articleIds = [...articleIds, ...category.articleIds];
// });
//
// return KbArticles.find({
//   _id: {
//     $in: articleIds,
//   },
// });
