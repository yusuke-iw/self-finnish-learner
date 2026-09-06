import { describe, it, expect } from 'vitest';
import {
  GRAMMAR_CATEGORIES,
  grammarTopics,
  getAllPracticeQuestions,
  getQuestionsByCategory,
  getQuestionsByTopic
} from '../grammarData';

describe('grammarData Comprehensive Curriculum Specification', () => {
  it('covers all major grammatical domains with at least 20 structured topics', () => {
    expect(grammarTopics.length).toBeGreaterThanOrEqual(20);
  });

  it('includes required core grammar topics across all categories', () => {
    const topicIds = grammarTopics.map((t) => t.id);

    // Cases (15 cases and plural forms)
    expect(topicIds).toContain('paikallissijat');
    expect(topicIds).toContain('partitiivi');
    expect(topicIds).toContain('genetiivi-akusatiivi');
    expect(topicIds).toContain('essiivi_translatiivi');
    expect(topicIds).toContain('abessiivi_komitatiivi_instruktiivi');
    expect(topicIds).toContain('monikon_sijamuodot');

    // Verbs (tenses, moods, voices, infinitives, participles)
    expect(topicIds).toContain('verbityypit');
    expect(topicIds).toContain('imperfekti');
    expect(topicIds).toContain('perfekti_pluskvamperfekti');
    expect(topicIds).toContain('konditionaali');
    expect(topicIds).toContain('imperatiivi');
    expect(topicIds).toContain('passiivi');
    expect(topicIds).toContain('infinitiivit');
    expect(topicIds).toContain('partisiipit');

    // Basic Grammar & Syntax
    expect(topicIds).toContain('vokaaliharmonia');
    expect(topicIds).toContain('astevaihtelu');
    expect(topicIds).toContain('omistusrakenne');
    expect(topicIds).toContain('kysymyslauseet');
    expect(topicIds).toContain('komparatiivi_superlatiivi');
    expect(topicIds).toContain('objekti_saannot');

    // Rection & Idioms
    expect(topicIds).toContain('rektiot');
    expect(topicIds).toContain('idiomit-ja-puhekieli');
  });

  it('ensures each topic has valid metadata, explanations, and at least 5 practice questions', () => {
    grammarTopics.forEach((topic) => {
      expect(topic.id).toBeDefined();
      expect(topic.title).toBeTruthy();
      expect(topic.category).toBeTruthy();
      expect(topic.level).toMatch(/^(A1|A2|B1|B2|C1)$/);
      expect(topic.summary).toBeTruthy();
      expect(topic.overview).toBeTruthy();
      expect(Array.isArray(topic.rules)).toBe(true);
      expect(topic.rules.length).toBeGreaterThanOrEqual(2);
      expect(topic.table).toBeDefined();
      expect(topic.table.headers.length).toBeGreaterThanOrEqual(2);
      expect(topic.table.rows.length).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(topic.examples)).toBe(true);
      expect(topic.examples.length).toBeGreaterThanOrEqual(2);

      // Verify practice questions: at least 5 questions per topic
      expect(Array.isArray(topic.practiceQuiz)).toBe(true);
      expect(
        topic.practiceQuiz.length,
        `Topic "${topic.id}" has ${topic.practiceQuiz.length} questions, expected at least 5`
      ).toBeGreaterThanOrEqual(5);

      // Verify each question structure
      topic.practiceQuiz.forEach((q, idx) => {
        expect(q.question, `Question text in ${topic.id} index ${idx}`).toBeTruthy();
        expect(q.answer, `Answer in ${topic.id} index ${idx}`).toBeTruthy();
        expect(q.explanation, `Explanation in ${topic.id} index ${idx}`).toBeTruthy();
        expect(['choice', 'typing', 'wordbank']).toContain(q.type);
        if (q.type === 'choice') {
          expect(Array.isArray(q.options)).toBe(true);
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(q.options).toContain(q.answer);
        }
        if (q.type === 'wordbank') {
          expect(Array.isArray(q.words)).toBe(true);
          expect(q.words).toContain(q.answer);
        }
      });
    });
  });

  it('aggregates questions properly in helper functions with over 100 total questions', () => {
    const allQuestions = getAllPracticeQuestions();
    expect(allQuestions.length).toBeGreaterThanOrEqual(100);

    const caseQuestions = getQuestionsByCategory('cases');
    expect(caseQuestions.length).toBeGreaterThanOrEqual(25);

    const verbQuestions = getQuestionsByCategory('verbs');
    expect(verbQuestions.length).toBeGreaterThanOrEqual(30);

    const singleTopic = getQuestionsByTopic('vokaaliharmonia');
    expect(singleTopic.length).toBeGreaterThanOrEqual(5);
  });
});
