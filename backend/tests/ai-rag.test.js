import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Ask Tvarita RAG API', () => {
  it('answers questions about Kalamkari with grounded sources', async () => {
    const res = await request(app)
      .post('/api/ai/ask')
      .send({ question: 'What is Kalamkari?' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('answer');
    expect(res.body.answer.toLowerCase()).toContain('kalamkari');
    expect(Array.isArray(res.body.sources)).toBe(true);
    expect(res.body.sources.length).toBeGreaterThan(0);
    expect(res.body.sources[0].title.toLowerCase()).toContain('kalamkari');
    expect(res.body.sources[0].type).toBe('art-form');
  });

  it('answers questions about Andhra Pradesh regional art forms', async () => {
    const res = await request(app)
      .post('/api/ai/ask')
      .send({ question: 'Which art forms are from Andhra Pradesh?' });

    expect(res.status).toBe(200);
    expect(res.body.answer).toContain('Andhra Pradesh');
    expect(res.body.answer).toContain('Kalamkari');
    expect(res.body.sources.length).toBeGreaterThan(0);
  });

  it('answers questions about traditional art workshops', async () => {
    const res = await request(app)
      .post('/api/ai/ask')
      .send({ question: 'What happens in a traditional art workshop?' });

    expect(res.status).toBe(200);
    expect(res.body.answer).toContain('traditional');
    expect(res.body.answer).toContain('master');
    expect(res.body.sources.length).toBeGreaterThan(0);
  });

  it('courteously explains when information is not found in Tvarita archive', async () => {
    const res = await request(app)
      .post('/api/ai/ask')
      .send({ question: 'How do I assemble a quantum satellite orbital rocket?' });

    expect(res.status).toBe(200);
    expect(res.body.answer).toContain('not find');
    expect(res.body.answer).toContain('Tvarita knowledge archive');
    expect(res.body.found).toBe(false);
  });

  it('validates missing or empty question', async () => {
    const res = await request(app)
      .post('/api/ai/ask')
      .send({ question: '   ' });

    expect(res.status).toBe(400);
  });

  it('returns suggested questions', async () => {
    const res = await request(app).get('/api/ai/suggested-questions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions.length).toBeGreaterThan(3);
  });

  it('allows browsing knowledge archive documents', async () => {
    const res = await request(app).get('/api/ai/knowledge');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThan(5);
  });
});
