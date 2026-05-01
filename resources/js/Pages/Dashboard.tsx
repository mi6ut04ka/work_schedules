import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState, useRef, useMemo, memo, useCallback, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import Toolbar from "@/Components/Toolbar";
import ScheduleHeader from "@/Components/ScheduleHeader";
import Cell from "@/Components/Cell";

import type {
    Employee,
    OrganisationUnit,
    ViewMode,
    DayMeta,
    SchedulePageProps,
    VirtualRow,
    GroupHeaderRow,
    EmployeeRow,
} from "@/types/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const SIDEBAR_W    = 240 as const;
const ROW_H        = 40  as const;
const GROUP_H      = 32  as const; // высота строки-разделителя
const CELL_W       = 44  as const;

const FALLBACK_COLORS: readonly string[] = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
];

// ─── Hierarchy helpers ────────────────────────────────────────────────────────

/**
 * Рекурсивно считает, есть ли хотя бы один сотрудник в поддереве узла.
 * Нужно чтобы не показывать пустые заголовки.
 */
function subtreeHasEmployees(
    unit: OrganisationUnit,
    employeesByUnit: Map<number, Employee[]>,
): boolean {
    if ((employeesByUnit.get(unit.id)?.length ?? 0) > 0) return true;
    return (unit.all_children ?? []).some((child) => subtreeHasEmployees(child, employeesByUnit));
}

/**
 * Строит плоский список виртуальных строк (заголовки групп + сотрудники)
 * из дерева подразделений рекурсивно.
 *
 * Порядок внутри каждого узла:
 *   [заголовок узла]
 *   [прямые сотрудники узла]
 *   [дочерние узлы рекурсивно]
 */
function buildHierarchyRows(
    units: OrganisationUnit[],
    employeesByUnit: Map<number, Employee[]>,
    depth: number,
    colorOverride?: string,
): VirtualRow[] {
    const rows: VirtualRow[] = [];

    for (const unit of units) {
        const color = unit.color ?? colorOverride ?? FALLBACK_COLORS[unit.id % FALLBACK_COLORS.length];

        // Пропускаем пустые ветки полностью
        if (!subtreeHasEmployees(unit, employeesByUnit)) continue;

        // Заголовок подразделения
        rows.push({
            kind: "group-header",
            id: `unit-${unit.id}`,
            label: unit.name,
            depth,
            color,
        } satisfies GroupHeaderRow);

        // Прямые сотрудники этого узла — сразу под заголовком
        for (const emp of employeesByUnit.get(unit.id) ?? []) {
            rows.push({ kind: "employee", id: emp.id, emp, color } satisfies EmployeeRow);
        }

        // Дочерние подразделения рекурсивно
        if (unit.all_children?.length) {
            rows.push(...buildHierarchyRows(unit.all_children, employeesByUnit, depth + 1, color));
        }
    }

    return rows;
}

/**
 * Строит плоский список для режима "По функциональным группам":
 * группы-заголовки → сотрудники без группировки по иерархии.
 */
function buildGroupRows(
    employees: Employee[],
    colorMap: Map<number, string>,
): VirtualRow[] {
    // Группируем по первой функциональной группе
    const buckets = new Map<string, { label: string; emps: Employee[] }>();
    const ungrouped: Employee[] = [];

    for (const emp of employees) {
        const grp = emp.functional_groups?.[0];
        if (!grp) { ungrouped.push(emp); continue; }
        const key = `grp-${grp.id}`;
        if (!buckets.has(key)) buckets.set(key, { label: grp.name, emps: [] });
        buckets.get(key)!.emps.push(emp);
    }

    const rows: VirtualRow[] = [];
    let ci = 0;
    for (const [key, { label, emps }] of buckets) {
        const color = FALLBACK_COLORS[ci++ % FALLBACK_COLORS.length];
        rows.push({ kind: "group-header", id: key, label, depth: 0, color });
        for (const emp of emps) {
            const uid = emp.organisation_unit_id ?? emp.organisation_unit?.id;
            rows.push({ kind: "employee", id: emp.id, emp, color: (uid !== undefined ? colorMap.get(uid) : undefined) ?? color });
        }
    }
    if (ungrouped.length) {
        rows.push({ kind: "group-header", id: "grp-none", label: "Без группы", depth: 0, color: "#64748b" });
        for (const emp of ungrouped) {
            rows.push({ kind: "employee", id: emp.id, emp, color: "#64748b" });
        }
    }
    return rows;
}

/** Рекурсивно проверяет, входит ли unitId в поддерево rootId. */
function isDescendantOrSelf(
    unitId: number,
    rootId: number,
    childrenMap: Map<number, number[]>,
): boolean {
    if (unitId === rootId) return true;
    for (const childId of childrenMap.get(rootId) ?? []) {
        if (isDescendantOrSelf(unitId, childId, childrenMap)) return true;
    }
    return false;
}

// ─── SidebarGroupHeader ───────────────────────────────────────────────────────

interface SidebarGroupHeaderProps {
    row: GroupHeaderRow;
    totalWidth: number;
}

