jest.mock('../../models/Sentence');
jest.mock('../../models/ReadingPassage');
jest.mock('../../models/Progress');
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  connection: { readyState: 1 }
}));

const mongoose = require('mongoose');
const Sentence = require('../../models/Sentence');
const ReadingPassage = require('../../models/ReadingPassage');
const Progress = require('../../models/Progress');
const { sentences, passages } = require('../../config/seedData');
const { isDbConnected, currentSource } = require('../connection');
const sentencesData = require('../sentencesData');
const passagesData = require('../passagesData');
const progressData = require('../progressData');

const exec = (value) => ({ exec: jest.fn().mockResolvedValue(value) });
const execReject = (err) => ({ exec: jest.fn().mockRejectedValue(err) });

beforeEach(() => {
  jest.resetAllMocks();
  mongoose.connection.readyState = 1;
});

describe('connection', () => {
  it('reports connected only when readyState is 1', () => {
    expect(isDbConnected()).toBe(true);
    expect(currentSource()).toBe('database');
    for (const state of [0, 2, 3]) {
      mongoose.connection.readyState = state;
      expect(isDbConnected()).toBe(false);
      expect(currentSource()).toBe('memory');
    }
  });
});

describe('sentencesData', () => {
  const dbRows = [{ _id: 'a', text: 'A' }];

  describe('listSentences', () => {
    it('returns DB rows when connected', async () => {
      Sentence.find.mockReturnValue(exec(dbRows));
      expect(await sentencesData.listSentences()).toEqual({ data: dbRows, source: 'database' });
    });
    it('falls back to seed data when the DB is empty', async () => {
      Sentence.find.mockReturnValue(exec([]));
      expect(await sentencesData.listSentences()).toEqual({ data: sentences, source: 'memory' });
    });
    it('falls back to seed data on DB errors', async () => {
      Sentence.find.mockReturnValue(execReject(new Error('boom')));
      expect(await sentencesData.listSentences()).toEqual({ data: sentences, source: 'memory' });
    });
    it('does not query when disconnected', async () => {
      mongoose.connection.readyState = 0;
      expect(await sentencesData.listSentences()).toEqual({ data: sentences, source: 'memory' });
      expect(Sentence.find).not.toHaveBeenCalled();
    });
  });

  describe('findSentenceById', () => {
    it('uses the DB when connected', async () => {
      Sentence.findById.mockReturnValue(exec(dbRows[0]));
      expect(await sentencesData.findSentenceById('a')).toBe(dbRows[0]);
      expect(Sentence.findById).toHaveBeenCalledWith('a');
    });
    it('propagates DB errors', async () => {
      Sentence.findById.mockReturnValue(execReject(new Error('boom')));
      await expect(sentencesData.findSentenceById('a')).rejects.toThrow('boom');
    });
    it('uses seed data when disconnected, and returns null for unknown ids', async () => {
      mongoose.connection.readyState = 0;
      const first = sentences[0];
      expect(await sentencesData.findSentenceById(String(first._id))).toBe(first);
      expect(await sentencesData.findSentenceById('does-not-exist')).toBeNull();
      expect(Sentence.findById).not.toHaveBeenCalled();
    });
  });

  describe('findSessionSentences', () => {
    it('filters seed data by category and ids when disconnected', async () => {
      mongoose.connection.readyState = 0;
      const category = sentences[0].category;
      const inCategory = sentences.filter(s => s.category === category);
      const all = await sentencesData.findSessionSentences({ category });
      expect(all.availableSentences).toEqual(inCategory);
      expect(all.distractorPool).toEqual(inCategory);

      const id = String(inCategory[0]._id);
      const some = await sentencesData.findSessionSentences({ category, sentenceIds: [id] });
      expect(some.availableSentences).toEqual([inCategory[0]]);
      expect(some.distractorPool).toEqual(inCategory);
      expect(Sentence.find).not.toHaveBeenCalled();
    });
    it('uses all seed data without a category', async () => {
      mongoose.connection.readyState = 0;
      const result = await sentencesData.findSessionSentences();
      expect(result.availableSentences).toBe(sentences);
    });
    it('queries once when no ids are given', async () => {
      Sentence.find.mockReturnValue(exec(dbRows));
      const result = await sentencesData.findSessionSentences({ category: 'c' });
      expect(Sentence.find).toHaveBeenCalledTimes(1);
      expect(Sentence.find).toHaveBeenCalledWith({ category: 'c' });
      expect(result.availableSentences).toBe(result.distractorPool);
    });
    it('queries the ids and the whole category separately when ids are given', async () => {
      Sentence.find.mockReturnValueOnce(exec([dbRows[0]])).mockReturnValueOnce(exec(['x', 'y']));
      const result = await sentencesData.findSessionSentences({ category: 'c', sentenceIds: ['a'] });
      expect(Sentence.find).toHaveBeenNthCalledWith(1, { category: 'c', _id: { $in: ['a'] } });
      expect(Sentence.find).toHaveBeenNthCalledWith(2, { category: 'c' });
      expect(result).toEqual({ availableSentences: [dbRows[0]], distractorPool: ['x', 'y'] });
    });
    it('propagates DB errors', async () => {
      Sentence.find.mockReturnValue(execReject(new Error('boom')));
      await expect(sentencesData.findSessionSentences({})).rejects.toThrow('boom');
    });
  });

  describe('findAllSentences', () => {
    it('reads the DB when connected and seed data when not', async () => {
      Sentence.find.mockReturnValue(exec(dbRows));
      expect(await sentencesData.findAllSentences()).toBe(dbRows);
      expect(Sentence.find).toHaveBeenCalledWith({});
      mongoose.connection.readyState = 0;
      expect(await sentencesData.findAllSentences()).toBe(sentences);
    });
  });
});

