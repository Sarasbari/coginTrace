import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Sparkline from './Sparkline';
import { flagClass } from '../utils/analysisEngine';

export default function MetricCard({
    label,
    value,
    unit,
    baseline,
    delta,
    zScore,
    flag,
    sparklineData,
    index = 0,
}) {
    const deltaClass = delta > 0 ? 'negative' : delta < 0 ? 'positive' : 'neutral';
    // For speech metrics, higher pause = worse
    const isNeutralDelta = Math.abs(delta) < 3;

    let zBadgeClass = 'normal';
    if (flag?.startsWith('Significant')) zBadgeClass = 'significant';
    else if (flag?.startsWith('Mild')) zBadgeClass = 'mild';

    const sparkColor =
        zBadgeClass === 'significant'
            ? '#dc2626'
            : zBadgeClass === 'mild'
                ? '#d97706'
                : '#2563eb';

    return (
        <motion.div
            className={`metric-card ${flagClass(flag)}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
        >
            <div className="metric-label">{label}</div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span className="metric-value" aria-live="polite">
                    {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 2) : value}
                </span>
                <span className="metric-unit">{unit}</span>
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '0.5rem',
                    flexWrap: 'wrap',
                }}
            >
                {baseline !== undefined && (
                    <span
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        Baseline: {typeof baseline === 'number' ? baseline.toFixed(baseline % 1 === 0 ? 0 : 2) : baseline}
                    </span>
                )}

                {delta !== undefined && !isNeutralDelta && (
                    <span className={`metric-delta ${deltaClass}`}>
                        {delta > 0 ? (
                            <TrendingUp size={12} />
                        ) : (
                            <TrendingDown size={12} />
                        )}
                        {delta > 0 ? '+' : ''}{delta}%
                    </span>
                )}

                {isNeutralDelta && delta !== undefined && (
                    <span className="metric-delta neutral">
                        <Minus size={12} />
                        {delta}%
                    </span>
                )}
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '0.5rem',
                }}
            >
                {zScore !== undefined && (
                    <span className={`z-badge ${zBadgeClass}`}>
                        Z: {zScore > 0 ? '+' : ''}{zScore.toFixed(2)}
                    </span>
                )}
                {flag && (
                    <span className={`z-badge ${zBadgeClass}`}>
                        {flag}
                    </span>
                )}
            </div>

            {sparklineData && sparklineData.length >= 2 && (
                <Sparkline data={sparklineData} color={sparkColor} height={32} />
            )}
        </motion.div>
    );
}
