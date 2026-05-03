import {CSSProperties, memo} from "react";
import type {Employee, ViewMode} from "@/types/types";


interface SidebarEmployeeCellProps {
    emp: Employee;
    color: string;
    isSelected: boolean;
    viewMode: ViewMode;
    onClick: () => void;
}

function SidebarEmployeeCell(props: SidebarEmployeeCellProps) {
    const sublabel = props.emp.position ?? "";

    return (
        <button
            onClick={props.onClick}
            className={[
                "h-10 w-full flex items-center text-left",
                "transition-colors duration-100 will-change-transform",
                props.isSelected ? "bg-blue-500/15" : "hover:bg-slate-800",
            ].join(" ")}
            style={{ borderLeft: `3px solid ${props.color}` }}
        >
            <span title={props.emp.name} className="flex-1 min-w-0 px-2 text-xs font-medium text-slate-200 truncate">
                {props.emp.name}
            </span>
            {sublabel && (
                <span
                    title={sublabel}
                    className="flex-shrink-0 text-[10px] font-medium pr-2 truncate max-w-[100px]"
                    style={{color: props.color}}
                >
                    {sublabel}
                </span>
            )}
        </button>
    );
};

export default memo(SidebarEmployeeCell);
