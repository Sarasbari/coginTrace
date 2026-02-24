import { motion } from 'framer-motion';
import {
    Brain,
    Mic,
    BarChart3,
    Shield,
    ArrowRight,
    Activity,
} from 'lucide-react';
import { getSessions } from '../utils/storage';
import CSIGauge from './CSIGauge';

export default function HomePage({ onStartSession, onViewDashboard }) {
    const sessions = getSessions();
    const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

    return (
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '3rem 1.5rem' }}>
            {/* Hero */}
            <motion.div
                style={{ textAlign: 'center', marginBottom: '3rem' }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 16px',
                        borderRadius: '999px',
                        background: 'var(--accent-blue-pale)',
                        color: 'var(--accent-blue)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        marginBottom: '1.5rem',
                    }}
                >
                    <Activity size={14} />
                    Cognitive Signal Monitoring
                </div>

                <h1
                    style={{
                        fontSize: '2.75rem',
                        fontWeight: 800,
                        lineHeight: 1.15,
                        marginBottom: '1rem',
                        color: 'var(--navy-900)',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Track Your Cognitive
                    <br />
                    <span style={{ color: 'var(--accent-blue)' }}>Speech Patterns</span>
                </h1>

                <p
                    style={{
                        fontSize: '1.125rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '540px',
                        margin: '0 auto 2rem',
                        lineHeight: 1.7,
                    }}
                >
                    CogniTrace captures non-invasive speech behavioral signals — pauses,
                    pacing, and rhythm — to help you monitor cognitive patterns over time.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <motion.button
                        className="btn btn-primary btn-lg"
                        onClick={onStartSession}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Mic size={20} />
                        Start Cognitive Session
                        <ArrowRight size={18} />
                    </motion.button>

                    {lastSession && (
                        <motion.button
                            className="btn btn-secondary btn-lg"
                            onClick={onViewDashboard}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <BarChart3 size={18} />
                            View Dashboard
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Features */}
            <motion.div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginBottom: '2.5rem',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                {[
                    {
                        icon: Mic,
                        title: 'Speech Analysis',
                        desc: 'Read a passage aloud while we capture pause patterns and speaking rhythm.',
                    },
                    {
                        icon: Brain,
                        title: 'Deviation Detection',
                        desc: 'Z-score analysis compares your metrics to your personal baseline.',
                    },
                    {
                        icon: BarChart3,
                        title: 'Clinical Dashboard',
                        desc: 'Precision metrics with sparklines, trends, and plain-English insights.',
                    },
                ].map(({ icon: Icon, title, desc }, i) => (
                    <motion.div
                        key={title}
                        className="card"
                        style={{ textAlign: 'center', padding: '1.5rem 1.25rem' }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                    >
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--accent-blue-pale)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 0.75rem',
                            }}
                        >
                            <Icon size={22} style={{ color: 'var(--accent-blue)' }} />
                        </div>
                        <h3
                            style={{
                                fontSize: '0.9375rem',
                                fontWeight: 600,
                                marginBottom: '0.5rem',
                            }}
                        >
                            {title}
                        </h3>
                        <p
                            style={{
                                fontSize: '0.8125rem',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.6,
                            }}
                        >
                            {desc}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Last Session Summary */}
            {lastSession && (
                <motion.div
                    className="card-static"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2rem',
                        padding: '1.5rem 2rem',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                    }}
                    onClick={onViewDashboard}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ y: -2, boxShadow: 'var(--shadow-lift)' }}
                >
                    <CSIGauge value={lastSession.csi} size={90} />
                    <div>
                        <div className="metric-label" style={{ marginBottom: '0.25rem' }}>
                            Last Session
                        </div>
                        <div
                            style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '0.25rem',
                            }}
                        >
                            {new Date(lastSession.timestamp).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                        <div
                            className="font-mono"
                            style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}
                        >
                            {lastSession.totalWords} words · {lastSession.totalPauses} pauses · CSI: {lastSession.csi}
                        </div>
                    </div>
                    <ArrowRight
                        size={20}
                        style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }}
                    />
                </motion.div>
            )}

            {/* Disclaimer */}
            <motion.div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '1rem 1.25rem',
                    background: 'var(--navy-50)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--clinical-border)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <Shield
                    size={16}
                    style={{ color: 'var(--text-tertiary)', marginTop: '2px', flexShrink: 0 }}
                />
                <p
                    style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        lineHeight: 1.6,
                    }}
                >
                    CogniTrace is for personal awareness only. It does not provide medical
                    diagnosis or clinical assessment. All data is stored locally on your
                    device. Consult a healthcare professional for any concerns.
                </p>
            </motion.div>
        </div>
    );
}
