import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InsightCallout({ insights = [] }) {
    return (
        <motion.div
            className="insight-callout"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '0.75rem',
                }}
            >
                <AlertTriangle size={16} style={{ color: 'var(--accent-blue)' }} />
                <span
                    style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-tertiary)',
                    }}
                >
                    Session Insights
                </span>
            </div>

            {insights.map((insight, i) => (
                <p key={i} aria-live="polite">
                    {insight}
                </p>
            ))}

            <p className="disclaimer">
                ⚠️ This tool is for personal awareness only and does not constitute a
                medical diagnosis. Consult a healthcare professional for any concerns.
            </p>
        </motion.div>
    );
}
