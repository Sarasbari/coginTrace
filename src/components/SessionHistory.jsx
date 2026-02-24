import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function TrendIcon({ trend }) {
    if (trend === 'improving') return <TrendingUp size={14} style={{ color: 'var(--accent-green)' }} />;
    if (trend === 'declining') return <TrendingDown size={14} style={{ color: 'var(--accent-red)' }} />;
    return <Minus size={14} style={{ color: 'var(--text-tertiary)' }} />;
}

function TrendLabel({ trend }) {
    const color =
        trend === 'improving'
            ? 'var(--accent-green)'
            : trend === 'declining'
                ? 'var(--accent-red)'
                : 'var(--text-tertiary)';
    return (
        <span style={{ color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendIcon trend={trend} />
            {trend ? trend.charAt(0).toUpperCase() + trend.slice(1) : 'Stable'}
        </span>
    );
}

function csiColor(csi) {
    if (csi >= 80) return 'cell-green';
    if (csi >= 50) return 'cell-yellow';
    return 'cell-red';
}

export default function SessionHistory({ sessions = [] }) {
    const [sortKey, setSortKey] = useState('timestamp');
    const [sortDir, setSortDir] = useState('desc');

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const getValue = (session, key) => {
        if (key === 'timestamp') return new Date(session.timestamp).getTime();
        if (key === 'csi') return session.csi;
        if (key === 'pauseFrequency') return session.pauseFrequency?.value ?? 0;
        if (key === 'avgPauseDuration') return session.avgPauseDuration?.value ?? 0;
        if (key === 'wordsPerMinute') return session.wordsPerMinute?.value ?? 0;
        return 0;
    };

    const sorted = [...sessions]
        .sort((a, b) => {
            const aVal = getValue(a, sortKey);
            const bVal = getValue(b, sortKey);
            return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        })
        .slice(0, 10);

    const columns = [
        { key: 'timestamp', label: 'Date' },
        { key: 'csi', label: 'CSI Score' },
        { key: 'pauseFrequency', label: 'Pause Freq' },
        { key: 'avgPauseDuration', label: 'Avg Pause' },
        { key: 'wordsPerMinute', label: 'WPM' },
        { key: 'trend', label: 'Trend' },
    ];

    if (sorted.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                No sessions recorded yet. Complete a speech task to begin tracking.
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflowX: 'auto' }}
        >
            <table className="session-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} onClick={() => col.key !== 'trend' && handleSort(col.key)}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {col.label}
                                    {col.key !== 'trend' && <ArrowUpDown size={12} />}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((session, i) => (
                        <tr key={session.sessionId || i}>
                            <td style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem' }}>
                                {new Date(session.timestamp).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </td>
                            <td className={csiColor(session.csi)}>
                                {session.csi}
                            </td>
                            <td className={session.pauseFrequency?.flag ? 'cell-yellow' : ''}>
                                {session.pauseFrequency?.value?.toFixed(1) ?? '—'}
                                <span style={{ color: 'var(--text-tertiary)', marginLeft: '2px', fontSize: '0.7rem' }}>/min</span>
                            </td>
                            <td className={session.avgPauseDuration?.flag ? 'cell-yellow' : ''}>
                                {session.avgPauseDuration?.value?.toFixed(2) ?? '—'}
                                <span style={{ color: 'var(--text-tertiary)', marginLeft: '2px', fontSize: '0.7rem' }}>s</span>
                            </td>
                            <td>
                                {session.wordsPerMinute?.value ?? '—'}
                                <span style={{ color: 'var(--text-tertiary)', marginLeft: '2px', fontSize: '0.7rem' }}>wpm</span>
                            </td>
                            <td>
                                <TrendLabel trend={session.trend} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
    );
}
