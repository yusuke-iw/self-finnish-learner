// Decides which questions to build for one sentence and returns them grouped
// by level. Math.random() is called in the same order as before the split
// (level 1, then level 2, then level 3).
const {
  buildSpokenChoice,
  buildSpeaking,
  buildTyping,
  buildMatching,
  buildChoice,
  buildWordBank,
  buildFillInTheBlank
} = require('./builders');

// options: { exerciseType, requestedLevel, lang, category, distractorPool, extraDistractors }
function buildQuestionsForSentence(sentence, options) {
  const { exerciseType, requestedLevel } = options;
  const level1 = [];
  const level2 = [];
  const level3 = [];

  if (exerciseType === 'spoken') {
    level2.push(buildSpokenChoice(sentence, options));
    return { level1, level2, level3 };
  }
  if (exerciseType === 'speaking') {
    level3.push(buildSpeaking(sentence));
    return { level1, level2, level3 };
  }
  if (exerciseType === 'dictation') {
    level3.push(buildTyping(sentence, options, { listening: true }));
    return { level1, level2, level3 };
  }

  // Level 1: Choice Question or Matching Pairs
  if ((!exerciseType && (!requestedLevel || requestedLevel === 1)) || exerciseType === 'matching') {
    const isMatching = exerciseType === 'matching' ? true : Math.random() > 0.5;
    level1.push(isMatching ? buildMatching(sentence, options) : buildChoice(sentence, options));
  }

  // Level 2: Word Bank Question
  if ((!exerciseType && (!requestedLevel || requestedLevel === 2)) || exerciseType === 'word-bank') {
    level2.push(buildWordBank(sentence, options));
  }

  // Level 3: Fill in the blank (33%), Speaking (33%) or Typing (33%)
  if (!exerciseType && (!requestedLevel || requestedLevel === 3)) {
    const rand = Math.random();
    if (rand > 0.66) {
      level3.push(buildFillInTheBlank(sentence, options));
    } else if (rand > 0.33) {
      level3.push(buildSpeaking(sentence));
    } else {
      level3.push(buildTyping(sentence, options));
    }
  }

  return { level1, level2, level3 };
}

// Builds the question list for the selected sentences: all level 1, then
// level 2, then level 3.
function buildQuestions(sentences, options) {
  const level1 = [];
  const level2 = [];
  const level3 = [];
  sentences.forEach((sentence) => {
    const built = buildQuestionsForSentence(sentence, options);
    level1.push(...built.level1);
    level2.push(...built.level2);
    level3.push(...built.level3);
  });
  return [...level1, ...level2, ...level3];
}

module.exports = { buildQuestionsForSentence, buildQuestions };
