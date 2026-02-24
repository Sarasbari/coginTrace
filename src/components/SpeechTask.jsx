import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square, ArrowRight, AlertCircle } from 'lucide-react';
import { createSpeechCapture, isSpeechSupported, READING_PASSAGES } from '../utils/speechCapture';
import { buildSessionResult, detectTrend } from '../utils/analysisEngine';
import { getBaseline, saveSession, getSessions, calculateBaselineFromSessions, setBaseline } from '../utils/storage';
import LiveMonitor from './LiveMonitor';

export default function SpeechTask({ onComplete }) {
    const [phase, setPhase] = useState('ready'); // ready | recording | processing | done
    const [passage] = useState(() => READING_PASSAGES[Math.floor(Math.random() * READING_PASSAGES.length)]);
    const [transcript, setTranscript] = useState({ final: '', interim: '', full: '' });
    const [liveMetrics, setLiveMetrics] = useState(null);
    const [error, setError] = useState(null);
    const captureRef = useRef(null);
    const metricsIntervalRef = useRef(null);

    const supported = isSpeechSupported();

    const handleStart = useCallback(() => {
        setError(null);
        setTranscript({ final: '', interim: '', full: '' });
        setLiveMetrics(null);

        const capture = createSpeechCapture({
            onTranscript: (t) => setTranscript(t),
            onMetricsUpdate: (m) => setLiveMetrics(m),
            onError: (e) => {
                if (e !== 'no-speech') {
                    setError(`Speech recognition error: ${e}. Please try again in Chrome.`);
                }
            },
        });

        captureRef.current = capture;
        capture.start();
        setPhase('recording');

        // Update metrics periodically even during silence
        metricsIntervalRef.current = setInterval(() => {
            if (captureRef.current) {
                setLiveMetrics(captureRef.current.getLiveMetrics());
            }
        }, 1000);
    }, []);

    const handleStop = useCallback(() => {
        if (metricsIntervalRef.current) {
            clearInterval(metricsIntervalRef.current);
        }

        if (!captureRef.current) return;

        captureRef.current.stop();
        setPhase('processing');

        // Small delay for final processing
        setTimeout(() => {
            const rawMetrics = captureRef.current.getMetrics();
            let baseline = getBaseline();

            // If no baseline, use this session to start building one
            if (!baseline) {
                baseline = {
                    means: {
                        wordsPerMinute: rawMetrics.wordsPerMinute,
                        pauseFrequency: rawMetrics.pauseFrequency,
                        avgPauseDuration: rawMetrics.avgPauseDuration,
                        longestPause: rawMetrics.longestPause,
                    },
                    stds: {
                        wordsPerMinute: 12,
                        pauseFrequency: 0.8,
                        avgPauseDuration: 0.15,
                        longestPause: 0.35,
                    },
                    sessionCount: 1,
                };
                setBaseline(baseline);
            }

            const sessionResult = buildSessionResult(rawMetrics, baseline);

            // Calculate trend from history
            const allSessions = getSessions();
            sessionResult.trend = detectTrend([...allSessions, sessionResult]);

            // Save session
            const updatedSessions = saveSession(sessionResult);

            // Update baseline if we have enough sessions
            if (updatedSessions.length >= 3) {
                const newBaseline = calculateBaselineFromSessions(
                    updatedSessions.map((s) => ({
                        wordsPerMinute: s.wordsPerMinute?.value ?? s.wordsPerMinute,
                        pauseFrequency: s.pauseFrequency?.value ?? s.pauseFrequency,
                        avgPauseDuration: s.avgPauseDuration?.value ?? s.avgPauseDuration,
                        longestPause: s.longestPause?.value ?? s.longestPause,
                    }))
                );
                if (newBaseline) setBaseline(newBaseline);
            }

            setPhase('done');
            if (onComplete) onComplete(sessionResult);
        }, 800);
    }, [onComplete]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
            if (captureRef.current) {
                try { captureRef.current.stop(); } catch { }
            }
        };
    }, []);

    if (!supported) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    maxWidth: '680px',
                    margin: '2rem auto',
                    padding: '0 1.5rem',
                    textAlign: 'center',
                }}
            >
                <div className="card-static" style={{ padding: '3rem 2rem' }}>
                    <AlertCircle size={48} style={{ color: 'var(--accent-yellow)', marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '0.75rem' }}>Speech Recognition Not Supported</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                        Your browser doesn't support the Web Speech API. Please open this app in
                        <strong> Google Chrome</strong> for full functionality.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <div style={{ maxWidth: '780px', margin: '2rem auto', padding: '0 1.5rem', paddingBottom: '10rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                {/* Header */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Speech Cognitive Task
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                        Read the passage below aloud at your natural pace. We'll analyze your speech patterns.
                    </p>
                </div>

                {/* Passage Card */}
                <motion.div
                    className="card-static"
                    style={{ marginBottom: '1.5rem' }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1rem',
                        }}
                    >
                        <span className="metric-label" style={{ marginBottom: 0 }}>
                            Reading Passage — "{passage.title}"
                        </span>
                        <span
                            className="font-mono"
                            style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}
                        >
                            {passage.wordCount} words
                        </span>
                    </div>
                    <div className="passage-text">{passage.text}</div>
                </motion.div>

                {/* Recording Status */}
                <AnimatePresence>
                    {phase === 'recording' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ marginBottom: '1.5rem' }}
                        >
                            <div className="recording-bar">
                                <span className="live-dot" />
                                <span>Recording behavioral signals...</span>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '3px' }}>
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <span key={i} className="waveform-bar" />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Transcript */}
                <AnimatePresence>
                    {(phase === 'recording' || phase === 'processing' || phase === 'done') && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{ marginBottom: '1.5rem' }}
                        >
                            <span className="metric-label">Live Transcript</span>
                            <div className="transcript-area" aria-live="polite">
                                {transcript.full || (
                                    <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                                        Start speaking to see your transcript...
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error */}
                {error && (
                    <div
                        style={{
                            padding: '0.75rem 1rem',
                            background: 'var(--accent-red-pale)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--accent-red)',
                            fontSize: '0.875rem',
                            marginBottom: '1.5rem',
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    {phase === 'ready' && (
                        <motion.button
                            className="btn btn-primary btn-lg"
                            onClick={handleStart}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Mic size={20} />
                            Start Recording
                        </motion.button>
                    )}

                    {phase === 'recording' && (
                        <motion.button
                            className="btn btn-lg"
                            onClick={handleStop}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                background: 'var(--accent-red)',
                                color: 'white',
                                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                            }}
                        >
                            <Square size={18} />
                            Stop Recording
                        </motion.button>
                    )}

                    {phase === 'processing' && (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    border: '3px solid var(--clinical-border)',
                                    borderTopColor: 'var(--accent-blue)',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                    margin: '0 auto 0.75rem',
                                }}
                            />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            Analyzing behavioral signals...
                        </div>
                    )}

                    {phase === 'done' && (
                        <motion.button
                            className="btn btn-primary btn-lg"
                            onClick={() => onComplete && onComplete(null)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            View Results
                            <ArrowRight size={18} />
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Live Monitor Drawer */}
            <AnimatePresence>
                {(phase === 'recording') && (
                    <LiveMonitor metrics={liveMetrics} isRecording={phase === 'recording'} />
                )}
            </AnimatePresence>
        </div>
    );
}
