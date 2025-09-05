import React from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, Package } from "lucide-react";

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
  selectedBucket,
}) => {
  const bucketOptions = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
  ];

  const buckets = data?.buckets || [];
  const counts = data?.counts || [];

  // Transform data for the chart
  const chartData = buckets.map((bucket, index) => ({
    bucket: bucket,
    count: counts[index] || 0,
  }));

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const minCount = counts.length > 0 ? Math.min(...counts) : 0;
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
  const padding = (maxCount - minCount) * 0.1;
  const yAxisDomain = [Math.max(0, minCount - padding), maxCount + padding];

  return (
    <div className="h-full bg-white border border-gray-200 rounded-lg">
      {/* Header - Always visible */}
      <div className="flex justify-between items-center p-2 pb-1 text-sm font-semibold ml-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-600" />
          Demand Trend
        </div>
        <div className="flex gap-2 ml-auto">
          {bucketOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onBucketChange(option.value)}
              className={`px-2 py-0.5 text-sm rounded transition-colors ${
                selectedBucket === option.value
                  ? "bg-orange-100 text-orange-800 font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body - Chart OR Empty State */}
      <div className="h-64 lg:h-72 px-2 pb-2 flex items-center justify-center">
        {buckets.length === 0 || counts.length === 0 ? (
          <div className="flex flex-col items-center text-center px-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1">
              No data available
            </h4>
            <p className="text-sm text-gray-500 max-w-xs">
              We couldn't find any data for the selected filters. Try adjusting
              your date range or criteria.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="bucket"
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={yAxisDomain}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickCount={6}
              />

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
        )}
      </div>
    </div>
  );
};

export default TrendChart;
