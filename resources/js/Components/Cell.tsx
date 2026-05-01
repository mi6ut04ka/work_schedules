import { memo } from "react";
import type { ScheduleCode } from "@/types/types";

interface CellProps {
    code: ScheduleCode | undefined;
    dayKey: string;
    isRowSelected: boolean;
    onClick: () => void;
}

const CODE_STYLES: Partial<Record<string, string>> = {
    В:  "text-red-400 bg-red-500/10",
    О:  "text-amber-400 bg-amber-500/10",
    ОТ: "text-violet-400 bg-violet-500/10",
    Я:  "text-emerald-400 bg-emerald-500/10",
};

function Cell({ code, dayKey, isRowSelected, onClick }: CellProps) {
    const codeClass = code ? (CODE_STYLES[code] ?? "text-slate-300") : "text-slate-600";

    return (
        <div
            data-day={dayKey}
            onClick={onClick}
            style={{ fontSize: code && code.length > 1 ? 10 : 12 }}
            className={[
                "cell flex-shrink-0 w-11 h-10 flex items-center justify-center",
                "font-medium border-r border-slate-800 cursor-pointer",
                "transition-colors duration-100 will-change-transform",
                "hover:bg-slate-700/50",
                isRowSelected ? "bg-blue-500/10" : "",
                codeClass,
            ].join(" ")}
        >
            {code ?? "—"}
        </div>
    );
}

export default memo(Cell, (p, n) =>
    p.code === n.code &&
    p.dayKey === n.dayKey &&
    p.isRowSelected === n.isRowSelected
);
