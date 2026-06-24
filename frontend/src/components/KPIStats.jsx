import React from 'react';
import { Activity, CheckCircle2, AlertOctagon, RefreshCw, Layers } from 'lucide-react';

export default function KPIStats({ summary, onRefresh, loading, t }) {
  const cards = [
    {
      title: t("today_yield_rate"),
      value: `${summary.yield_rate_today}%`,
      subtext: t("yield_desc"),
      icon: Activity,
      color: summary.yield_rate_today >= 95 ? "var(--color-success)" : "var(--color-warning)",
      glow: summary.yield_rate_today >= 95 ? "var(--color-success-glow)" : "var(--color-warning-glow)"
    },
    {
      title: t("today_inspected"),
      value: summary.total_inspected_today.toLocaleString(),
      subtext: t("inspected_desc", { passed: summary.total_passed_today.toLocaleString() }),
      icon: Layers,
      color: "var(--color-brand)",
      glow: "var(--color-brand-glow)"
    },
    {
      title: t("today_defects"),
      value: summary.total_failed_today.toLocaleString(),
      subtext: t("defects_desc", { rate: (summary.total_inspected_today > 0 ? (summary.total_failed_today / summary.total_inspected_today * 100).toFixed(1) : 0) }),
      icon: AlertOctagon,
      color: summary.total_failed_today > 0 ? "var(--color-danger)" : "var(--text-secondary)",
      glow: summary.total_failed_today > 0 ? "var(--color-danger-glow)" : "transparent"
    },
    {
      title: t("active_alerts"),
      value: summary.active_alerts_count,
      subtext: t("alerts_desc"),
      icon: AlertOctagon,
      color: summary.active_alerts_count > 0 ? "var(--color-danger)" : "var(--color-success)",
      glow: summary.active_alerts_count > 0 ? "var(--color-danger-glow)" : "var(--color-success-glow)",
      pulse: summary.active_alerts_count > 0
    }
  ];

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{t("today_title")}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t("today_subtitle_desc")}</p>
        </div>
        <button 
          onClick={onRefresh} 
          disabled={loading}
          className="btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={16} className={loading ? "alert-pulse" : ""} />
          {t("refresh")}
        </button>
      </div>

      <div className="dashboard-grid">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className={`glass-card ${card.pulse ? "alert-pulse" : ""}`}
              style={{ 
                position: 'relative', 
                overflow: 'hidden',
                borderColor: card.pulse ? 'var(--color-danger)' : 'var(--border-color)'
              }}
            >
              {/* Background Glow */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: card.glow,
                filter: 'blur(20px)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                  {card.title}
                </span>
                <div style={{ 
                  background: card.glow, 
                  color: card.color, 
                  padding: '8px', 
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} />
                </div>
              </div>

              <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px', color: card.color }}>
                {card.value}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {card.subtext}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