const SidebarGroupHeader = memo(function SidebarGroupHeader({
                                                                row,
                                                                totalWidth,
                                                            }: SidebarGroupHeaderProps) {
    const depthPad = 12 + row.depth * 16;

    return (
        <div
            className="flex items-center h-8 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm select-none"
            style={{ width: totalWidth, minWidth: totalWidth }}
        >
            {/* Sticky часть с названием */}
            <div
                className="sticky left-0 z-10 flex items-center flex-shrink-0 h-full bg-slate-900/90 border-r border-slate-800"
                style={{ width: SIDEBAR_W, paddingLeft: depthPad, borderLeft: `3px solid ${row.color}` }}
            >
                <span
                    className="text-[11px] font-semibold uppercase tracking-wider truncate"
                    style={{ color: row.color }}
                >
                    {row.label}
                </span>
            </div>

            {/* Цветная полоска на всю ширину данных */}
            <div
                className="flex-1 h-full opacity-5"
                style={{ background: row.color }}
            />
        </div>
    );
});

// ─── SidebarEmployeeCell ──────────────────────────────────────────────────────

interface SidebarEmployeeCellProps {
    emp: Employee;
    color: string;
    isSelected: boolean;
    viewMode: ViewMode;
    onClick: () => void;
}

const SidebarEmployeeCell = memo(function SidebarEmployeeCell({
                                                                  emp,
                                                                  color,
                                                                  isSelected,
                                                                  viewMode,
                                                                  onClick,
                                                              }: SidebarEmployeeCellProps) {
    const sublabel = viewMode === "group"
        ? emp.functional_groups?.map((g) => g.name).join(", ") || ""
        : emp.organisation_unit?.name ?? "";

    return (
        <button
            onClick={onClick}
            className={[
                "h-10 w-full flex items-center text-left",
                "transition-colors duration-100 will-change-transform",
                isSelected ? "bg-blue-500/15" : "hover:bg-slate-800",
            ].join(" ")}
            style={{ borderLeft: `3px solid ${color}` }}
        >
            <span className="flex-1 min-w-0 px-2 text-xs font-medium text-slate-200 truncate">
                {emp.name}
            </span>
            {emp.is_rotation && (
                <span className="flex-shrink-0 mr-1 text-[9px] font-bold px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    РОТ
                </span>
            )}
            {sublabel && (
                <span
                    className="flex-shrink-0 text-[10px] font-medium pr-2 max-w-[80px] truncate"
                    style={{ color }}
                >
                    {sublabel}
                </span>
            )}
        </button>
    );
});

// ─── Column highlight via <style> injection ───────────────────────────────────
// Вместо передачи isColHighlighted в каждую ячейку (= массовый ре-рендер),
// мы динамически вставляем одно CSS-правило. Ячейки не перерисовываются.

