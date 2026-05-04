import { memo } from "react";
import type { DayMeta } from "@/types/types";
import {CELL_W, Employee, MONTH_NAMES, ROW_H, SIDEBAR_W} from "@/types/types";



interface ScheduleHeaderProps {
    monthMeta: DayMeta[];
    totalEmployees: number;
    highlightedCol: string | null;
    onColClick: (key: string) => void;
    employees: Employee[]
}

function resolveMonthLabel(days: DayMeta[]): string {
    if (!days.length) return "";
    const [yearStr, monthStr] = days[0].key.split("-");
    return `${MONTH_NAMES[parseInt(monthStr, 10) - 1]} ${yearStr}`;
}

function ScheduleHeader({ monthMeta, totalEmployees, highlightedCol, onColClick, employees }: ScheduleHeaderProps) {
    const monthLabel = resolveMonthLabel(monthMeta);

    return (
        <div className="flex sticky top-0 z-20 border-b border-slate-800 bg-slate-900 w-max">
            <div className="flex flex-col sticky left-0 z-30" style={{width: SIDEBAR_W}}>
                <div
                    className="flex-1 flex-shrink-0 border-r border-slate-800 flex flex-col justify-center px-3 bg-slate-800"
                >
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                    {monthLabel}
                </span>
                    <span className="text-sm font-semibold text-slate-200">
                    {totalEmployees} сотрудников
                </span>
                </div>
                <div style={{ height: ROW_H }} className="text-sm text-green-600 border border-slate-800 bg-slate-900 items-center px-3 flex">
                    Кол-во сотрудников на работе, %
                </div>
            </div>

            <div className="flex flex-col flex-1">

                <div
                    className="flex items-center justify-center h-6 text-[11px] font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-800"
                    style={{width: CELL_W * monthMeta.length}}
                >
                    {monthLabel.toUpperCase()}
                </div>

                <div className="flex flex-col">
                    <div className="flex">
                    {monthMeta.map((d) => {
                            const isHl = highlightedCol === d.key;
                            return (
                                <button
                                    key={d.key}
                                    data-day={d.key}
                                    onClick={() => onColClick(d.key)}
                                    style={{width: CELL_W, height: ROW_H}}
                                    className={[
                                        "hdr-day-cell",
                                        "flex-shrink-0",
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
                    <div className="flex">
                        {monthMeta.map((d) => {
                            const workingToday = employees.filter(e => ['Я', '8'].includes(e.schedule[d.key])).length;
                            const percent = Math.round(workingToday / employees.length * 100);
                            return (
                                <div
                                    key={d.key + '_%'}
                                    style={{width: CELL_W, height: ROW_H}}
                                    className="border-r border-slate-800 border-t text-[11px] font-medium flex justify-center items-center"
                                >
                                    { !isNaN(percent) ? `${percent} %` : '-'}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(ScheduleHeader);
