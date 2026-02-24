import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Radio } from 'lucide-react';
import { useState } from 'react';
import Sparkline from './Sparkline';

export default function LiveMonitor({ metrics, isRecording }) {
    const [expanded, setExpanded] = useState(true);

    if (!isRecording && (!metrics || metrics.totalWords === 0)) return null;

    const items = [
        {
            label: 'Words / Min',
            value: metrics?.wordsPerMinute ?? 0,
            unit: 'WPM',
            color: 'var(--accent-blue)',
        },
        {
            label: 'Pause Frequency',
            value: metrics?.pauseFrequency ?? 0,
            unit: '/min',
            color:
                (metrics?.pauseFrequency ?? 0) > 5
                    ? 'var(--accent-red)'
                    : (metrics?.pauseFrequency ?? 0) > 3
                        ? 'var(--accent-yellow)'
                        : 'var(--accent-green)',
        },
        {
            label: 'Avg Pause',
            value: metrics?.avgPauseDuration ?? 0,
            unit: 'sec',
            color:
                (metrics?.avgPauseDuration ?? 0) > 1.2
                    ? 'var(--accent-red)'
                    : (metrics?.avgPauseDuration ?? 0) > 0.8
                        ? 'var(--accent-yellow)'
                        : 'var(--accent-green)',
        },
        {
            label: 'Longest Pause',
            value: metrics?.longestPause ?? 0,
            unit: 'sec',
            color:
                (metrics?.longestPause ?? 0) > 2.5
                    ? 'var(--accent-red)'
                    : (metrics?.longestPause ?? 0) > 1.5
                        ? 'var(--accent-yellow)'
                        : 'var(--accent-green)',
        },
    ];

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '900px',
                zIndex: 50,
                padding: '0 1rem 1rem',
            }}
        >
            <div
                className="card-static"
                style={{
                    borderRadius: 'var(--radius-2xl)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--clinical-border)',
                    background: 'rgba(255,255,255,0.96)',
                    backdropFilter: 'blur(16px)',
                }}
            >
                {/* Header */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.75rem 1.25rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderBottom: expanded ? '1px solid var(--clinical-border)' : 'none',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isRecording && <span className="live-dot" />}
                        <Radio size={14} style={{ color: 'var(--accent-blue)' }} />
                        <span
                            style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: 'var(--text-tertiary)',
                            }}
                        >
                            Live Signal Monitor
                        </span>
                    </div>
                    {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>

                {/* Metrics */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: '1rem',
                                    padding: '1rem 1.25rem',
                                }}
                                aria-live="polite"
                            >
                                {items.map((item, i) => (
                                    <div key={item.label} style={{ textAlign: 'center' }}>
                                        <div
                                            style={{
                                                fontSize: '0.6875rem',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                color: 'var(--text-tertiary)',
                                                marginBottom: '0.25rem',
                                            }}
                                        >
                                            {item.label}
                                        </div>
                                        <div
                                            className="font-mono"
                                            style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 700,
                                                color: item.color,
                                                lineHeight: 1.1,
                                            }}
                                        >
                                            {typeof item.value === 'number'
                                                ? item.value.toFixed(item.unit === 'WPM' ? 0 : 2)
                                                : item.value}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.6875rem',
                                                color: 'var(--text-tertiary)',
                                                marginTop: '2px',
                                            }}
                                        >
                                            {item.unit}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    padding: '0 1.25rem 0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-tertiary)',
                                }}
                            >
                                <span className="font-mono">
                                    Words: {metrics?.totalWords ?? 0}
                                </span>
                                <span className="font-mono">
                                    Pauses: {metrics?.totalPauses ?? 0}
                                </span>
                                {metrics?.elapsed !== undefined && (
                                    <span className="font-mono">
                                        Time: {Math.floor((metrics.elapsed || 0) / 60)}:{String((metrics.elapsed || 0) % 60).padStart(2, '0')}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
