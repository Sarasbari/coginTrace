import { Github, Shield } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer">
            <div
                style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1.5rem',
                }}
            >
                <div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '0.5rem',
                        }}
                    >
                        <Shield size={16} style={{ color: 'var(--navy-400)' }} />
                        <span
                            style={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: 'var(--navy-200)',
                            }}
                        >
                            CogniTrace
                        </span>
                    </div>
                    <p
                        style={{
                            fontSize: '0.75rem',
                            color: 'var(--navy-400)',
                            maxWidth: '400px',
                            lineHeight: 1.6,
                        }}
                    >
                        This tool is for personal awareness and educational purposes only. It
                        does not provide medical diagnosis, treatment advice, or clinical
                        assessments. Consult a healthcare professional for any health concerns.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <span className="live-dot" />
                        <span
                            className="font-mono"
                            style={{
                                fontSize: '0.6875rem',
                                color: 'var(--navy-400)',
                                letterSpacing: '0.04em',
                            }}
                        >
                            System Operational
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.75rem',
                            }}
                        >
                            <Github size={14} />
                            GitHub
                        </a>
                        <span
                            style={{
                                fontSize: '0.6875rem',
                                color: 'var(--navy-400)',
                                padding: '3px 10px',
                                border: '1px solid var(--navy-700)',
                                borderRadius: 'var(--radius-sm)',
                            }}
                        >
                            Healthcare Track
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
