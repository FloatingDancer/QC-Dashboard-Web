import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export default function ParetoChart({ data, loading, t }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="alert-pulse" style={{ color: 'var(--text-secondary)' }}>{t("loading_pareto")}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>{t("pareto_no_data")}</p>
      </div>
    );
  }

  const getDefectName = (type) => {
    const key = `defect_${type.toLowerCase().replace(/\s+/g, '_')}`;
    return t(key) !== key ? t(key) : type;
  };

  const mappedData = data.map(d => ({
    ...d,
    defect_type: getDefectName(d.defect_type)
  }));

  // Curated color list for bars
  const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dp = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)'
        }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
            {dp.defect_type}
          </p>
          <p style={{ color: 'var(--color-brand)', fontSize: '0.85rem' }}>
            {t("pareto_qty")}: <span style={{ fontWeight: 600 }}>{dp.quantity} unit</span>
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            {t("pareto_contribution")}: <span style={{ fontWeight: 600 }}>{dp.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px' }}>{t("pareto_title")}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
        {t("pareto_subtitle")}
      </p>
      
      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mappedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={true} vertical={false} />
            <XAxis 
              dataKey="defect_type" 
              stroke="var(--text-muted)" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="quantity" 
              radius={[6, 6, 0, 0]}
              animationDuration={500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
