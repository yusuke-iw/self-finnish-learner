export const STUDY_STATS_STORAGE_KEY = 'finnishLearnerStudyStats';
export const DEFAULT_DAILY_GOAL = 20;
export const VALID_DAILY_GOALS = [10, 20, 30];

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function toDate(value = new Date()) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function formatLocalDateKey(now = new Date()) {
  const d = toDate(now);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDailyGoal(goal) {
  if (goal === null || goal === undefined || goal === '' || typeof goal === 'boolean') {
    return DEFAULT_DAILY_GOAL;
  }
  const num = Number(goal);
  return VALID_DAILY_GOALS.includes(num) ? num : DEFAULT_DAILY_GOAL;
}

function normalizeDays(days) {
  if (!days || typeof days !== 'object' || Array.isArray(days)) {
    return {};
  }
  const normalized = {};
  for (const [key, val] of Object.entries(days)) {
    if (DATE_KEY_REGEX.test(key) && typeof val === 'number' && Number.isFinite(val) && val >= 0) {
      normalized[key] = Math.floor(val);
    }
  }
  return normalized;
}

export function getStudyStats() {
  try {
    const saved = localStorage.getItem(STUDY_STATS_STORAGE_KEY);
    if (!saved) {
      return { days: {}, dailyGoal: DEFAULT_DAILY_GOAL };
    }
    const parsed = JSON.parse(saved);
    return {
      days: normalizeDays(parsed?.days),
      dailyGoal: normalizeDailyGoal(parsed?.dailyGoal)
    };
  } catch {
    return { days: {}, dailyGoal: DEFAULT_DAILY_GOAL };
  }
}

export function saveStudyStats(stats) {
  const normalized = {
    days: normalizeDays(stats?.days),
    dailyGoal: normalizeDailyGoal(stats?.dailyGoal)
  };
  try {
    localStorage.setItem(STUDY_STATS_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // ignore storage errors
  }
  return normalized;
}

export function recordAnswer(now = new Date()) {
  const stats = getStudyStats();
  const todayKey = formatLocalDateKey(now);
  const nextCount = (stats.days[todayKey] || 0) + 1;
  const updated = {
    ...stats,
    days: {
      ...stats.days,
      [todayKey]: nextCount
    }
  };
  return saveStudyStats(updated);
}

export function getTodayCount(now = new Date()) {
  const stats = getStudyStats();
  const todayKey = formatLocalDateKey(now);
  return stats.days[todayKey] || 0;
}

export function getDailyGoal() {
  return getStudyStats().dailyGoal;
}

export function setDailyGoal(n) {
  const stats = getStudyStats();
  const updated = {
    ...stats,
    dailyGoal: normalizeDailyGoal(n)
  };
  return saveStudyStats(updated);
}

export function getStreak(now = new Date()) {
  const { days } = getStudyStats();
  const d = toDate(now);
  const cursor = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayKey = formatLocalDateKey(cursor);

  let streak = 0;
  if ((days[todayKey] || 0) >= 1) {
    streak += 1;
  }

  cursor.setDate(cursor.getDate() - 1);
  while ((days[formatLocalDateKey(cursor)] || 0) >= 1) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function mergeStudyStats(a, b) {
  const daysA = normalizeDays(a?.days);
  const daysB = normalizeDays(b?.days);
  const mergedDays = { ...daysA };

  for (const [dateKey, count] of Object.entries(daysB)) {
    mergedDays[dateKey] = Math.max(mergedDays[dateKey] || 0, count);
  }

  const hasLocalGoal =
    b &&
    typeof b === 'object' &&
    b.dailyGoal !== null &&
    b.dailyGoal !== undefined &&
    b.dailyGoal !== '' &&
    typeof b.dailyGoal !== 'boolean' &&
    VALID_DAILY_GOALS.includes(Number(b.dailyGoal));
  const hasServerGoal =
    a &&
    typeof a === 'object' &&
    a.dailyGoal !== null &&
    a.dailyGoal !== undefined &&
    a.dailyGoal !== '' &&
    typeof a.dailyGoal !== 'boolean' &&
    VALID_DAILY_GOALS.includes(Number(a.dailyGoal));

  const dailyGoal = hasLocalGoal
    ? Number(b.dailyGoal)
    : hasServerGoal
      ? Number(a.dailyGoal)
      : DEFAULT_DAILY_GOAL;

  return {
    days: mergedDays,
    dailyGoal
  };
}
