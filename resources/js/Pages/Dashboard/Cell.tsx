import {FC, memo} from "react";
import type {ScheduleCode} from "@/types/types";
import {CELL_W, CODE_STYLES, ROW_H} from "@/types/types";

interface CellProps {
    code: ScheduleCode | undefined,
    employeeKey: string,
    dayKey: string,
    isRowSelected: boolean,
    onClick: () => void,
    key?: string
}

const Cell: FC<CellProps> = (props) => {
    const codeClass = props.code ? (CODE_STYLES[props.code] ?? "text-slate-300") : "text-slate-600";

    return (
        <div
            data-day={props.dayKey}
            data-employee={props.employeeKey}
            onClick={props.onClick}
            style={{width: CELL_W, height: ROW_H }}
            className={[
                "cell flex-shrink-0 flex items-center justify-center",
                "font-medium border-r border-slate-800 cursor-pointer",
                "transition-colors duration-100 will-change-transform",
                "hover:bg-slate-700/50 select-none",
                props.isRowSelected ? "bg-blue-500/10" : "",
                codeClass,
            ].join(" ")}
        >
            {props.code ?? "—"}
        </div>
    );
}

export default memo(Cell, (p, n) =>
    p.code === n.code &&
    p.dayKey === n.dayKey &&
    p.isRowSelected === n.isRowSelected
);
