import { Schema, Document } from 'mongoose';
import { field } from '../utils';
import { PUBLISH_STATUSES, LANGUAGE_CHOICES } from './constants';

interface CommonFields {
  createdBy: string,
  createdDate: Date,
  modifiedBy: string,
  modifiedDate: Date,
};

export interface IArticleDocument extends CommonFields, Document {
  _id: string,
  title: string,
  summary: string,
  content: string,
  status: string,
};

export interface ICategoryDocument extends CommonFields, Document {
  _id: string,
  title: string,
  description: string,
  articleIds: string[],
  icon: string,
};

export interface ITopicDocument extends CommonFields, Document {
  _id: string,
  title: string,
  description: string,
  brandId: string,
  categoryIds: string[]
  color: string,
  languageCode?: string,
};

// Mongoose schemas ==================

// Schema for common fields
const commonFields = {
  createdBy: field({ type: String }),
  createdDate: field({
    type: Date,
  }),
  modifiedBy: field({ type: String }),
  modifiedDate: field({
    type: Date,
  }),
};

export const ArticleSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  summary: field({ type: String }),
  content: field({ type: String }),
  status: field({
    type: String,
    enum: PUBLISH_STATUSES.ALL,
    default: PUBLISH_STATUSES.DRAFT,
  }),
  ...commonFields,
});

export const CategorySchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  description: field({ type: String }),
  articleIds: field({ type: [String] }),
  icon: field({ type: String }),
  ...commonFields,
});

export const TopicSchema = new Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  description: field({ type: String }),
  brandId: field({ type: String }),

  categoryIds: field({
    type: [String],
    required: false,
  }),

  color: field({ type: String }),

  languageCode: field({
    type: String,
    enum: LANGUAGE_CHOICES,
    optional: true,
  }),

  ...commonFields,
});
