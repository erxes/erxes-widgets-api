import { Model, model } from 'mongoose';
import {
  articleSchema,
  categorySchema,
  IArticleDocument,
  ICategoryDocument,
  ITopicDocument,
  topicSchema,
} from './definitions/knowledgebase';

export interface IArticleModel extends Model<IArticleDocument> {}
export interface ICategoryModel extends Model<ICategoryDocument> {}
export interface ITopicModel extends Model<ITopicDocument> {}

export const loadArticleClass = () => {
  return articleSchema;
};

export const loadCategoryClass = () => {
  return categorySchema;
};

export const loadTopicClass = () => {
  return topicSchema;
};

// tslint:disable-next-line
export const KnowledgeBaseArticles = model<IArticleDocument, IArticleModel>('knowledgebase_articles', articleSchema);

// tslint:disable-next-line
export const KnowledgeBaseCategories = model<ICategoryDocument, ICategoryModel>(
  'knowledgebase_categories',
  categorySchema,
);

// tslint:disable-next-line
export const KnowledgeBaseTopics = model<ITopicDocument, ITopicModel>('knowledgebase_topics', topicSchema);