describe('passagesData', () => {
  const listKeys = ['_id', 'category', 'difficulty', 'title', 'translation'];

  describe('listPassages', () => {
    it('returns DB rows (title fields only) when connected', async () => {
      const rows = [{ _id: 'p' }];
      const select = jest.fn().mockReturnValue(exec(rows));
      ReadingPassage.find.mockReturnValue({ select });
      expect(await passagesData.listPassages()).toEqual({ data: rows, source: 'database' });
      expect(select).toHaveBeenCalledWith('title translation category difficulty');
    });
    it('falls back to a body-less seed list when the DB is empty or fails', async () => {
      ReadingPassage.find.mockReturnValue({ select: () => exec([]) });
      const empty = await passagesData.listPassages();
      expect(empty.source).toBe('memory');
      expect(empty.data).toHaveLength(passages.length);
      expect(Object.keys(empty.data[0]).sort()).toEqual(listKeys);

      ReadingPassage.find.mockReturnValue({ select: () => execReject(new Error('boom')) });
      expect((await passagesData.listPassages()).source).toBe('memory');
    });
    it('does not query when disconnected', async () => {
      mongoose.connection.readyState = 0;
      expect((await passagesData.listPassages()).source).toBe('memory');
      expect(ReadingPassage.find).not.toHaveBeenCalled();
    });
  });

  describe('findPassageById', () => {
    it('returns the DB passage when found', async () => {
      const row = { _id: 'p' };
      ReadingPassage.findById.mockReturnValue(exec(row));
      expect(await passagesData.findPassageById('p')).toEqual({ data: row, source: 'database' });
    });
    it('falls back to seed data when not in the DB or on errors', async () => {
      const id = passages[0]._id;
      ReadingPassage.findById.mockReturnValue(exec(null));
      expect(await passagesData.findPassageById(id)).toEqual({ data: passages[0], source: 'memory' });
      ReadingPassage.findById.mockReturnValue(execReject(new Error('boom')));
      expect(await passagesData.findPassageById(id)).toEqual({ data: passages[0], source: 'memory' });
    });
    it('uses seed data without querying when disconnected', async () => {
      mongoose.connection.readyState = 0;
      expect((await passagesData.findPassageById(passages[0]._id)).source).toBe('memory');
      expect(ReadingPassage.findById).not.toHaveBeenCalled();
    });
    it('returns null for unknown ids', async () => {
      mongoose.connection.readyState = 0;
      expect(await passagesData.findPassageById('nope')).toBeNull();
    });
  });
});

describe('progressData', () => {
  const lean = (value) => ({ lean: jest.fn().mockResolvedValue(value) });

  it('getDefaultProgress has the full shape', () => {
    const p = progressData.getDefaultProgress('u1');
    expect(p).toMatchObject({ userId: 'u1', mistakes: [], settings: { language: 'ja' } });
    expect(progressData.getDefaultProgress().userId).toBe('default_user');
  });

  describe('when connected', () => {
    it('returns the default for a user with no record', async () => {
      Progress.findOne.mockReturnValue(lean(null));
      const { data, source } = await progressData.getProgress('u1');
      expect(source).toBe('database');
      expect(data.userId).toBe('u1');
    });
    it('turns Map fields into plain objects', async () => {
      Progress.findOne.mockReturnValue(lean({
        userId: 'u1',
        learningPath: new Map([['a', 1]]),
        passagesProgress: new Map([['b', 2]]),
        passageAnswers: { c: 3 }
      }));
      const { data } = await progressData.getProgress('u1');
      expect(data.learningPath).toEqual({ a: 1 });
      expect(data.passagesProgress).toEqual({ b: 2 });
      expect(data.passageAnswers).toEqual({ c: 3 });
    });
    it('upserts on save', async () => {
      Progress.findOneAndUpdate.mockReturnValue(lean({ userId: 'u1' }));
      const update = { userId: 'u1', mistakes: [] };
      expect(await progressData.saveProgress('u1', update)).toEqual({ data: { userId: 'u1' }, source: 'database' });
      expect(Progress.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'u1' }, { $set: update }, { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    });
  });

  describe('when disconnected', () => {
    beforeEach(() => { mongoose.connection.readyState = 0; });

    it('serves defaults, then merges saves in memory', async () => {
      const first = await progressData.getProgress('mem-user');
      expect(first.source).toBe('memory');
      await progressData.saveProgress('mem-user', { userId: 'mem-user', learningPath: { a: 1 }, settings: { x: 1 } });
      const saved = await progressData.saveProgress('mem-user', { userId: 'mem-user', learningPath: { b: 2 } });
      expect(saved.source).toBe('memory');
      expect(saved.data.learningPath).toEqual({ a: 1, b: 2 });
      expect(saved.data.settings).toEqual({ language: 'ja', x: 1 });
      expect((await progressData.getProgress('mem-user')).data.learningPath).toEqual({ a: 1, b: 2 });
      expect(Progress.findOne).not.toHaveBeenCalled();
      expect(Progress.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });
});
