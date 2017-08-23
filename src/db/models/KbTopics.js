import mongoose from 'mongoose';
import Random from 'meteor-random';

const KbTopicsSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: String,
  brandId: String,
  description: String,
  categoryIds: {
    type: [],
    required: false,
  },
  loadType: String,
  // createdDate: Date,
});

const KbTopics = mongoose.model('knowledgebase_topics', KbTopicsSchema);

export default KbTopics;
