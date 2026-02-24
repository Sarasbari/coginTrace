import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Clock } from 'lucide-react';
import CSIGauge from './CSIGauge';
import MetricCard from './MetricCard';
import SessionHistory from './SessionHistory';
import InsightCallout from './InsightCallout';
import { METRIC_CONFIG, generateInsights, detectTrend } from '../utils/analysisEngine';
import { getSessions } from '../utils/storage';

function TrendArrow({ trend }) {
    if (trend === 'improving')
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--accent-green)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                }}
            >
                <TrendingUp size={16} /> Improving
            </span>
        );
    if (trend === 'declining')
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--accent-red)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                }}
            >
                <TrendingDown size={16} /> Declining
            </span>
        );
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--text-tertiary)',
                fontWeight: 600,
                fontSize: '0.875rem',
            }}
        >
            <Minus size={16} /> Stable
        </span>
    );
}

export default function Dashboard({ latestSession, showHistoryOnly = false }) {
    const sessions = useMemo(() => getSessions(), [latestSession]);

    const session = latestSession || sessions[sessions.length - 1];

    if (!session) {
        return (
            <div
                style={{
                    maxWidth: '1100px',
                    margin: '2rem auto',
                    padding: '0 1.5rem',
                    textAlign: 'center',
                }}
            >
                <div className="card-static" style={{ padding: '4rem 2rem' }}>
                    <h2 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                        No Session Data
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Complete a speech cognitive task to see your analysis dashboard.
                    </p>
                </div>
            </div>
        );
    }

    const trend = detectTrend(sessions);
    const insights = generateInsights(session);

    // Build sparkline data for each metric
    const metricKeys = ['wordsPerMinute', 'pauseFrequency', 'avgPauseDuration', 'longestPause'];
    const sparklineData = {};
    for (const key of metricKeys) {
        sparklineData[key] = sessions.slice(-7).map((s) => s[key]?.value ?? 0);
    }

    const sessionDate = new Date(session.timestamp);

    if (showHistoryOnly) {
        return (
            <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        Session History
                    </h1>
                    <div className="card-static">
                        <SessionHistory sessions={sessions} />
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' }}>
            {/* Top Strip: CSI + Session Info */}
            <motion.div
                className="card-static"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2.5rem',
                    marginBottom: '1.5rem',
                    padding: '2rem',
                    flexWrap: 'wrap',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                <CSIGauge value={session.csi} />

                <div style={{ flex: 1, minWidth: '200px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Cognitive Signal Dashboard
                    </h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            <Calendar size={14} />
                            {sessionDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            <Clock size={14} />
                            {sessionDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    </div>

                    <TrendArrow trend={trend} />

                    {session.duration > 0 && (
                        <div
                            className="font-mono"
                            style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-tertiary)',
                                marginTop: '0.5rem',
                            }}
                        >
                            Duration: {Math.floor(session.duration / 60)}m {session.duration % 60}s · {session.totalWords} words · {session.totalPauses} pauses
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Metric Grid */}
            <div className="metric-grid" style={{ marginBottom: '1.5rem' }}>
                {metricKeys.map((key, i) => {
                    const config = METRIC_CONFIG[key];
                    const metric = session[key];
                    if (!metric) return null;

                    return (
                        <MetricCard
                            key={key}
                            label={config.label}
                            value={metric.value}
                            unit={config.unit}
                            baseline={metric.baseline}
                            delta={metric.delta}
                            zScore={metric.zScore}
                            flag={metric.flag}
                            sparklineData={sparklineData[key]}
                            index={i}
                        />
                    );
                })}
            </div>

            {/* Insights */}
            <div style={{ marginBottom: '1.5rem' }}>
                <InsightCallout insights={insights} />
            </div>

            {/* Session History */}
            <motion.div
                className="card-static"
                style={{ marginBottom: '2rem' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2
                    style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <span className="live-dot" style={{ background: 'var(--accent-blue)' }} />
                    Recent Sessions
                </h2>
                <SessionHistory sessions={sessions} />
            </motion.div>
        </div>
    );
}
