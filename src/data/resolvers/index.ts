import Conversation from "./conversation";
import ConversationMessage from "./conversationMessage";
import customScalars from "./customScalars";
import Engage from "./engage";
import Field from "./field";
import Form from "./form";
import {
  KnowledgeBaseArticle,
  KnowledgeBaseCategory,
  KnowledgeBaseTopic
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

  KnowledgeBaseArticle,
  KnowledgeBaseCategory,
  KnowledgeBaseTopic
};
