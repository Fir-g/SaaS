import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface TrendData {
  buckets: string[];
  counts: number[];
}

interface TrendChartProps {
  data: TrendData;
  onBucketChange: (bucket: string) => void;
  selectedBucket: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  onBucketChange, 
  selectedBucket 
}) => {
  const bucketOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' }
  ];

  // Transform data for the chart
  const chartData = data.buckets.map((bucket, index) => ({
    bucket: bucket,
    count: data.counts[index]
  }));

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short'
    });
  };

  // Calculate min and max for better Y-axis scaling
  const counts = data.counts;
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const padding = (maxCount - minCount) * 0.1;
  const yAxisDomain = [
    Math.max(0, minCount - padding),
    maxCount + padding
  ];

  return (
            <div className="h-full bg-white border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center p-2 pb-2 text-sm font-semibold ml-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Demand Trend
            </div>
            <div className="flex gap-2 ml-auto"> 
              {bucketOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onBucketChange(option.value)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    selectedBucket === option.value
                      ? 'bg-orange-100 text-orange-800 font-medium'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
      
      <div className="h-80 px-2 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            {/* Grid lines - very subtle */}
            <defs>
              <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
                <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
              {/* Gradient for area fill */}
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#fb923c" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="bucket" 
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={yAxisDomain}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickCount={6}
            />
            
            {/* Subtle grid */}
            <defs>
              <pattern id="horizontalGrid" width="100%" height="20" patternUnits="userSpaceOnUse">
                <line x1="0" y1="20" x2="100%" y2="20" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            
            {/* Area with gradient fill */}
            <Area
              type="linear"
              dataKey="count"
              stroke="#ea580c"
              strokeWidth={2.5}
              fill="url(#areaGradient)"
              fillOpacity={1}
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;