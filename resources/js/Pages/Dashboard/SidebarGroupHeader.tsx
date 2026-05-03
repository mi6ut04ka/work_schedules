import {memo} from "react";
import type {GroupHeaderRow} from "@/types/types";
import {SIDEBAR_W} from "@/types/types";

interface SidebarGroupHeaderProps {
    row: GroupHeaderRow;
    totalWidth: number;
}


export default memo(function SidebarGroupHeader(props: SidebarGroupHeaderProps) {
    const depthPad = 12 + props.row.depth * 16;

    return (
        <div
            className="flex items-center h-8 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm select-none"
            style={{ width: props.totalWidth, minWidth: props.totalWidth }}
        >
            <div
                className="sticky left-0 z-10 flex items-center flex-shrink-0 h-full bg-slate-900/90 border-r border-slate-800"
                style={{ width: SIDEBAR_W, paddingLeft: depthPad, borderLeft: `3px solid ${props.row.color}` }}
            >
                <span
                    className="text-[11px] font-semibold uppercase tracking-wider truncate"
                    style={{ color: props.row.color }}
                >
                    {props.row.label}
                </span>
            </div>
            <div
                className="flex-1 h-full opacity-5"
                style={{ background: props.row.color }}
            />
        </div>
    );
});
