import React from 'react';

const categoryColors = {
  blue: {
    iconColor: 'text-[#38BDF8]',
    iconBg: 'bg-[#38BDF8]/10'
  },
  emerald: {
    iconColor: 'text-[#34D399]',
    iconBg: 'bg-[#34D399]/10'
  },
  indigo: {
    iconColor: 'text-[#818CF8]',
    iconBg: 'bg-[#818CF8]/10'
  },
  amber: {
    iconColor: 'text-[#FBBF24]',
    iconBg: 'bg-[#FBBF24]/10'
  },
  rose: {
    iconColor: 'text-[#F87171]',
    iconBg: 'bg-[#F87171]/10'
  },
  default: {
    iconColor: 'text-[#38BDF8]',
    iconBg: 'bg-[#38BDF8]/10'
  }
};

export const KpiCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'default',
  trend
}) => {
  const scheme = categoryColors[color] || categoryColors.default;

  return (
    <div className="bg-[#111B2E] border border-[#263449] rounded-xl p-5 flex flex-col justify-between select-none">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#94A3B8]">{title}</span>
          {Icon && (
            <div className={`w-7 h-7 rounded-lg ${scheme.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-3.5 h-3.5 ${scheme.iconColor}`} />
            </div>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold text-[#F1F5F9] tracking-tight">
            {value}
          </div>
          {trend && (
            <span className="text-[11px] font-medium text-[#34D399]">
              {trend}
            </span>
          )}
        </div>
      </div>
      {subtext && (
        <p className="text-xs text-[#94A3B8] mt-3 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default KpiCard;
