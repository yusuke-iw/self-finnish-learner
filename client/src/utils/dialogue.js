export function startDialogue(game, random = Math.random) {
  const dialogues = game && Array.isArray(game.dialogues) ? game.dialogues : [];
  if (dialogues.length === 0) return null;

  const index = Math.floor(random() * dialogues.length);
  const dialogue = dialogues[index];
  if (!dialogue || !dialogue.startNodeId) return null;

  return {
    dialogue,
    nodeId: dialogue.startNodeId,
    visited: [dialogue.startNodeId],
    answeredNodeIds: [],
    resolvedChoiceId: null,
    repeatCount: 0
  };
}

export function getCurrentNode(state) {
  if (!state || !state.dialogue || !Array.isArray(state.dialogue.nodes)) return null;
  return state.dialogue.nodes.find((n) => n.id === state.nodeId) || null;
}

export function getNodeCount(state) {
  if (!state || !state.dialogue || !Array.isArray(state.dialogue.nodes)) return 0;
  return state.dialogue.nodes.length;
}

export function answerDialogue(state, choiceId) {
  const node = getCurrentNode(state);
  if (!node || state.resolvedChoiceId) {
    return { state, quality: null, choice: null, advanced: false, finished: false, isNewNode: false };
  }

  const choice = Array.isArray(node.choices)
    ? node.choices.find((c) => c.id === choiceId) || null
    : null;
  if (!choice) {
    return { state, quality: null, choice: null, advanced: false, finished: false, isNewNode: false };
  }

  const isNewNode = !state.answeredNodeIds.includes(node.id);

  if (choice.quality === 'good' || choice.quality === 'ok') {
    const finished =
      choice.next === null ||
      choice.next === undefined ||
      !state.dialogue.nodes.some((n) => n.id === choice.next);

    const nextState = {
      ...state,
      resolvedChoiceId: choice.id,
      answeredNodeIds: isNewNode ? [...state.answeredNodeIds, node.id] : state.answeredNodeIds
    };

    return {
      state: nextState,
      quality: choice.quality,
      choice,
      advanced: true,
      finished,
      isNewNode
    };
  }

  if (choice.quality === 'bad') {
    const nextState = {
      ...state,
      answeredNodeIds: isNewNode ? [...state.answeredNodeIds, node.id] : state.answeredNodeIds
    };

    return {
      state: nextState,
      quality: choice.quality,
      choice,
      advanced: false,
      finished: false,
      isNewNode
    };
  }

  if (choice.quality === 'repeat') {
    const nextState = {
      ...state,
      repeatCount: state.repeatCount + 1
    };

    return {
      state: nextState,
      quality: choice.quality,
      choice,
      advanced: false,
      finished: false,
      isNewNode: false
    };
  }

  return { state, quality: null, choice, advanced: false, finished: false, isNewNode: false };
}

export function nextDialogueNode(state) {
  if (!state || !state.resolvedChoiceId) return state;

  const node = getCurrentNode(state);
  if (!node) return state;

  const choice = Array.isArray(node.choices)
    ? node.choices.find((c) => c.id === state.resolvedChoiceId)
    : null;
  if (!choice || !choice.next) return state;

  const nextNode = state.dialogue.nodes.find((n) => n.id === choice.next);
  if (!nextNode) return state;

  return {
    ...state,
    nodeId: nextNode.id,
    visited: [...state.visited, nextNode.id],
    resolvedChoiceId: null,
    repeatCount: 0
  };
}
