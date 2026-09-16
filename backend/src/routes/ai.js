import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { askTvaritaRAG, retrieveKnowledgeCandidates } from '../services/ragService.js';
import { KNOWLEDGE_ARCHIVE } from '../data/knowledgeArchive.js';

const router = Router();

const SUGGESTED_QUESTIONS = [
  "What is Kalamkari?",
  "Tell me about Kuchipudi.",
  "Which art forms are from Andhra Pradesh?",
  "Who is master artist Ramesh Kumar Jha?",
  "What happens in a traditional art workshop?",
  "Which Tvarita experiences are available?",
  "What is Warli art and its symbols?",
  "Tell me about Baul music and philosophy.",
  "How are natural dyes made in traditional painting?",
  "What are the traditional art practices of Bihar?",
];

/**
 * POST /api/ai/ask
 * RAG question answering endpoint
 */
router.post(
  '/ask',
  asyncHandler(async (req, res) => {
    const { question } = req.body || {};

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        message: 'Question is required and must be a non-empty string',
        answer: 'Please provide a valid question to consult Ask Tvarita.',
        sources: [],
      });
    }

    const result = await askTvaritaRAG(question);
    res.json(result);
  }),
);

/**
 * GET /api/ai/suggested-questions
 * Quick prompts for discovery
 */
router.get(
  '/suggested-questions',
  asyncHandler(async (_req, res) => {
    res.json({ questions: SUGGESTED_QUESTIONS });
  }),
);

/**
 * GET /api/ai/knowledge
 * Browse knowledge archive items
 */
router.get(
  '/knowledge',
  asyncHandler(async (req, res) => {
    const { q, type, region } = req.query;

    if (q) {
      const results = await retrieveKnowledgeCandidates(q);
      return res.json({ data: results, count: results.length });
    }

    let items = [...KNOWLEDGE_ARCHIVE];
    if (type) {
      items = items.filter((item) => item.type === type);
    }
    if (region) {
      items = items.filter((item) => (item.region || '').toLowerCase().includes(region.toLowerCase()));
    }

    res.json({ data: items, count: items.length });
  }),
);

export default router;
