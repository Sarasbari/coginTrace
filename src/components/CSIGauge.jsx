import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CSIGauge({ value = 0, size = 160 }) {
    const [displayValue, setDisplayValue] = useState(0);
    const animRef = useRef(null);

    // Animate the number counter
    useEffect(() => {
        const start = displayValue;
        const end = value;
        const duration = 1500;
        const startTime = performance.now();

        function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            setDisplayValue(current);

            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            }
        }

        animRef.current = requestAnimationFrame(animate);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [value]);

    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const fillPercent = value / 100;
    const dashOffset = circumference * (1 - fillPercent);

    // Color based on score
    let strokeColor = '#059669'; // green
    if (value < 50) strokeColor = '#dc2626'; // red
    else if (value < 80) strokeColor = '#d97706'; // yellow

    let textColor = 'var(--accent-green)';
    if (value < 50) textColor = 'var(--accent-red)';
    else if (value < 80) textColor = 'var(--accent-yellow)';

    return (
        <motion.div
            className="csi-ring"
            style={{ width: size, height: size }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <svg viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="csi-ring-bg"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                />
                <circle
                    className="csi-ring-fill"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={strokeColor}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                />
            </svg>
            <div className="csi-ring-label">
                <span
                    className="csi-ring-value font-mono"
                    style={{ color: textColor }}
                    aria-live="polite"
                >
                    {displayValue}
                </span>
                <span className="csi-ring-sublabel">CSI Score</span>
            </div>
        </motion.div>
    );
}
