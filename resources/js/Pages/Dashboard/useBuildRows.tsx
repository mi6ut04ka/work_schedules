import type {Employee, EmployeeRow, GroupHeaderRow, OrganisationUnit, VirtualRow, ViewMode} from "@/types/types";
import {FALLBACK_COLORS} from "@/types/types";
import {useMemo} from "react";

export function useVirtualRows(
    viewMode: ViewMode,
    filteredEmployees: Employee[],
    organisation_units: OrganisationUnit[],
    employeesByUnit: Map<number, Employee[]>,
    colorMap: Map<number, string>
) {
    return useMemo(() => {
        if (viewMode === "group") {
            return buildGroupRows(filteredEmployees, colorMap);
        }

        return buildHierarchyRows(organisation_units, employeesByUnit, 0);
    }, [viewMode, filteredEmployees, organisation_units, employeesByUnit, colorMap]);
}


function buildHierarchyRows(
    units: OrganisationUnit[],
    employeesByUnit: Map<number, Employee[]>,
    depth: number,
    colorOverride?: string,
): VirtualRow[] {
    const rows: VirtualRow[] = [];

    for (const unit of units) {
        const color = unit.color ?? colorOverride ?? FALLBACK_COLORS[unit.id % FALLBACK_COLORS.length];

        if (!subtreeHasEmployees(unit, employeesByUnit)) continue;

        rows.push({
            kind: "group-header",
            id: `unit-${unit.id}`,
            label: unit.name,
            depth,
            color,
        } satisfies GroupHeaderRow);

        for (const emp of employeesByUnit.get(unit.id) ?? []) {
            rows.push({kind: "employee", id: emp.id, emp, color} satisfies EmployeeRow);
        }

        if (unit.all_children?.length) {
            rows.push(...buildHierarchyRows(unit.all_children, employeesByUnit, depth + 1, color));
        }
    }

    return rows;
}

function buildGroupRows(
    employees: Employee[],
    colorMap: Map<number, string>,
): VirtualRow[] {
    const buckets = new Map<string, { label: string; emps: Employee[] }>();
    const ungrouped: Employee[] = [];

    for (const emp of employees) {
        const grp = emp.functional_groups?.[0];
        if (!grp) {
            ungrouped.push(emp);
            continue;
        }
        const key = `grp-${grp.id}`;
        if (!buckets.has(key)) buckets.set(key, {label: grp.name, emps: []});
        buckets.get(key)!.emps.push(emp);
    }

    const rows: VirtualRow[] = [];
    let ci = 0;
    for (const [key, {label, emps}] of buckets) {
        const color = FALLBACK_COLORS[ci++ % FALLBACK_COLORS.length];
        rows.push({kind: "group-header", id: key, label, depth: 0, color});
        for (const emp of emps) {
            const uid = emp.organisation_unit_id ?? emp.organisation_unit?.id;
            rows.push({
                kind: "employee",
                id: emp.id,
                emp,
                color: (uid !== undefined ? colorMap.get(uid) : undefined) ?? color
            });
        }
    }
    if (ungrouped.length) {
        rows.push({kind: "group-header", id: "grp-none", label: "Без группы", depth: 0, color: "#64748b"});
        for (const emp of ungrouped) {
            rows.push({kind: "employee", id: emp.id, emp, color: "#64748b"});
        }
    }
    return rows;
}

function subtreeHasEmployees(
    unit: OrganisationUnit,
    employeesByUnit: Map<number, Employee[]>,
): boolean {
    if ((employeesByUnit.get(unit.id)?.length ?? 0) > 0) return true;
    return (unit.all_children ?? []).some((child) => subtreeHasEmployees(child, employeesByUnit));
}
