import { describe, it, expect } from 'vitest';
import {
  createProcedureRound,
  getCurrentProcedure,
  getCurrentStep,
  answerStep,
  nextStep
} from '../procedureSim';

const game = {
  playLength: 1,
  procedures: [
    {
      id: 'p1',
      goal: { fi: 'Nosta 40 €', en: 'Withdraw €40' },
      steps: [
        {
          id: 's1',
          screen: [{ fi: 'Valitse kieli', en: 'Choose a language' }],
          buttons: [
            { id: 'fi', label: { fi: 'Suomi', en: 'Finnish' }, key: null, correct: true },
            { id: 'sv', label: { fi: 'Svenska', en: 'Swedish' }, key: null, correct: false }
          ]
        },
        {
          id: 's2',
          screen: [
            { fi: 'Näppäile tunnusluku', en: 'Enter PIN' },
            { fi: '****', en: '****' }
          ],
          buttons: [
            { id: 'ok', label: { fi: 'OK', en: 'OK' }, key: 'ok', correct: true },
            { id: 'peruuta', label: { fi: 'Peruuta', en: 'Cancel' }, key: 'peruuta', correct: false }
          ]
        }
      ]
    },
    {
      id: 'p2',
      goal: { fi: 'Katso saldo', en: 'Check balance' },
      steps: [
        {
          id: 's1',
          screen: [{ fi: 'Valitse toiminto', en: 'Select transaction' }],
          buttons: [
            { id: 'saldo', label: { fi: 'Saldo', en: 'Balance' }, key: null, correct: true },
            { id: 'nosto', label: { fi: 'Nosto', en: 'Withdrawal' }, key: null, correct: false }
          ]
        }
      ]
    }
  ]
};

describe('procedureSim', () => {
  it('picks playLength procedures deterministically for a fixed random', () => {
    const roundA = createProcedureRound(game, () => 0);
    const roundB = createProcedureRound(game, () => 0.99);

    expect(roundA.procedures).toHaveLength(1);
    expect(roundB.procedures).toHaveLength(1);
    expect(roundA.procedures[0].id).not.toBe(roundB.procedures[0].id);
    expect(createProcedureRound(game, () => 0).procedures).toEqual(roundA.procedures);
    expect(getCurrentProcedure(roundA)).toBe(roundA.procedures[0]);
  });

  it('returns an empty round for missing data', () => {
    expect(createProcedureRound(null).procedures).toEqual([]);
    expect(getCurrentProcedure(createProcedureRound(null))).toBeNull();
    expect(getCurrentStep(createProcedureRound(null))).toBeNull();
    expect(getCurrentStep(null)).toBeNull();
    const res = answerStep(createProcedureRound(null), 'fi');
    expect(res.isCorrect).toBe(false);
    expect(res.isNewStep).toBe(false);
    expect(res.finished).toBe(false);
  });

  it('stays on the same step after a wrong answer and flags isNewStep only once per step', () => {
    // With random = () => 0.99, shuffle keeps [p1, p2] so p1 (2 steps) is chosen
    const round = createProcedureRound(game, () => 0.99);
    const step = getCurrentStep(round);
    expect(step.id).toBe('s1');

    const first = answerStep(round, 'sv');
    expect(first.isCorrect).toBe(false);
    expect(first.isNewStep).toBe(true);
    expect(first.finished).toBe(false);
    expect(first.state.solved).toBe(false);
    expect(getCurrentStep(first.state)).toBe(step);

    const second = answerStep(first.state, 'fi');
    expect(second.isCorrect).toBe(true);
    expect(second.isNewStep).toBe(false);
    expect(second.finished).toBe(false);
    expect(second.state.solved).toBe(true);
  });

  it('marks a correct first answer as solved, ignores taps once solved, advances with nextStep, and sets finished on the last step', () => {
    let state = createProcedureRound(game, () => 0.99);
    let result = answerStep(state, 'fi');
    expect(result.isCorrect).toBe(true);
    expect(result.isNewStep).toBe(true);
    expect(result.finished).toBe(false);
    expect(result.state.solved).toBe(true);

    const ignored = answerStep(result.state, 'sv');
    expect(ignored.state).toBe(result.state);
    expect(ignored.isCorrect).toBe(false);
    expect(ignored.isNewStep).toBe(false);

    state = nextStep(result.state);
    expect(state.stepIndex).toBe(1);
    expect(state.solved).toBe(false);
    expect(getCurrentStep(state).id).toBe('s2');

    result = answerStep(state, 'ok');
    expect(result.isCorrect).toBe(true);
    expect(result.isNewStep).toBe(true);
    expect(result.finished).toBe(true);
  });

  it('nextStep does nothing when the current step is not solved', () => {
    const state = createProcedureRound(game, () => 0.99);
    expect(nextStep(state)).toBe(state);
    expect(nextStep(null)).toBeNull();
  });
});
