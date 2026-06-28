import { clsx } from 'clsx';

export default function CardStat({ title, value, icon: Icon, trend, className, iconBgClass, iconTextClass }) {
  return (
    <div className={clsx("rounded-xl border border-gray-100 bg-white p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          <p className="text-sm text-gray-500 mt-1">{title}</p>
          
          {trend && (
            <div className="mt-2 flex items-center text-sm">
              <span className={clsx(
                "font-medium",
                trend.isPositive ? "text-emerald-600" : "text-red-600"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-slate-500 ml-2">{trend.label}</span>
            </div>
          )}
        </div>
        
        <div className={clsx(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          iconBgClass || "bg-emerald-50",
          iconTextClass || "text-emerald-600"
        )}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
