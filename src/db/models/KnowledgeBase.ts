import { Model, model } from 'mongoose';
import {
  articleSchema,
  categorySchema,
  IArticleDocument,
  ICategoryDocument,
  ITopicDocument,
  topicSchema,
} from './definitions/knowledgebase';

export interface IArticleModel extends Model<IArticleDocument> {
  incReactionCount(articleId: string, reactionChoice): void;
}

export interface ICategoryModel extends Model<ICategoryDocument> {}
export interface ITopicModel extends Model<ITopicDocument> {}

export const loadArticleClass = () => {
  class Article {
    /*
     * Increase form view count
     */
    public static async incReactionCount(articleId: string, reactionChoice: string) {
      const article = await KnowledgeBaseArticles.findOne({ _id: articleId });

      if (!article) {
        throw new Error('Article not found');
      }

      const reactionCounts = article.reactionCounts || {};

      reactionCounts[reactionChoice] = (reactionCounts[reactionChoice] || 0) + 1;

      await KnowledgeBaseArticles.updateOne({ _id: articleId }, { $set: { reactionCounts } });
    }
  }

  articleSchema.loadClass(Article);

  return articleSchema;
};

export const loadCategoryClass = () => {
  return categorySchema;
};

export const loadTopicClass = () => {
  return topicSchema;
};

loadArticleClass();

// tslint:disable-next-line
export const KnowledgeBaseArticles = model<IArticleDocument, IArticleModel>('knowledgebase_articles', articleSchema);

// tslint:disable-next-line
export const KnowledgeBaseCategories = model<ICategoryDocument, ICategoryModel>(
  'knowledgebase_categories',
  categorySchema,
);

// tslint:disable-next-line
export const KnowledgeBaseTopics = model<ITopicDocument, ITopicModel>('knowledgebase_topics', topicSchema);
