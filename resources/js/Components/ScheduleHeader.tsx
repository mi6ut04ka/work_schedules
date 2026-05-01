import { memo } from "react";
import type { DayMeta } from "@/types/types";

const MONTH_NAMES = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
] as const;

interface ScheduleHeaderProps {
    monthMeta: DayMeta[];
    totalEmployees: number;
    highlightedCol: string | null;
    onColClick: (key: string) => void;
}

function resolveMonthLabel(days: DayMeta[]): string {
    if (!days.length) return "";
    const [yearStr, monthStr] = days[0].key.split("-");
    return `${MONTH_NAMES[parseInt(monthStr, 10) - 1]} ${yearStr}`;
}

function ScheduleHeader({ monthMeta, totalEmployees, highlightedCol, onColClick }: ScheduleHeaderProps) {
    const monthLabel = resolveMonthLabel(monthMeta);

    return (
        <div className="flex sticky top-0 z-20 bg-slate-900 border-b border-slate-800">

            {/* Угловая ячейка */}
            <div
                className="sticky left-0 z-30 flex-shrink-0 w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-center px-3"
            >
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                    {monthLabel}
                </span>
                <span className="text-sm font-semibold text-slate-200">
                    {totalEmployees.toLocaleString("ru-RU")} сотрудников
                </span>
            </div>

            {/* Колонки дней */}
            <div className="flex flex-col flex-1">

                {/* Строка с названием месяца */}
                <div
                    className="flex items-center justify-center h-6 text-[11px] font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-800"
                    style={{ width: 44 * monthMeta.length }}
                >
                    {monthLabel.toUpperCase()}
                </div>

                {/* Строка с номерами дней */}
                <div className="flex h-8">
                    {monthMeta.map((d) => {
                        const isHl = highlightedCol === d.key;
                        return (
                            <button
                                key={d.key}
                                data-day={d.key}
                                onClick={() => onColClick(d.key)}
                                className={[
                                    "hdr-day-cell",          // используется CSS-правилом подсветки колонки
                                    "flex-shrink-0 w-11 h-8",
                                    "flex flex-col items-center justify-center",
                                    "text-[11px] font-medium",
                                    "border-r border-slate-800",
                                    "transition-colors duration-100",
                                    d.isWeekend ? "text-red-400" : "text-slate-400",
                                    isHl
                                        ? "bg-blue-600/25 text-blue-300"
                                        : "hover:bg-slate-800",
                                ].join(" ")}
                            >
                                <span className="leading-none">{d.num}</span>
                                <span className={[
                                    "text-[9px] leading-none mt-0.5",
                                    d.isWeekend ? "text-red-500/60" : "text-slate-600",
                                    isHl ? "text-blue-400/70" : "",
                                ].join(" ")}>
                                    {d.dowLabel}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default memo(ScheduleHeader);
