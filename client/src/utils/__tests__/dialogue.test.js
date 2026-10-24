import { describe, it, expect } from 'vitest';
import {
  startDialogue,
  getCurrentNode,
  getNodeCount,
  answerDialogue,
  nextDialogueNode
} from '../dialogue';

describe('dialogue utility functions', () => {
  const sampleGame = {
    id: 'test-game',
    dialogues: [
      {
        id: 'd1',
        startNodeId: 'n1',
        nodes: [
          {
            id: 'n1',
            speaker: 'matti',
            line: { fi: 'Hei!', spoken: 'Moi!' },
            choices: [
              { id: 'c1-good', quality: 'good', next: 'n2', text: { fi: 'Päivää.' } },
              { id: 'c1-bad', quality: 'bad', text: { fi: 'Näkemiin.' } },
              { id: 'c1-repeat', quality: 'repeat', text: { fi: 'Mitä?' } }
            ]
          },
          {
            id: 'n2',
            speaker: 'matti',
            line: { fi: 'Mitä kuuluu?', spoken: 'Mitä kuuluu?' },
            choices: [
              { id: 'c2-good', quality: 'good', next: 'n3', text: { fi: 'Hyvää.' } },
              { id: 'c2-ok', quality: 'ok', next: 'n3', text: { fi: 'Ihan ok.' } }
            ]
          },
          {
            id: 'n3',
            speaker: 'matti',
            line: { fi: 'Mukavaa päivää!', spoken: 'Mukavaa päivää!' },
            choices: [
              { id: 'c3-good', quality: 'good', next: null, text: { fi: 'Kiitos, samoin!' } }
            ]
          }
        ]
      },
      {
        id: 'd2',
        startNodeId: 'n1',
        nodes: [
          {
            id: 'n1',
            speaker: 'matti',
            line: { fi: 'Moi!', spoken: 'Moi!' },
            choices: [{ id: 'c1', quality: 'good', next: null, text: { fi: 'Moi!' } }]
          }
        ]
      }
    ]
  };

  describe('startDialogue', () => {
    it('returns null if game has no dialogues', () => {
      expect(startDialogue(null)).toBeNull();
      expect(startDialogue({})).toBeNull();
      expect(startDialogue({ dialogues: [] })).toBeNull();
    });

    it('picks dialogue using random function and starts at startNodeId', () => {
      const state1 = startDialogue(sampleGame, () => 0);
      expect(state1.dialogue.id).toBe('d1');
      expect(state1.nodeId).toBe('n1');
      expect(state1.visited).toEqual(['n1']);
      expect(state1.answeredNodeIds).toEqual([]);
      expect(state1.resolvedChoiceId).toBeNull();
      expect(state1.repeatCount).toBe(0);

      const state2 = startDialogue(sampleGame, () => 0.99);
      expect(state2.dialogue.id).toBe('d2');
    });
  });

  describe('getCurrentNode & getNodeCount', () => {
    it('returns current node based on nodeId', () => {
      const state = startDialogue(sampleGame, () => 0);
      const node = getCurrentNode(state);
      expect(node).toBeDefined();
      expect(node.id).toBe('n1');

      expect(getCurrentNode(null)).toBeNull();
      expect(getCurrentNode({ dialogue: { nodes: [] }, nodeId: 'nonexistent' })).toBeNull();
    });

    it('returns total count of nodes in current dialogue', () => {
      const state = startDialogue(sampleGame, () => 0);
      expect(getNodeCount(state)).toBe(3);
      expect(getNodeCount(null)).toBe(0);
    });
  });

  describe('answerDialogue', () => {
    it('returns unchanged state if choice does not exist or node is invalid', () => {
      const state = startDialogue(sampleGame, () => 0);
      const res = answerDialogue(state, 'unknown-choice');
      expect(res.state).toBe(state);
      expect(res.quality).toBeNull();
      expect(res.choice).toBeNull();
      expect(res.advanced).toBe(false);
      expect(res.finished).toBe(false);
      expect(res.isNewNode).toBe(false);
    });

    it('handles good choice: advances, marks node as answered, sets resolvedChoiceId', () => {
      const state = startDialogue(sampleGame, () => 0);
      const res = answerDialogue(state, 'c1-good');

      expect(res.quality).toBe('good');
      expect(res.choice.id).toBe('c1-good');
      expect(res.advanced).toBe(true);
      expect(res.finished).toBe(false);
      expect(res.isNewNode).toBe(true);
      expect(res.state.resolvedChoiceId).toBe('c1-good');
      expect(res.state.answeredNodeIds).toEqual(['n1']);
    });

    it('handles ok choice: advances, marks node as answered, sets resolvedChoiceId', () => {
      let state = startDialogue(sampleGame, () => 0);
      state = answerDialogue(state, 'c1-good').state;
      state = nextDialogueNode(state);

      const res = answerDialogue(state, 'c2-ok');
      expect(res.quality).toBe('ok');
      expect(res.choice.id).toBe('c2-ok');
      expect(res.advanced).toBe(true);
      expect(res.finished).toBe(false);
      expect(res.isNewNode).toBe(true);
      expect(res.state.resolvedChoiceId).toBe('c2-ok');
      expect(res.state.answeredNodeIds).toEqual(['n1', 'n2']);
    });

    it('ignores any choices once resolvedChoiceId is set for current node', () => {
      const state = startDialogue(sampleGame, () => 0);
      const first = answerDialogue(state, 'c1-good');
      const second = answerDialogue(first.state, 'c1-bad');

      expect(second.state).toBe(first.state);
      expect(second.quality).toBeNull();
      expect(second.advanced).toBe(false);
    });

    it('handles bad choice: does not advance, adds to answeredNodeIds (isNewNode true), resolvedChoiceId remains null', () => {
      const state = startDialogue(sampleGame, () => 0);
      const res = answerDialogue(state, 'c1-bad');

      expect(res.quality).toBe('bad');
      expect(res.advanced).toBe(false);
      expect(res.finished).toBe(false);
      expect(res.isNewNode).toBe(true);
      expect(res.state.resolvedChoiceId).toBeNull();
      expect(res.state.answeredNodeIds).toEqual(['n1']);
    });

    it('counts only first answer per node: bad followed by good has isNewNode false for the good choice', () => {
      const state = startDialogue(sampleGame, () => 0);
      const badRes = answerDialogue(state, 'c1-bad');
      expect(badRes.isNewNode).toBe(true);

      const goodRes = answerDialogue(badRes.state, 'c1-good');
      expect(goodRes.quality).toBe('good');
      expect(goodRes.isNewNode).toBe(false);
      expect(goodRes.state.answeredNodeIds).toEqual(['n1']);
      expect(goodRes.state.resolvedChoiceId).toBe('c1-good');
    });

    it('handles repeat choice: increments repeatCount, does not mark answered (isNewNode false)', () => {
      const state = startDialogue(sampleGame, () => 0);
      const res = answerDialogue(state, 'c1-repeat');

      expect(res.quality).toBe('repeat');
      expect(res.advanced).toBe(false);
      expect(res.finished).toBe(false);
      expect(res.isNewNode).toBe(false);
      expect(res.state.repeatCount).toBe(1);
      expect(res.state.answeredNodeIds).toEqual([]);
      expect(res.state.resolvedChoiceId).toBeNull();

      // repeat followed by good counts as new node
      const goodRes = answerDialogue(res.state, 'c1-good');
      expect(goodRes.isNewNode).toBe(true);
      expect(goodRes.state.answeredNodeIds).toEqual(['n1']);
    });

    it('sets finished: true when choice.next is null or points to nonexistent node', () => {
      let state = startDialogue(sampleGame, () => 0);
      state = answerDialogue(state, 'c1-good').state;
      state = nextDialogueNode(state);
      state = answerDialogue(state, 'c2-good').state;
      state = nextDialogueNode(state);

      const res = answerDialogue(state, 'c3-good');
      expect(res.quality).toBe('good');
      expect(res.advanced).toBe(true);
      expect(res.finished).toBe(true);
    });
  });

  describe('nextDialogueNode', () => {
    it('returns unchanged state if not resolved or next node does not exist', () => {
      const state = startDialogue(sampleGame, () => 0);
      expect(nextDialogueNode(state)).toBe(state);
      expect(nextDialogueNode(null)).toBeNull();

      // finished node with next: null
      let finalState = answerDialogue(state, 'c1-good').state;
      finalState = nextDialogueNode(finalState);
      finalState = answerDialogue(finalState, 'c2-good').state;
      finalState = nextDialogueNode(finalState);
      finalState = answerDialogue(finalState, 'c3-good').state;

      expect(nextDialogueNode(finalState)).toBe(finalState);
    });

    it('advances to next node, appends to visited, resets resolvedChoiceId and repeatCount', () => {
      const state = startDialogue(sampleGame, () => 0);
      const repeated = answerDialogue(state, 'c1-repeat').state;
      const resolved = answerDialogue(repeated, 'c1-good').state;

      const nextState = nextDialogueNode(resolved);
      expect(nextState.nodeId).toBe('n2');
      expect(nextState.visited).toEqual(['n1', 'n2']);
      expect(nextState.resolvedChoiceId).toBeNull();
      expect(nextState.repeatCount).toBe(0);
    });
  });

  describe('full dialogue playthrough', () => {
    it('can step through the entire dialogue to completion', () => {
      let state = startDialogue(sampleGame, () => 0);
      expect(state.nodeId).toBe('n1');

      // n1: repeat -> bad -> good
      let ans = answerDialogue(state, 'c1-repeat');
      expect(ans.isNewNode).toBe(false);
      state = ans.state;

      ans = answerDialogue(state, 'c1-bad');
      expect(ans.isNewNode).toBe(true);
      state = ans.state;

      ans = answerDialogue(state, 'c1-good');
      expect(ans.isNewNode).toBe(false);
      expect(ans.advanced).toBe(true);
      expect(ans.finished).toBe(false);
      state = nextDialogueNode(ans.state);

      // n2: ok
      expect(state.nodeId).toBe('n2');
      ans = answerDialogue(state, 'c2-ok');
      expect(ans.isNewNode).toBe(true);
      expect(ans.advanced).toBe(true);
      expect(ans.finished).toBe(false);
      state = nextDialogueNode(ans.state);

      // n3: good (finish)
      expect(state.nodeId).toBe('n3');
      ans = answerDialogue(state, 'c3-good');
      expect(ans.isNewNode).toBe(true);
      expect(ans.advanced).toBe(true);
      expect(ans.finished).toBe(true);

      expect(ans.state.visited).toEqual(['n1', 'n2', 'n3']);
      expect(ans.state.answeredNodeIds).toEqual(['n1', 'n2', 'n3']);
    });
  });
});
