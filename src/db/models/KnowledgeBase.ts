import { Model, model } from 'mongoose';
import {
  ArticleSchema,
  IArticleDocument,
  CategorySchema,
  ICategoryDocument,
  TopicSchema,
  ITopicDocument,
} from './definations/knowledgebase';

interface IArticleModel extends Model<IArticleDocument> {}
interface ICategoryModel extends Model<ICategoryDocument> {}
interface ITopicModel extends Model<ITopicDocument> {}

export const KnowledgeBaseArticles = model<IArticleDocument, IArticleModel>(
  'knowledgebase_articles', ArticleSchema);

export const KnowledgeBaseCategories = model<ICategoryDocument, ICategoryModel>(
  'knowledgebase_categories', CategorySchema);

export const KnowledgeBaseTopics = model<ITopicDocument, ITopicModel>(
  'knowledgebase_topics', TopicSchema);
