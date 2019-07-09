import { KnowledgeBaseArticles } from '../../../db/models';

export default {
  knowledgebaseIncReactionCount(_root, { articleId, reactionChoice }: { articleId: string; reactionChoice: string }) {
    return KnowledgeBaseArticles.incReactionCount(articleId, reactionChoice);
  },
};
