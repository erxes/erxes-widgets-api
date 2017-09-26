import customScalars from './customScalars';
import Query from './queries';
import Mutation from './mutations';
import Conversation from './conversation';
import ConversationMessage from './conversationMessage';
import Field from './field';
import Engage from './engage';
import { KnowledgeBaseArticle, KnowledgeBaseCategory, KnowledgeBaseTopic } from './knowledgeBase';

export default {
  ...customScalars,

  Conversation,
  ConversationMessage,
  Field,

  EngageData: {
    ...Engage,
  },

  Query,
  Mutation,

  KnowledgeBaseArticle,
  KnowledgeBaseCategory,
  KnowledgeBaseTopic,
};
