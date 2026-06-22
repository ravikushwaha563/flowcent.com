'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipContentProps } from 'recharts';
import { useMemo, useState } from 'react';

interface CollectionMonth {
  key: string;
  label: string;
  amounts: Record<string, number>;
}

const CustomTooltip = ({ active, payload, label, currency }: Partial<TooltipContentProps<number, string>> & { currency: string }) => {
  if (active && payload && payload.length) {
    const val = new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(payload[0].value));
    return (
      <div className="bg-[#0a0f1c]/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-2xl">
        <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">{label}</p>
        <p className="text-blue-400 font-bold text-sm">{val}</p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ history }: { history: CollectionMonth[] }) {
  const currencies = useMemo(() => Array.from(new Set(history.flatMap(month => Object.keys(month.amounts)))).sort(), [history]);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const currency = currencies.includes(selectedCurrency) ? selectedCurrency : currencies[0] || 'INR';
  const chartData = history.map(month => ({ name: month.label, revenue: month.amounts[currency] || 0 }));

  return (
    <div className="glass-card p-5 h-full flex flex-col items-stretch space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
            <h2 className="font-semibold text-white text-sm">Collected Revenue</h2>
            <p className="text-xs text-white/30 mt-0.5">Verified paid invoices · last 6 months</p>
        </div>
        {currencies.length > 1 && (
          <select value={currency} onChange={event => setSelectedCurrency(event.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-white/60">
            {currencies.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        )}
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
            <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
