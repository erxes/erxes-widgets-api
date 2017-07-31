import { KbTopics, KbCategories, KbArticles } from '../../../db/models';

// function getArticles(categories) {
//   let res = [];
//   categories.then(categories => {
//     categories.map(category => {
//       res.push({
//         title: category.title,
//         articles: KbArticles.find({categoryId: category._id})
//       })
//     })
//   })
//   return res;
// }

// function getArticles(categories) {
//   return categories.then(function(categories) {
//     categories.map((category) => {
//       return {
//         title: category.title
//       }
//     })
//   })
// }

export default {
  kbTopic(root, { topicId, searchString }) {
    return KbTopics.findOne({ _id: topicId }).then(topic => ({
      title: topic.title,
      description: topic.description,
      categories: KbCategories.find({ topicId: topicId }).then(categories => {
        return categories.map(category => {
          if (searchString) {
            return {
              title: category.title,
              description: category.description,
              articles: KbArticles.find({
                categoryId: category._id,
                content: { $regex: '.*' + searchString + '.*' },
              }),
            };
          } else {
            return {
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
