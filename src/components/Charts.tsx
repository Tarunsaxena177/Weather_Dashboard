import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  Brush,
} from 'recharts';

interface ChartProps {
  data: any[];
  xKey: string;
  yKeys: { key: string; color: string; name: string }[];
  title: string;
  type?: 'line' | 'area' | 'bar';
  unit?: string;
}

export const WeatherChart: React.FC<ChartProps> = React.memo(({
  data,
  xKey,
  yKeys,
  title,
  type = 'line',
  unit,
}) => {
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Calculate dynamic width based on data points to ensure legibility on mobile
  const minWidth = React.useMemo(() => 
    Math.max(windowWidth < 640 ? 400 : 600, data.length * 35),
  [windowWidth, data.length]);

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 20, left: 0, bottom: 10 },
    };

    const brush = data.length > 8 ? (
      <Brush
        dataKey={xKey}
        height={30}
        stroke="#94a3b8"
        fill="#f8fafc"
        travellerWidth={10}
        gap={5}
      />
    ) : null;

    if (type === 'area') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            {yKeys.map((yk) => (
              <linearGradient key={yk.key} id={`color${yk.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={yk.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={yk.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey={xKey}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b' }}
            dy={10}
          />
          <YAxis
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b' }}
            unit={unit}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          {yKeys.map((yk) => (
            <Area
              key={yk.key}
              type="monotone"
              dataKey={yk.key}
              name={yk.name}
              stroke={yk.color}
              fillOpacity={1}
              fill={`url(#color${yk.key})`}
            />
          ))}
          {brush}
        </AreaChart>
      );
    }

    if (type === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey={xKey}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b' }}
            dy={10}
          />
          <YAxis
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b' }}
            unit={unit}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
          {yKeys.map((yk) => (
            <Bar key={yk.key} dataKey={yk.key} name={yk.name} fill={yk.color} radius={[4, 4, 0, 0]} />
          ))}
          {brush}
        </BarChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey={xKey}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#64748b' }}
          dy={10}
        />
        <YAxis
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#64748b' }}
          unit={unit}
        />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        {yKeys.map((yk) => (
          <Line
            key={yk.key}
            type="monotone"
            dataKey={yk.key}
            name={yk.name}
            stroke={yk.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
        {brush}
      </LineChart>
    );
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-black/5 shadow-sm h-[350px] flex flex-col gap-4">
      <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
      <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
        <div style={{ minWidth: `${minWidth}px` }} className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});
