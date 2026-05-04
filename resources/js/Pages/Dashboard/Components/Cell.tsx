import {FC, memo} from "react";
import type {ScheduleCode} from "@/types/types";
import {CELL_W, CODE_STYLES, ROW_H} from "@/types/types";

interface CellProps {
    code: ScheduleCode | undefined,
    employeeId: number,
    dayKey: string,
    isRowSelected: boolean,
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void,
    isSelected: boolean,
    onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void
    isDirty: boolean
}

const Cell: FC<CellProps> = (props) => {
    const codeClass = props.code ? (CODE_STYLES[props.code] ?? "text-slate-300") : "text-slate-600";
    return (
        <div
            data-day={props.dayKey}
            data-employee={props.employeeId}
            onClick={(e) => props.onClick(e)}
            style={{width: CELL_W, height: ROW_H}}
            onContextMenu={props.onContextMenu}
            className={[
                "cell flex-shrink-0 flex items-center justify-center",
                "font-medium border-r border-slate-800 cursor-pointer",
                "transition-colors duration-100 will-change-transform",
                "hover:bg-slate-700/50 select-none",
                props.isSelected
                    ? "bg-blue-500/40"
                    : props.isRowSelected
                        ? "bg-blue-500/10"
                        : "",
                codeClass,
            ].join(" ")}
        >
            {props.isDirty && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
            )}
            {props.code ?? "—"}
        </div>
    );
}

export default memo(Cell, (p, n) =>
    p.code === n.code &&
    p.dayKey === n.dayKey &&
    p.isRowSelected === n.isRowSelected &&
    p.isSelected === n.isSelected &&
    p.isDirty === n.isDirty
);
