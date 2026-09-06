const request = require('supertest');
const express = require('express');
const Progress = require('../../models/Progress');
const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connection: { readyState: 1 }
  };
});

const progressRoute = require('../progress');

const app = express();
app.use(express.json());
app.use('/api/progress', progressRoute);

describe('Progress Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mongoose.connection.readyState = 1;
  });

  it('GET /api/progress should return progress data', async () => {
    jest.spyOn(Progress, 'findOne').mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        userId: 'default_user',
        learningPath: { 'Ruoka ja Juoma': 2 }
      })
    });

    const res = await request(app).get('/api/progress');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.learningPath['Ruoka ja Juoma']).toBe(2);
  });

  it('POST /api/progress should save and return updated progress', async () => {
    const payload = {
      userId: 'default_user',
      learningPath: { 'Ruoka ja Juoma': 3 }
    };

    jest.spyOn(Progress, 'findOneAndUpdate').mockReturnValue({
      lean: jest.fn().mockResolvedValue(payload)
    });

    const res = await request(app)
      .post('/api/progress')
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.learningPath['Ruoka ja Juoma']).toBe(3);
  });
});
