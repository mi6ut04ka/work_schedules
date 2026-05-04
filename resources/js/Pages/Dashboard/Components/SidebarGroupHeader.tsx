import {memo} from "react";
import type {DayMeta, Employee, GroupHeaderRow} from "@/types/types";
import {CELL_W, GROUP_H, ROW_H, SIDEBAR_W} from "@/types/types";

interface SidebarGroupHeaderProps {
    row: GroupHeaderRow;
    totalWidth: number;
    employees: Employee[];
    monthMeta: DayMeta[];
}


export default memo(function SidebarGroupHeader(props: SidebarGroupHeaderProps) {
    const depthPad = 12 + props.row.depth * 16;
    const workCodes = ['Я', '8'];

    return (
        <div
            className="flex items-center border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm select-none"
            style={{width: props.totalWidth, minWidth: props.totalWidth, height: GROUP_H}}
        >
            <div
                className="sticky left-0 z-10 flex items-center flex-shrink-0 h-full bg-slate-900/90 border-r border-slate-800"
                style={{width: SIDEBAR_W, paddingLeft: depthPad, borderLeft: `3px solid ${props.row.color}`}}
            >
                <span
                    className="text-[11px] font-semibold uppercase tracking-wider truncate"
                    style={{color: props.row.color}}
                >
                    {props.row.label}
                </span>
            </div>
            <div className="flex">
                {props.monthMeta.map(d => {
                    let filteredEmployees = [];

                    if (props.row.group_employee_ids) {
                        filteredEmployees = props.employees.filter(e =>
                            props.row.group_employee_ids?.includes(e.id)
                        );
                    } else if (props.row.all_children_ids) {
                        filteredEmployees = props.employees.filter(e =>
                            props.row.all_children_ids?.includes(Number(e.organisation_unit_id))
                        );
                    }

                    const total = filteredEmployees.length;
                    const working = filteredEmployees.filter(e =>
                        workCodes.includes(e.schedule[d.key])
                    ).length;

                    const percent = total > 0 ? Math.round((working / total) * 100) : 0;

                    return (
                        <div style={{width: CELL_W, height: ROW_H, color: props.row.color}} key={`${d.key}_${props.row.id}`}
                             className="border-r border-slate-800 border-t text-xs font-medium flex justify-center items-center">
                            {percent} %
                        </div>
                    )
                })}
            </div>
        </div>
    );
});
