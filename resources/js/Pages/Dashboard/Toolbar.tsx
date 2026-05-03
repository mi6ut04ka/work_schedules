import { useState, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    BoltIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";
import type { OrganisationUnit, ViewMode } from "@/types/types";
import {MONTH_NAMES} from "@/types/types";


const VIEWS: { id: ViewMode; label: string }[] = [
    { id: "dept",  label: "По отделам" },
    { id: "group", label: "По группам" },
];

/** Рекурсивно собирает плоский список подразделений с отступом depth. */
function flattenUnits(
    units: OrganisationUnit[],
    depth = 0
): Array<{ unit: OrganisationUnit; depth: number }> {
    return units.flatMap((u) => [
        { unit: u, depth },
        ...flattenUnits(u.all_children ?? [], depth + 1),
    ]);
}

interface MonthPickerProps {
    month: number;
    year: number;
    onChange: (month: number, year: number) => void;
}

function MonthPicker({ month, year, onChange }: MonthPickerProps) {
    const prev = () => {
        if (month === 1) onChange(12, year - 1);
        else onChange(month - 1, year);
    };
    const next = () => {
        if (month === 12) onChange(1, year + 1);
        else onChange(month + 1, year);
    };

    return (
        <div className="flex items-center gap-1 border border-slate-700 rounded-md overflow-hidden">
            <button
                onClick={prev}
                className="h-8 w-7 flex items-center justify-center bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
            >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
            </button>
            <span className="h-8 px-2 flex items-center text-xs font-medium text-slate-200 bg-slate-800 select-none whitespace-nowrap">
                {MONTH_NAMES[month - 1]} {year}
            </span>
            <button
                onClick={next}
                className="h-8 w-7 flex items-center justify-center bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
            >
                <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}


interface UnitFilterProps {
    units: OrganisationUnit[];
    selectedId: number | null;
    onSelect: (id: number | null) => void;
}

function UnitFilterDropdown({ units, selectedId, onSelect }: UnitFilterProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const flat = flattenUnits(units);
    const selectedLabel =
        flat.find((f) => f.unit.id === selectedId)?.unit.name ?? "Все подразделения";

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className={[
                    "h-8 flex items-center gap-1.5 px-2.5 text-xs font-medium rounded-md border transition-colors",
                    "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700",
                    open ? "border-blue-500" : "",
                ].join(" ")}
            >
                <FunnelIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="max-w-[160px] truncate">{selectedLabel}</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="max-h-72 overflow-y-auto">
                        {/* Сброс фильтра */}
                        <button
                            onClick={() => { onSelect(null); setOpen(false); }}
                            className={[
                                "w-full text-left px-3 py-2 text-xs hover:bg-slate-700 transition-colors",
                                selectedId === null ? "text-blue-400 bg-blue-500/10" : "text-slate-300",
                            ].join(" ")}
                        >
                            Все подразделения
                        </button>
                        <div className="border-t border-slate-700" />

                        {flat.map(({ unit, depth }) => (
                            <button
                                key={unit.id}
                                onClick={() => { onSelect(unit.id); setOpen(false); }}
                                className={[
                                    "w-full text-left py-2 text-xs hover:bg-slate-700 transition-colors flex items-center gap-1.5",
                                    selectedId === unit.id ? "text-blue-400 bg-blue-500/10" : "text-slate-300",
                                ].join(" ")}
                                style={{ paddingLeft: 12 + depth * 16 }}
                            >
                                {/* Цветовой маркер */}
                                {unit.color && (
                                    <span
                                        className="flex-shrink-0 w-2 h-2 rounded-full"
                                        style={{ background: unit.color }}
                                    />
                                )}
                                <span className={depth === 0 ? "font-semibold" : "font-normal"}>
                                    {unit.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


interface ToolbarProps {
    viewMode: ViewMode;
    onViewChange: (mode: ViewMode) => void;
    search: string;
    onSearchChange: (value: string) => void;
    month: number;
    year: number;
    selectedUnitId: number | null;
    organisationUnits: OrganisationUnit[];
    onUnitSelect: (id: number | null) => void;
}

export default function Toolbar({
                                    viewMode,
                                    onViewChange,
                                    search,
                                    onSearchChange,
                                    month,
                                    year,
                                    selectedUnitId,
                                    organisationUnits,
                                    onUnitSelect,
                                }: ToolbarProps) {
    const handleMonthChange = (m: number, y: number) => {
        router.get("", { month: m, year: y }, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className="h-12 flex-shrink-0 flex items-center gap-2 px-4 bg-slate-900 border-b border-slate-800">

            <div className="flex border border-slate-700 rounded-md overflow-hidden">
                {VIEWS.map((v) => (
                    <button
                        key={v.id}
                        onClick={() => onViewChange(v.id)}
                        className={[
                            "px-3 h-8 text-xs font-medium transition-colors",
                            viewMode === v.id
                                ? "bg-blue-600/20 text-blue-400"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                        ].join(" ")}
                    >
                        {v.label}
                    </button>
                ))}
            </div>

            <div className="w-px h-5 bg-slate-700" />

            <MonthPicker month={month} year={year} onChange={handleMonthChange} />

            <div className="w-px h-5 bg-slate-700" />

            <UnitFilterDropdown
                units={organisationUnits}
                selectedId={selectedUnitId}
                onSelect={onUnitSelect}
            />

            {/* Поиск */}
            <div className="relative flex items-center">
                <MagnifyingGlassIcon className="absolute left-2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Поиск..."
                    className="h-8 pl-7 pr-3 w-40 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            <div className="w-px h-5 bg-slate-700" />

            <button className="h-8 flex items-center gap-1.5 px-2.5 text-xs font-medium rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
                <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                Импорт
            </button>
            <button className="h-8 flex items-center gap-1.5 px-2.5 text-xs font-medium rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
                <BoltIcon className="w-3.5 h-3.5" />
                Генерировать
            </button>
            <button className="h-8 flex items-center gap-1.5 px-2.5 text-xs font-medium rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                Экспорт
            </button>

            <div className="flex-1" />

            <button className="h-8 flex items-center gap-1.5 px-3 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <CheckIcon className="w-3.5 h-3.5" />
                Сохранить
            </button>
        </div>
    );
}
