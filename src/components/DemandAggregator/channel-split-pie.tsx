import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface ChannelSplitData {
  key: string;
  count: number;
}

interface ChannelSplitPieProps {
  data: ChannelSplitData[];
}

export const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#F472B6',
  '#14B8A6',
];

const ChannelSplitPie: React.FC<ChannelSplitPieProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Transform data to handle empty keys
  const transformedData = data.map((item, index) => ({
    ...item,
    displayKey: item.key && item.key.trim() !== '' ? item.key : 'Unknown',
    originalKey: item.key
  }));

  const formatLabel = (entry: any) => {
    const percentage = ((entry.count / total) * 100).toFixed(0);
    return `${percentage}%`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.count / total) * 100).toFixed(1);
      const displayKey = data.displayKey;
      
      return (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          boxShadow: '0 6px 12px -1px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          padding: '10px 14px',
          fontSize: '13px'
        }}>
          <p style={{ margin: 0, fontWeight: 600, marginBottom: '4px' }}>
            Channel: {displayKey}
          </p>
          <p style={{ margin: 0, color: '#666' }}>
            Count: {data.count}
          </p>
          <p style={{ margin: 0, color: '#666' }}>
            Percentage: {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const formatLegend = (value: string) => {
    const item = transformedData.find((d) => d.displayKey === value);
    if (item) {
      const percentage = ((item.count / total) * 100).toFixed(1);
      return `${value.charAt(0).toUpperCase() + value.slice(1)} (${percentage}%)`;
    }
    return value;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={transformedData}
            cx="50%"
            cy="50%"
            label={formatLabel}
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="count"
            nameKey="displayKey"
            paddingAngle={2}
          >
            {transformedData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={3}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChannelSplitPie;