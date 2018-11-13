import { Model, model } from "mongoose";
import {
  articleSchema,
  categorySchema,
  IArticleDocument,
  ICategoryDocument,
  ITopicDocument,
  topicSchema
} from "./definitions/knowledgebase";

interface IArticleModel extends Model<IArticleDocument> {}
interface ICategoryModel extends Model<ICategoryDocument> {}
interface ITopicModel extends Model<ITopicDocument> {}

// tslint:disable-next-line
export const KnowledgeBaseArticles = model<IArticleDocument, IArticleModel>(
  "knowledgebase_articles",
  articleSchema
);

// tslint:disable-next-line
export const KnowledgeBaseCategories = model<ICategoryDocument, ICategoryModel>(
  "knowledgebase_categories",
  categorySchema
);

// tslint:disable-next-line
export const KnowledgeBaseTopics = model<ITopicDocument, ITopicModel>(
  "knowledgebase_topics",
  topicSchema
);
