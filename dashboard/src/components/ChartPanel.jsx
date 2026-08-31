import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LANE_COLORS = {
  N: '#8A6B3D',
  S: '#A6844D',
  E: '#C4A066',
  W: '#DFC395'
};

const ChartPanel = ({ metrics, state }) => {
  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-500">Loading charts...</p>
        </div>
      </div>
    );
  }

  // Prepare wait time history data
  const waitTimeData = metrics.wait_time_history || [];
  
  // Prepare queue data for bar chart.
  const lastSnapshot = metrics.queue_history?.slice(-1)[0];
  const queueData =
    lastSnapshot?.queues ||                        // new nested shape
    (lastSnapshot                                  // old flat shape
      ? { N: lastSnapshot.N ?? 0, S: lastSnapshot.S ?? 0,
          E: lastSnapshot.E ?? 0, W: lastSnapshot.W ?? 0 }
      : null) ||
    state?.queues ||                               // live state fallback
    { N: 0, S: 0, E: 0, W: 0 };

  const queueChartData = Object.entries(queueData).map(([lane, count]) => ({
    lane,
    count,
    color: LANE_COLORS[lane] || '#DFC395'
  }));

  return (
    <div className="space-y-6">
      {/* Wait Time Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-800">Average Wait Time</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Target: 30s – 35s
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={waitTimeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#CBD5E1"
              tick={{ fill: '#64748B', fontSize: 11 }}
              minTickGap={35}
              interval="preserveStartEnd"
              tickFormatter={(val) => {
                if (!val || val === 'undefined') return '';
                if (typeof val === 'string') {
                  const parts = val.replace(/[^\d:]/g, '').split(':');
                  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
                }
                return String(val);
              }}
            />
            <YAxis 
              stroke="#CBD5E1"
              tick={{ fill: '#64748B', fontSize: 11 }}
              domain={[20, 40]}
              ticks={[20, 25, 30, 35, 40]}
              tickFormatter={(val) => `${val}s`}
              width={38}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}s`, 'Avg Wait Time']}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="wait_time" 
              stroke="#3B82F6" 
              strokeWidth={2.5}
              dot={{ fill: '#3B82F6', strokeWidth: 1.5, r: 3 }}
              activeDot={{ r: 5, fill: '#1D4ED8', stroke: '#EFF6FF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Queue Length Chart */}
      <div className="border border-[#DFC395]/60 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-800">Current Queue Lengths</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Real-Time
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={queueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" vertical={false} />
            <XAxis 
              dataKey="lane" 
              stroke="#CBD5E1"
              tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
            />
            <YAxis 
              stroke="#CBD5E1"
              tick={{ fill: '#64748B', fontSize: 11 }}
              domain={[0, 'dataMax + 2']}
              allowDecimals={false}
              tickFormatter={(val) => `${val}`}
              width={30}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(223, 195, 149, 0.15)' }}
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #DFC395',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(138, 107, 61, 0.12)'
              }}
              formatter={(value, name, props) => [
                `${value} vehicles`, 
                `Approach ${props.payload.lane}`
              ]}
            />
            <Bar 
              dataKey="count" 
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            >
              {queueChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Traffic Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Cars:</span>
            <span className="ml-2 font-medium">{metrics.total_cars || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Avg Trip Time:</span>
            <span className="ml-2 font-medium">{(metrics.avg_trip_time || 0).toFixed(1)}s</span>
          </div>
          <div>
            <span className="text-gray-600">Throughput:</span>
            <span className="ml-2 font-medium">{(metrics.throughput || 0).toFixed(1)} cars/min</span>
          </div>
          <div>
            <span className="text-gray-600">Active Queues:</span>
            <span className="ml-2 font-medium">
              {Object.values(queueData).reduce((sum, count) => sum + count, 0)} cars
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPanel;