import mongoose from 'mongoose';
import Random from 'meteor-random';

const KbArticlesSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: String,
  summary: String,
  content: String,
  createdBy: String,
  createdDate: Date,
  modifiedBy: String,
  modifiedDate: Date,
  // createdDate: Date,
});

const KbArticles = mongoose.model('knowledgebase_articles', KbArticlesSchema);

export default KbArticles;
