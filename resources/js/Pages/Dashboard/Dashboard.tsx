import {Head} from "@inertiajs/react";
import {useState, useRef, useMemo, useCallback} from "react";
import {useVirtualizer} from "@tanstack/react-virtual";
import Toolbar from "@/Pages/Dashboard/Toolbar";
import ScheduleHeader from "@/Pages/Dashboard/ScheduleHeader";
import Cell from "@/Pages/Dashboard/Cell";
import type {Employee, OrganisationUnit, ViewMode, SchedulePageProps} from "@/types/types";
import useColumnHighlightStyle from "@/Pages/Dashboard/useColumnHighlightStyle";
import SidebarEmployeeCell from "@/Pages/Dashboard/SidebarEmployeeCell";
import {CELL_W, FALLBACK_COLORS, GROUP_H, ROW_H, SIDEBAR_W} from "@/types/types";
import {useFilteredEmployees} from "@/Pages/Dashboard/useFilteredEmployees";
import SidebarGroupHeader from "@/Pages/Dashboard/SidebarGroupHeader";
import {useVirtualRows} from "@/Pages/Dashboard/useBuildRows";

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

    useColumnHighlightStyle(highlightedCol);

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

    const filteredEmployees = useFilteredEmployees(employees, search, selectedUnitId, childrenMap);

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

    const virtualRows = useVirtualRows(viewMode, filteredEmployees,organisation_units,employeesByUnit,colorMap);

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
        <div>
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
                        <div
                            style={{
                                height: rowVirtualizer.getTotalSize(),
                                width: totalWidth,
                                position: "relative",
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((vrow) => {
                                const row = virtualRows[vrow.index];
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
                                        {month_meta.map((d) => (
                                            <Cell
                                                key={d.key}
                                                code={emp.schedule[d.key]}
                                                dayKey={d.key}
                                                employeeKey={emp.name}
                                                isRowSelected={isRowSelected}
                                                onClick={() => handleRowClick(emp.id)}
                                            />
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
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
                </div>
            </div>
        </div>
    );
}
