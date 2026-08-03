import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DonutData {
    name: string;
    value: number;
}

interface CategoryDonutChartProps {
    data: DonutData[];
    variant?: 'sideLegend' | 'bottomLegend';
}

const COLORS = [
    '#4f46e5',
    '#6366f1',
    '#3b82f6',
    '#60a5fa',
    '#93c5fd',
    '#bfdbfe',
];

export default function CategoryDonutChart({ data, variant = 'sideLegend' }: CategoryDonutChartProps) {
    const isBottomLegend = variant === 'bottomLegend';

    return (
        <div className={`donut-chart-wrapper${isBottomLegend ? ' donut-chart-wrapper--bottom' : ''}`}>
            <div className={`donut-chart-left${isBottomLegend ? ' donut-chart-left--bottom' : ''}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={isBottomLegend ? '60%' : 28}
                            outerRadius={isBottomLegend ? '95%' : 50}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', fontSize: 12, padding: 8 }}
                            formatter={(value) => `${Number(value).toLocaleString()}원`}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className={`donut-legend-right${isBottomLegend ? ' donut-legend-right--bottom' : ''}`}>
                {data.map((item, index) => (
                    <div key={index} className="legend-item">

                    <span
                        className="legend-color-dot"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />

                    <span className="legend-text">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}