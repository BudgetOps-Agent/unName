import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BarData {
    month: string;
    amount: number;
}

interface MainBarChartProps {
    data: BarData[];
}

export default function MainBarChart({ data }: MainBarChartProps) {
    // recharts는 막대가 아니라 X축 구간 전체를 hover 영역으로 잡아서, 막대 옆 빈 공간에서도 툴팁이 뜬다.
    // shared={false}로 판정 기준을 막대(item)로 바꿀 수는 있지만 그러면 label("8월")이 사라진다
    // (item 모드에선 label이 undefined라 recharts가 라벨 줄 자체를 렌더하지 않음).
    // 그래서 axis 모드를 유지한 채 Tooltip의 active만 직접 제어한다 — recharts는 active가 넘어오면
    // 내부 판정 대신 그 값을 쓰고(activeFromProps ?? isActive), 내용·위치는 그대로 계산해준다
    const [isBarHovered, setIsBarHovered] = useState(false);

    return (
        <div style={{ width: `100%`, height: 166 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>

                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
                    <YAxis hide />

                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', width: 120, fontSize: 12, paddingBottom: 4}}
                        formatter={(value) => [`${Number(value).toLocaleString()}원`, '지출']}
                        cursor={false}
                        active={isBarHovered}
                    />

                    <Bar
                        dataKey="amount"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                        barSize={20}
                        onMouseEnter={() => setIsBarHovered(true)}
                        onMouseLeave={() => setIsBarHovered(false)}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}