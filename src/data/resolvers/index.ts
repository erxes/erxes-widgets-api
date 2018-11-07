import Conversation from "./conversation";
import ConversationMessage from "./conversationMessage";
import customScalars from "./customScalars";
import Engage from "./engage";
import Field from "./field";
import Form from "./form";
import {
  knowledgeBaseArticle,
  knowledgeBaseCategory,
  knowledgeBaseTopic
} from "./knowledgeBase";
import Mutation from "./mutations";
import Query from "./queries";

export default {
  ...customScalars,

  Conversation,
  ConversationMessage,
  Form,
  Field,

  EngageData: {
    ...Engage
  },

  Query,
  Mutation,

  KnowledgeBaseArticle: knowledgeBaseArticle,
  KnowledgeBaseCategory: knowledgeBaseCategory,
  KnowledgeBaseTopic: knowledgeBaseTopic
};
