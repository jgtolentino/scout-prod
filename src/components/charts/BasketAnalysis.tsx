// Market Basket Analysis Component
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { ShoppingCart, Package, TrendingUp, Users } from 'lucide-react';

interface BasketItem {
  product1: string;
  product2?: string;
  support: number;
  confidence: number;
  lift: number;
  frequency: number;
  category?: string;
}

interface BasketAnalysisProps {
  data: BasketItem[];
  height?: number;
  title?: string;
  className?: string;
}

export const BasketAnalysis: React.FC<BasketAnalysisProps> = ({
  data,
  height = 400,
  title = "Market Basket Analysis",
  className = ""
}) => {
  // Process data for different views
  const processedData = React.useMemo(() => {
    // Top associations (rules with product2)
    const associations = data
      .filter(item => item.product2)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    // Most frequent individual items
    const individualItems = data
      .filter(item => !item.product2)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 8);

    // Category analysis
    const categoryMap = new Map<string, { count: number; totalConfidence: number; totalLift: number }>();
    
    data.forEach(item => {
      if (item.category) {
        const existing = categoryMap.get(item.category) || { count: 0, totalConfidence: 0, totalLift: 0 };
        existing.count += 1;
        existing.totalConfidence += item.confidence;
        existing.totalLift += item.lift;
        categoryMap.set(item.category, existing);
      }
    });

    const categoryAnalysis = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      avgConfidence: stats.totalConfidence / stats.count,
      avgLift: stats.totalLift / stats.count,
      ruleCount: stats.count
    }));

    return { associations, individualItems, categoryAnalysis };
  }, [data]);

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {data.product2 && (
            <p className="text-sm text-blue-600">
              {data.product1} → {data.product2}
            </p>
          )}
          <p className="text-sm text-green-600">
            Confidence: {formatPercent(data.confidence)}
          </p>
          <p className="text-sm text-purple-600">
            Lift: {data.lift?.toFixed(2)}
          </p>
          <p className="text-sm text-orange-600">
            Support: {formatPercent(data.support)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getLiftColor = (lift: number) => {
    if (lift >= 2) return 'text-green-600 bg-green-50';
    if (lift >= 1.5) return 'text-blue-600 bg-blue-50';
    if (lift >= 1) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getLiftDescription = (lift: number) => {
    if (lift >= 2) return 'Strong Association';
    if (lift >= 1.5) return 'Good Association';
    if (lift >= 1) return 'Weak Association';
    return 'Negative Association';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Rules: {processedData.associations.length}</span>
          <span>Items: {processedData.individualItems.length}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">Top Rule Confidence</span>
          </div>
          <div className="text-lg font-bold text-blue-900">
            {processedData.associations.length > 0 ? 
              formatPercent(processedData.associations[0].confidence) : '0%'}
          </div>
          <div className="text-xs text-blue-600">
            {processedData.associations.length > 0 ? 
              `${processedData.associations[0].product1} → ${processedData.associations[0].product2}` : 
              'No associations'}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Highest Lift</span>
          </div>
          <div className="text-lg font-bold text-green-900">
            {processedData.associations.length > 0 ? 
              processedData.associations.reduce((max, item) => item.lift > max.lift ? item : max).lift.toFixed(2) : 
              '0'}
          </div>
          <div className="text-xs text-green-600">
            Strength of association
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-orange-600 font-medium">Most Frequent</span>
          </div>
          <div className="text-lg font-bold text-orange-900">
            {processedData.individualItems.length > 0 ? 
              processedData.individualItems[0].product1 : 'N/A'}
          </div>
          <div className="text-xs text-orange-600">
            {processedData.individualItems.length > 0 ? 
              formatNumber(processedData.individualItems[0].frequency) + ' times' : 
              'No data'}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-600 font-medium">Categories</span>
          </div>
          <div className="text-lg font-bold text-purple-900">
            {processedData.categoryAnalysis.length}
          </div>
          <div className="text-xs text-purple-600">
            Product categories analyzed
          </div>
        </div>
      </div>

      {/* Association Rules Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Top Association Rules</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData.associations} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number"
                domain={[0, 1]}
                tickFormatter={formatPercent}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                type="category"
                dataKey={(item) => `${item.product1.substring(0, 10)}...`}
                stroke="#6b7280"
                fontSize={11}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="confidence" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Individual Item Frequency */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Individual Item Frequency</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={processedData.individualItems}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ product1, frequency }) => `${product1.substring(0, 8)}: ${formatNumber(frequency)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="frequency"
              >
                {processedData.individualItems.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatNumber(value), 'Frequency']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Association Rules Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Detailed Association Rules</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Support
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strength
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.associations.slice(0, 8).map((rule, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{rule.product1}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="text-gray-700">{rule.product2}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${rule.confidence * 100}%` }}
                        />
                      </div>
                      <span>{formatPercent(rule.confidence)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPercent(rule.support)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${getLiftColor(rule.lift)}`}>
                      {rule.lift.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {getLiftDescription(rule.lift)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Analysis */}
      {processedData.categoryAnalysis.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Category Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedData.categoryAnalysis.map((category, index) => (
              <div key={category.category} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-900">{category.category}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Confidence:</span>
                    <span className="font-medium">{formatPercent(category.avgConfidence)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Lift:</span>
                    <span className="font-medium">{category.avgLift.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rules:</span>
                    <span className="font-medium">{category.ruleCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights Summary */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-3">Key Insights</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-800 mb-1">Strong Associations</div>
            <div className="text-blue-700">
              {processedData.associations.filter(rule => rule.lift >= 2).length} rules with lift ≥ 2.0
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-800 mb-1">High Confidence</div>
            <div className="text-blue-700">
              {processedData.associations.filter(rule => rule.confidence >= 0.7).length} rules with confidence ≥ 70%
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-800 mb-1">Frequent Patterns</div>
            <div className="text-blue-700">
              {processedData.associations.filter(rule => rule.support >= 0.1).length} rules with support ≥ 10%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};