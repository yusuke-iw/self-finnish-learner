export const PASS_THRESHOLD = 0.8;

export function isSessionPassed(score, total) {
  if (!score || !total || total <= 0) {
    return false;
  }
  const correctCount = (score.correct || 0) + (score.typo || 0);
  return correctCount / total >= PASS_THRESHOLD;
}
