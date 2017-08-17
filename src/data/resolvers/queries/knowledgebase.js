import { KbTopics, KbCategories, KbArticles } from '../../../db/models';

export default {
  kbTopic(root, { topicId }) {
    return KbTopics.findOne({ _id: topicId }).then(topic => ({
      _id: topic._id,
      title: topic.title,
      description: topic.description,
      categories: KbCategories.find({ _id: { $in: topic.categoryIds } }).then(categories => {
        return categories.map(category => {
          return {
            _id: category._id,
            title: category.title,
            description: category.description,
            articles: KbArticles.find({ _id: { $in: category.articleIds } }),
          };
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
