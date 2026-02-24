/**
 * CogniTrace Local Storage Manager
 * Session CRUD, baseline management, mock data generation
 */

const SESSIONS_KEY = 'cognitrace_sessions';
const BASELINE_KEY = 'cognitrace_baseline';

// ── Session CRUD ──

export function getSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session) {
  const sessions = getSessions();
  sessions.push(session);
  // Keep last 50 sessions
  const trimmed = sessions.slice(-50);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function clearSessions() {
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(BASELINE_KEY);
}

// ── Baseline Management ──

export function getBaseline() {
  try {
    const raw = localStorage.getItem(BASELINE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setBaseline(baselineData) {
  localStorage.setItem(BASELINE_KEY, JSON.stringify(baselineData));
}

/**
 * Calculate baseline stats from an array of sessions
 */
export function calculateBaselineFromSessions(sessions) {
  if (!sessions || sessions.length === 0) return null;

  const keys = ['wordsPerMinute', 'pauseFrequency', 'avgPauseDuration', 'longestPause'];
  const means = {};
  const stds = {};

  for (const key of keys) {
    const values = sessions
      .map((s) => s[key]?.value ?? s[key])
      .filter((v) => v !== undefined && v !== null);

    if (values.length === 0) {
      means[key] = 0;
      stds[key] = 1;
      continue;
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    means[key] = Math.round(mean * 100) / 100;
    stds[key] = Math.max(std, 0.01); // Prevent division by zero
  }

  return { means, stds, sessionCount: sessions.length };
}

// ── Mock Baseline Generator ──

function gaussianRandom(mean, stdDev) {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

/**
 * Generate realistic mock sessions for first-run UX
 * Based on typical adult speech reading patterns
 */
export function generateMockBaseline() {
  const now = Date.now();
  const DAY_MS = 86400000;

  // Typical healthy adult reading aloud
  const baseMetrics = {
    wordsPerMinute: { mean: 138, std: 12 },
    pauseFrequency: { mean: 3.2, std: 0.8 },
    avgPauseDuration: { mean: 0.72, std: 0.15 },
    longestPause: { mean: 1.4, std: 0.35 },
  };

  const mockSessions = [];

  for (let i = 0; i < 5; i++) {
    const sessionTime = new Date(now - (5 - i) * DAY_MS + Math.random() * DAY_MS * 0.3);

    const rawMetrics = {};
    for (const [key, { mean, std }] of Object.entries(baseMetrics)) {
      rawMetrics[key] = Math.max(0, Math.round(gaussianRandom(mean, std) * 100) / 100);
    }

    // Slight declining trend in last 2 sessions for realistic demo
    if (i >= 3) {
      rawMetrics.pauseFrequency += 0.6;
      rawMetrics.avgPauseDuration += 0.12;
    }

    const csi = Math.round(
      Math.max(
        50,
        Math.min(
          98,
          85 +
            gaussianRandom(0, 5) -
            (i >= 3 ? 8 : 0)
        )
      )
    );

    const trends = ['stable', 'stable', 'stable', 'stable', 'declining'];

    mockSessions.push({
      sessionId: `mock_session_${i + 1}`,
      timestamp: sessionTime.toISOString(),
      wordsPerMinute: {
        value: rawMetrics.wordsPerMinute,
        baseline: baseMetrics.wordsPerMinute.mean,
        zScore: Math.round(((rawMetrics.wordsPerMinute - baseMetrics.wordsPerMinute.mean) / baseMetrics.wordsPerMinute.std) * 100) / 100,
        flag: null,
        delta: Math.round(((rawMetrics.wordsPerMinute - baseMetrics.wordsPerMinute.mean) / baseMetrics.wordsPerMinute.mean) * 100),
      },
      pauseFrequency: {
        value: rawMetrics.pauseFrequency,
        baseline: baseMetrics.pauseFrequency.mean,
        zScore: Math.round(((rawMetrics.pauseFrequency - baseMetrics.pauseFrequency.mean) / baseMetrics.pauseFrequency.std) * 100) / 100,
        flag: i >= 4 ? 'Mild deviation' : null,
        delta: Math.round(((rawMetrics.pauseFrequency - baseMetrics.pauseFrequency.mean) / baseMetrics.pauseFrequency.mean) * 100),
      },
      avgPauseDuration: {
        value: rawMetrics.avgPauseDuration,
        baseline: baseMetrics.avgPauseDuration.mean,
        zScore: Math.round(((rawMetrics.avgPauseDuration - baseMetrics.avgPauseDuration.mean) / baseMetrics.avgPauseDuration.std) * 100) / 100,
        flag: null,
        delta: Math.round(((rawMetrics.avgPauseDuration - baseMetrics.avgPauseDuration.mean) / baseMetrics.avgPauseDuration.mean) * 100),
      },
      longestPause: {
        value: rawMetrics.longestPause,
        baseline: baseMetrics.longestPause.mean,
        zScore: Math.round(((rawMetrics.longestPause - baseMetrics.longestPause.mean) / baseMetrics.longestPause.std) * 100) / 100,
        flag: null,
        delta: Math.round(((rawMetrics.longestPause - baseMetrics.longestPause.mean) / baseMetrics.longestPause.mean) * 100),
      },
      csi,
      trend: trends[i],
      duration: Math.round(45 + Math.random() * 20),
      totalWords: Math.round(90 + Math.random() * 30),
      totalPauses: Math.round(4 + Math.random() * 5),
    });
  }

  // Save mock sessions
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(mockSessions));

  // Calculate and save baseline from these
  const baseline = {
    means: {
      wordsPerMinute: baseMetrics.wordsPerMinute.mean,
      pauseFrequency: baseMetrics.pauseFrequency.mean,
      avgPauseDuration: baseMetrics.avgPauseDuration.mean,
      longestPause: baseMetrics.longestPause.mean,
    },
    stds: {
      wordsPerMinute: baseMetrics.wordsPerMinute.std,
      pauseFrequency: baseMetrics.pauseFrequency.std,
      avgPauseDuration: baseMetrics.avgPauseDuration.std,
      longestPause: baseMetrics.longestPause.std,
    },
    sessionCount: 5,
  };
  setBaseline(baseline);

  return { sessions: mockSessions, baseline };
}

/**
 * Initialize storage — generate mock data if empty
 */
export function initializeStorage() {
  const sessions = getSessions();
  const baseline = getBaseline();

  if (sessions.length === 0 || !baseline) {
    return generateMockBaseline();
  }

  return { sessions, baseline };
}
