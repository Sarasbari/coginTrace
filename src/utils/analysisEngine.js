/**
 * CogniTrace Analysis Engine
 * Z-score deviation detection, CSI composite scoring, trend analysis
 */

export function calculateZScore(value, mean, stdDev) {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export function flagLevel(zScore) {
  const abs = Math.abs(zScore);
  if (abs > 2.5) return 'Significant deviation';
  if (abs > 1.5) return 'Mild deviation';
  return null;
}

export function flagClass(flag) {
  if (!flag) return '';
  if (flag.startsWith('Significant')) return 'flag-significant';
  if (flag.startsWith('Mild')) return 'flag-mild';
  return '';
}

/**
 * Calculate Cognitive Signal Index (0-100)
 * Higher CSI = closer to baseline (healthy)
 * Weighted: pauseFrequency and avgPauseDuration weighted heavier for speech analysis
 */
export function calculateCSI(metrics) {
  const weights = {
    wordsPerMinute: 0.2,
    pauseFrequency: 0.3,
    avgPauseDuration: 0.3,
    longestPause: 0.2,
  };

  let weightedZSum = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    if (metrics[key] && metrics[key].zScore !== undefined) {
      weightedZSum += Math.abs(metrics[key].zScore) * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 85;

  const avgZ = weightedZSum / totalWeight;
  // Map Z-score to 0-100: Z=0 → 100, Z=3 → 0
  const csi = Math.max(0, Math.min(100, Math.round(100 - (avgZ / 3) * 100)));
  return csi;
}

/**
 * Detect trend from last N sessions
 */
export function detectTrend(sessions, n = 3) {
  if (!sessions || sessions.length < 2) return 'stable';

  const recent = sessions.slice(-Math.min(n, sessions.length));
  const csiValues = recent.map((s) => s.csi);

  if (csiValues.length < 2) return 'stable';

  const diffs = [];
  for (let i = 1; i < csiValues.length; i++) {
    diffs.push(csiValues[i] - csiValues[i - 1]);
  }

  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

  if (avgDiff > 3) return 'improving';
  if (avgDiff < -3) return 'declining';
  return 'stable';
}

/**
 * Build full session result from raw speech metrics + baseline
 */
export function buildSessionResult(rawMetrics, baseline) {
  const sessionId = `session_${Date.now()}`;
  const timestamp = new Date().toISOString();

  const metricKeys = ['wordsPerMinute', 'pauseFrequency', 'avgPauseDuration', 'longestPause'];

  const metrics = {};
  for (const key of metricKeys) {
    const value = rawMetrics[key] || 0;
    const baselineMean = baseline?.means?.[key] ?? value;
    const baselineStd = baseline?.stds?.[key] ?? 1;
    const zScore = calculateZScore(value, baselineMean, baselineStd);
    const flag = flagLevel(zScore);
    const delta = baselineMean !== 0 ? ((value - baselineMean) / baselineMean) * 100 : 0;

    metrics[key] = {
      value: Math.round(value * 100) / 100,
      baseline: Math.round(baselineMean * 100) / 100,
      zScore: Math.round(zScore * 100) / 100,
      flag,
      delta: Math.round(delta),
    };
  }

  const csi = calculateCSI(metrics);

  return {
    sessionId,
    timestamp,
    ...metrics,
    csi,
    trend: 'stable', // Will be recalculated with session history
    duration: rawMetrics.duration || 0,
    totalWords: rawMetrics.totalWords || 0,
    totalPauses: rawMetrics.totalPauses || 0,
  };
}

/**
 * Generate plain-English insights from session result
 */
export function generateInsights(session) {
  const insights = [];

  if (session.pauseFrequency?.flag) {
    const pct = Math.abs(session.pauseFrequency.delta);
    const dir = session.pauseFrequency.delta > 0 ? 'higher' : 'lower';
    insights.push(
      `Your speech pauses were ${pct}% ${dir} than your baseline today.`
    );
  } else {
    insights.push('Speech pause frequency was within normal range.');
  }

  if (session.avgPauseDuration?.flag) {
    const pct = Math.abs(session.avgPauseDuration.delta);
    const dir = session.avgPauseDuration.delta > 0 ? 'longer' : 'shorter';
    insights.push(
      `Average pause duration was ${pct}% ${dir} than your baseline.`
    );
  } else {
    insights.push('Average pause duration was within normal range.');
  }

  if (session.wordsPerMinute?.flag) {
    const pct = Math.abs(session.wordsPerMinute.delta);
    const dir = session.wordsPerMinute.delta > 0 ? 'faster' : 'slower';
    insights.push(`Your speaking pace was ${pct}% ${dir} than usual.`);
  } else {
    insights.push('Speaking pace was consistent with your baseline.');
  }

  if (session.longestPause?.flag) {
    insights.push(
      `Your longest pause (${session.longestPause.value}s) exceeded your typical maximum.`
    );
  }

  // CSI summary
  if (session.csi >= 85) {
    insights.push('Overall cognitive signals appear strong and consistent.');
  } else if (session.csi >= 60) {
    insights.push(
      'Some minor variations detected — continue monitoring over time.'
    );
  } else {
    insights.push(
      'Notable variations detected in this session. Continued tracking recommended.'
    );
  }

  return insights;
}

/**
 * Get metric display config
 */
export const METRIC_CONFIG = {
  wordsPerMinute: {
    label: 'Words Per Minute',
    unit: 'WPM',
    description: 'Speaking rate measured in words per minute',
    higherIsBetter: null, // neutral - both extremes are flags
  },
  pauseFrequency: {
    label: 'Pause Frequency',
    unit: 'per min',
    description: 'Number of pauses longer than 500ms per minute of speech',
    higherIsBetter: false,
  },
  avgPauseDuration: {
    label: 'Avg Pause Duration',
    unit: 'sec',
    description: 'Average length of detected speech pauses',
    higherIsBetter: false,
  },
  longestPause: {
    label: 'Longest Pause',
    unit: 'sec',
    description: 'Duration of the longest pause in this session',
    higherIsBetter: false,
  },
};
