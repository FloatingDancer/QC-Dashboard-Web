import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

export default function ControlChart({ data, loading, t }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="alert-pulse" style={{ color: 'var(--text-secondary)' }}>{t("loading_chart")}</p>
      </div>
    );
  }

  if (!data || !data.points || data.points.length === 0) {
    return (
      <div className="glass-card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>{t("chart_no_data")}</p>
      </div>
    );
  }

  // Format percent for Y Axis and Tooltip
  const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;

  // Custom tooltips for nice styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '14px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)'
        }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
            Batch: {dataPoint.batch_number}
          </p>
          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ color: 'var(--color-brand)' }}>
              {t("chart_defect_rate")}: <span style={{ fontWeight: 600 }}>{formatPercent(dataPoint.defect_rate)}</span>
            </p>
            <p style={{ color: 'var(--color-danger)' }}>
              {t("chart_ucl")}: {formatPercent(dataPoint.ucl)}
            </p>
            <p style={{ color: 'var(--color-success)' }}>
              {t("chart_cl")}: {formatPercent(dataPoint.center_line)}
            </p>
            {dataPoint.is_out_of_control && (
              <p style={{ color: 'var(--color-danger)', fontWeight: 700, marginTop: '4px', className: 'alert-pulse' }}>
                ⚠️ {t("chart_out_of_control").toUpperCase()}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Point Renderer to highlight out-of-control points in red
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.is_out_of_control) {
      return (
        <svg x={cx - 8} y={cy - 8} width={16} height={16} viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" fill="var(--color-danger)" stroke="#fff" strokeWidth="2" />
          <circle cx="8" cy="8" r="8" fill="none" stroke="var(--color-danger)" strokeWidth="1" opacity="0.5">
            <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      );
    }
    return (
      <circle cx={cx} cy={cy} r={4} fill="var(--color-brand)" stroke="#0B0F19" strokeWidth="1" />
    );
  };

  const centerLineVal = data.points[0]?.center_line || 0;
  const uclVal = data.points[0]?.ucl || 0;
  const lclVal = data.points[0]?.lcl || 0;

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t("control_chart_title")}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {t("control_chart_subtitle")} <span style={{ color: 'var(--color-brand)', fontWeight: 600 }}>{data.product_name} ({data.product_code})</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '2px', background: 'var(--color-danger)', borderStyle: 'dashed' }} />
            UCL ({formatPercent(uclVal)})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '2px', background: 'var(--color-success)', borderStyle: 'dashed' }} />
            CL ({formatPercent(centerLineVal)})
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.points}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="batch_number" 
              stroke="var(--text-muted)" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={10} 
              tickFormatter={formatPercent}
              tickLine={false}
              axisLine={false}
              domain={[0, (dataMax) => Math.max(dataMax * 1.2, uclVal * 1.2, 0.05)]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Control Limit Reference Lines */}
            <ReferenceLine y={uclVal} stroke="var(--color-danger)" strokeDasharray="4 4" label={{ value: 'UCL', fill: 'var(--color-danger)', position: 'left', fontSize: 9 }} />
            <ReferenceLine y={centerLineVal} stroke="var(--color-success)" strokeDasharray="3 3" label={{ value: 'Avg', fill: 'var(--color-success)', position: 'left', fontSize: 9 }} />
            {lclVal > 0 && (
              <ReferenceLine y={lclVal} stroke="var(--color-danger)" strokeDasharray="4 4" label={{ value: 'LCL', fill: 'var(--color-danger)', position: 'left', fontSize: 9 }} />
            )}

            <Line
              type="monotone"
              dataKey="defect_rate"
              name="Defect Rate"
              stroke="var(--color-brand)"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 1 }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
