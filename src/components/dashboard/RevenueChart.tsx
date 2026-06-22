'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

// Using static data for the MVP to show visual polish.
// In a full production app, this would be fetched from a /api/dashboard/history endpoint.
const chartData = [
  { name: 'Oct', revenue: 15400 },
  { name: 'Nov', revenue: 21000 },
  { name: 'Dec', revenue: 18500 },
  { name: 'Jan', revenue: 32000 },
  { name: 'Feb', revenue: 45000 },
  { name: 'Mar', revenue: 68500 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(payload[0].value);
    return (
      <div className="bg-[#0a0f1c]/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-2xl">
        <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">{label}</p>
        <p className="text-blue-400 font-bold text-sm">{val}</p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
  return (
    <div className="glass-card p-5 h-full flex flex-col items-stretch space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
            <h2 className="font-semibold text-white text-sm">Revenue Growth</h2>
            <p className="text-xs text-white/30 mt-0.5">Last 6 Months</p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-green-400" />
            <span className="text-[10px] font-bold text-green-400 tracking-wider">+42%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} 
                   tickFormatter={(val) => `₹${val >= 1000 ? (val/1000) + 'k' : val}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
