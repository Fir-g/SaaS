import React from 'react';
import { TrendingUp, Package, MapPin, Truck, Users, BarChart3 } from 'lucide-react';

interface SplitBarChartProps {
  title: string;
  data: Array<{ key: string; count: number }>;
  total: number;
  isLoading?: boolean;
}

const SplitBarChart: React.FC<SplitBarChartProps> = ({ 
  title, 
  data, 
  total, 
  isLoading = false 
}) => {
  // Get icon and colors based on title
  const getChartConfig = () => {
    switch (title.toLowerCase()) {
      case 'origin split':
        return {
          icon: <MapPin className="w-4 h-4 text-emerald-600" />,
          gradient: 'from-emerald-500 to-emerald-600',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200'
        };
      case 'destination split':
        return {
          icon: <Package className="w-4 h-4 text-purple-600" />,
          gradient: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200'
        };
      case 'vehicle split':
        return {
          icon: <Truck className="w-4 h-4 text-orange-600" />,
          gradient: 'from-orange-500 to-orange-600',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      case 'customer split':
        return {
          icon: <Users className="w-4 h-4 text-indigo-600" />,
          gradient: 'from-indigo-500 to-indigo-600',
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-700',
          borderColor: 'border-indigo-200'
        };
      default:
        return {
          icon: <BarChart3 className="w-4 h-4 text-blue-600" />,
          gradient: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
    }
  };

  const config = getChartConfig();

  // Transform and limit data to top 10 items
  const chartData = data
    .slice(0, 10)
    .map(item => ({
      name: item.key || 'Unknown',
      value: item.count,
      percentage: total > 0 ? ((item.count / total) * 100) : 0
    }))
    .sort((a, b) => b.value - a.value); // Sort by value descending

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(item => item.value)) : 0;

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 ${config.bgColor} rounded-xl ${config.borderColor} border`}>
            {config.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Top 10 entries</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 ${config.bgColor} rounded-full border ${config.borderColor}`}>
          <span className={`text-sm font-bold ${config.textColor}`}>
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-80">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
              <div className={`animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600 absolute top-0 left-0`}></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">Loading analytics...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="space-y-4">
            {chartData.map((item, index) => (
              <div key={`${item.name}-${index}`} className="group">
                <div className="flex items-center gap-3 h-10">
                  {/* Label */}
                  <div className="min-w-0 w-48 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700 truncate block" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                  
                  {/* Horizontal Bar */}
                  <div className="relative flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full bg-gradient-to-r ${config.gradient} rounded-lg transition-all duration-700 ease-out group-hover:opacity-90`}
                      style={{ 
                        width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                        minWidth: item.value > 0 ? '2%' : '0%'
                      }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Values */}
                  <div className="flex items-center gap-3 flex-shrink-0 w-28 justify-end">
                    <span className="text-sm font-semibold text-gray-900">
                      {item.value.toLocaleString()}
                    </span>
                    <span className={`text-xs font-medium ${config.textColor}`}>
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No data available</h4>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              We couldn't find any data for the selected filters. Try adjusting your date range or criteria.
            </p>
            
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {/* {chartData.length > 0 && (
        <div className={`mt-6 pt-4 border-t border-gray-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${config.textColor}`} />
              <span className={`text-sm font-medium text-gray-600`}>
                Showing top {Math.min(10, chartData.length)} results
              </span>
            </div>
            <div className={`px-3 py-1.5 ${config.bgColor} rounded-full border ${config.borderColor}`}>
              <span className={`text-sm font-bold ${config.textColor}`}>
                {total.toLocaleString()} total
              </span>
            </div>
          </div>
        </div>
      )} */}

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 opacity-5">
        <div className={`w-32 h-32 bg-gradient-to-br ${config.gradient} rounded-full blur-3xl`}></div>
      </div>
    </div>
  );
};

export default SplitBarChart;