import { KbTopics, KbCategories, KbArticles } from '../../../db/models';

export default {
  kbTopic(root, { topicId, searchString }) {
    console.log('topicId: ', topicId);
    return KbTopics.findOne({ _id: topicId }).then(topic => ({
      _id: topic._id,
      title: topic.title,
      description: topic.description,
      categories: KbCategories.find({ topicId: topicId }).then(categories => {
        return categories.map(category => {
          if (searchString) {
            return {
              _id: category._id,
              title: category.title,
              description: category.description,
              articles: KbArticles.find({
                categoryId: category._id,
                content: { $regex: '.*' + searchString + '.*' },
              }),
            };
          } else {
            return {
              _id: category._id,
              title: category.title,
              description: category.description,
              articles: KbArticles.find({ categoryId: category._id }),
            };
          }
        });
      }),
    }));
  },
};
