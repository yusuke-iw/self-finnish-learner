function shuffle(list, random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createProcedureRound(game, random = Math.random) {
  const procedures = game && Array.isArray(game.procedures) ? game.procedures : [];
  const rawLength =
    game && typeof game.playLength === 'number' && game.playLength > 0 ? game.playLength : 1;
  const length = Math.min(rawLength, procedures.length);
  const selected = shuffle(procedures, random).slice(0, length);

  return {
    procedures: selected,
    procedure: selected[0] || null,
    procedureIndex: 0,
    stepIndex: 0,
    solved: false,
    answeredStepIds: []
  };
}

export function getCurrentProcedure(state) {
  if (!state) return null;
  if (Array.isArray(state.procedures)) {
    return state.procedures[state.procedureIndex ?? 0] || null;
  }
  return state.procedure || null;
}

export function getCurrentStep(state) {
  const procedure = getCurrentProcedure(state);
  if (!procedure || !Array.isArray(procedure.steps)) return null;
  return procedure.steps[state.stepIndex] || null;
}

// Judge a tap on a procedure button. A correct answer marks the step solved;
// a wrong answer leaves the step to be retried. isNewStep is true only the first
// time the step is answered, so the caller can call recordAnswer() once per step.
export function answerStep(state, buttonId) {
  const step = getCurrentStep(state);
  if (!step || state.solved) {
    return { state, isCorrect: false, isNewStep: false, finished: false };
  }

  const buttons = Array.isArray(step.buttons) ? step.buttons : [];
  const button = buttons.find((b) => b.id === buttonId) || null;
  if (!button) {
    return { state, isCorrect: false, isNewStep: false, finished: false };
  }

  const isNewStep = !state.answeredStepIds.includes(step.id);
  const isCorrect = Boolean(button.correct);
  const nextState = {
    ...state,
    solved: isCorrect,
    answeredStepIds: isNewStep ? [...state.answeredStepIds, step.id] : state.answeredStepIds
  };

  const procedure = getCurrentProcedure(state);
  const isLastStep = state.stepIndex + 1 >= procedure.steps.length;
  const isLastProcedure = state.procedureIndex + 1 >= state.procedures.length;

  return {
    state: nextState,
    isCorrect,
    isNewStep,
    finished: isCorrect && isLastStep && isLastProcedure
  };
}

export function nextStep(state) {
  if (!state || !state.solved) return state;
  const procedure = getCurrentProcedure(state);
  if (procedure && Array.isArray(procedure.steps) && state.stepIndex + 1 < procedure.steps.length) {
    return {
      ...state,
      stepIndex: state.stepIndex + 1,
      solved: false
    };
  }
  if (Array.isArray(state.procedures) && state.procedureIndex + 1 < state.procedures.length) {
    const nextProcIndex = state.procedureIndex + 1;
    return {
      ...state,
      procedureIndex: nextProcIndex,
      procedure: state.procedures[nextProcIndex] || null,
      stepIndex: 0,
      solved: false,
      answeredStepIds: []
    };
  }
  return {
    ...state,
    stepIndex: state.stepIndex + 1,
    solved: false
  };
}
