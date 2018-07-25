import { Schema, Document } from 'mongoose';
import { field } from '../utils';

interface IBrandEmailConfig extends Document {
  type: string,
  template: string,
}

export interface IBrandDocument extends Document {
  _id: string,
  code: string,
  name: string,
  description: string,
  userId: string,
  createdAt: Date,
  emailConfig: IBrandEmailConfig,
}

// Mongoose schemas ===========
const BrandEmailConfigSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({
    type: String,
    enum: ['simple', 'custom'],
  }),
  template: field({ type: String }),
});

export const BrandSchema = new Schema({
  code: field({ type: String }),
  name: field({ type: String }),
  description: field({ type: String }),
  userId: field({ type: String }),
  createdAt: field({ type: Date }),
  emailConfig: field({ type: BrandEmailConfigSchema }),
});
