import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BarData {
    name: string;
    amount: number;
}

interface MainBarChartProps {
    data: BarData[];
}

export default function MainBarChart({ data }: MainBarChartProps) {
    return (
        <div style={{ width: `100%`, height: 166 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>

                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
                    <YAxis hide />

                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', width: 120, fontSize: 12, paddingBottom: 4}} 
                        formatter={(value) => [`${Number(value).toLocaleString()}원`, '지출']}
                        cursor={{ fill: '#f3f4f6' }}
                    />

                    <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}