function useColumnHighlightStyle(highlightedCol: string | null) {
    useEffect(() => {
        const el = document.getElementById("col-hl-style") ??
            (() => {
                const s = document.createElement("style");
                s.id = "col-hl-style";
                document.head.appendChild(s);
                return s;
            })();

        el.textContent = highlightedCol
            ? `.cell[data-day="${highlightedCol}"] { background: rgba(59,130,246,0.18) !important; }`
            : "";
    }, [highlightedCol]);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({
                                      month_meta,
                                      employees,
                                      organisation_units,
                                      filters,
                                  }: SchedulePageProps) {
    const [viewMode,       setViewMode]       = useState<ViewMode>("dept");
    const [search,         setSearch]         = useState<string>(filters.search ?? "");
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(filters.unit_id ?? null);
    const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
    const [highlightedCol, setHighlightedCol] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    
    // CSS-инъекция для подсветки колонки без ре-рендера ячеек
    useColumnHighlightStyle(highlightedCol);

    // Строим childrenMap (id → все дочерние id) для всех уровней дерева
    const childrenMap = useMemo<Map<number, number[]>>(() => {
        const map = new Map<number, number[]>();
        function walk(units: OrganisationUnit[]) {
            for (const u of units) {
                map.set(u.id, (u.all_children ?? []).map((c) => c.id));
                walk(u.all_children ?? []);
            }
        }
        walk(organisation_units);
        return map;
    }, [organisation_units]);

    // colorMap: unit_id → color
    const colorMap = useMemo<Map<number, string>>(() => {
        const map = new Map<number, string>();
        function walk(units: OrganisationUnit[], inherited?: string) {
            units.forEach((u, i) => {
                const color = u.color ?? inherited ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                map.set(u.id, color);
                if (u.all_children?.length) walk(u.all_children, color);
            });
        }
        walk(organisation_units);
        return map;
    }, [organisation_units]);

    // Фильтрация сотрудников
    const filteredEmployees = useMemo<Employee[]>(() => {
        const q = search.trim().toLowerCase();
        return employees.filter((e) => {
            if (q && !e.name.toLowerCase().includes(q)) return false;
            if (selectedUnitId !== null) {
                const uid = e.organisation_unit_id ?? e.organisation_unit?.id;
                if (uid === undefined) return false;
                return isDescendantOrSelf(uid, selectedUnitId, childrenMap);
            }
            return true;
        });
    }, [employees, search, selectedUnitId, childrenMap]);

    // Группировка по подразделению (для режима "dept")
    // organisation_unit_id может отсутствовать если сервер не включил его явно —
    // в таком случае берём id из вложенного объекта organisation_unit.
    const employeesByUnit = useMemo<Map<number, Employee[]>>(() => {
        const map = new Map<number, Employee[]>();
        for (const emp of filteredEmployees) {
            const uid = emp.organisation_unit_id ?? emp.organisation_unit?.id;
            if (uid === undefined) continue;
            if (!map.has(uid)) map.set(uid, []);
            map.get(uid)!.push(emp);
        }
        return map;
    }, [filteredEmployees]);

    // Итоговый плоский список виртуальных строк
    const virtualRows = useMemo<VirtualRow[]>(() => {
        if (viewMode === "group") {
            return buildGroupRows(filteredEmployees, colorMap);
        }
        return buildHierarchyRows(organisation_units, employeesByUnit, 0);
    }, [viewMode, filteredEmployees, employeesByUnit, organisation_units, colorMap]);

    const totalWidth = SIDEBAR_W + CELL_W * month_meta.length;

    const rowVirtualizer = useVirtualizer({
        count: virtualRows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: (i) => virtualRows[i]?.kind === "group-header" ? GROUP_H : ROW_H,
        overscan: 15,
    });

    const handleRowClick   = useCallback((id: number) =>
        setHighlightedRow((p) => (p === id ? null : id)), []);

    const handleColClick   = useCallback((key: string) =>
        setHighlightedCol((p) => (p === key ? null : key)), []);

    const employeeCount = filteredEmployees.length;

    return (
        <>
            <Head title="График" />

            <div className="flex flex-col h-screen bg-[#0f1117] text-slate-200 overflow-hidden">

                <Toolbar
                    viewMode={viewMode}
                    onViewChange={setViewMode}
                    search={search}
                    onSearchChange={setSearch}
                    month={filters.month}
                    year={filters.year}
                    selectedUnitId={selectedUnitId}
                    organisationUnits={organisation_units}
                    onUnitSelect={setSelectedUnitId}
                />

                <div className="flex-1 overflow-hidden">
                    <div
                        ref={scrollRef}
                        className="w-full h-full overflow-auto"
                        style={{ scrollbarWidth: "thin", scrollbarColor: "#334055 transparent" }}
                    >
                        <ScheduleHeader
                            monthMeta={month_meta}
                            totalEmployees={employeeCount}
                            highlightedCol={highlightedCol}
                            onColClick={handleColClick}
                        />

                        {/* Виртуализированный список */}
                        <div
                            style={{
                                height: rowVirtualizer.getTotalSize(),
                                width: totalWidth,
                                position: "relative",
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((vrow) => {
                                const row = virtualRows[vrow.index];

                                // Строка-заголовок подразделения
                                if (row.kind === "group-header") {
                                    return (
                                        <div
                                            key={row.id}
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: GROUP_H,
                                                transform: `translateY(${vrow.start}px)`,
                                                willChange: "transform",
                                            }}
                                        >
                                            <SidebarGroupHeader row={row} totalWidth={totalWidth} />
                                        </div>
                                    );
                                }

                                // Строка сотрудника
                                const { emp, color } = row;
                                const isRowSelected  = highlightedRow === emp.id;

                                return (
                                    <div
                                        key={emp.id}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: ROW_H,
                                            transform: `translateY(${vrow.start}px)`,
                                            willChange: "transform",
                                        }}
                                        className={`flex border-b border-slate-800 ${
                                            isRowSelected ? "bg-blue-500/10" : ""
                                        }`}
                                    >
                                        {/* Sticky сайдбар */}
                                        <div
                                            className="sticky left-0 z-10 flex-shrink-0 bg-slate-900 border-r border-slate-800"
                                            style={{ width: SIDEBAR_W }}
                                        >
                                            <SidebarEmployeeCell
                                                emp={emp}
                                                color={color}
                                                isSelected={isRowSelected}
                                                viewMode={viewMode}
                                                onClick={() => handleRowClick(emp.id)}
                                            />
                                        </div>

                                        {/* Ячейки данных */}
                                        {month_meta.map((d) => (
                                            <Cell
                                                key={d.key}
                                                code={emp.schedule[d.key]}
                                                dayKey={d.key}
                                                isRowSelected={isRowSelected}
                                                onClick={() => handleColClick(d.key)}
                                            />
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Легенда */}
                <div className="h-7 flex-shrink-0 flex items-center gap-4 px-4 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-500">
                    {([
                        ["8",  "рабочий день"],
                        ["В",  "выходной"],
                        ["О",  "отгул"],
                        ["ОТ", "отпуск"],
                        ["Я",  "явка"],
                    ] as const).map(([code, label]) => (
                        <span key={code}>
                            <strong className="text-slate-400">{code}</strong> — {label}
                        </span>
                    ))}
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">РОТ</span>
                    <span>ротация</span>
                </div>
            </div>
        </>
    );
}
