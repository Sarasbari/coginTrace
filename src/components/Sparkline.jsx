import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({ data = [], color = '#2563eb', height = 32 }) {
    if (!data || data.length < 2) return null;

    const chartData = data.map((value, index) => ({ index, value }));

    return (
        <div className="sparkline-container" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={false}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-out"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
