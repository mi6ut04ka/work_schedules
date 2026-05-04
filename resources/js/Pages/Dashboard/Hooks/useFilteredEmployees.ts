import {useMemo} from "react";
import {Employee} from "@/types/types";

export function useFilteredEmployees(
    employees: Employee[],
    search: string,
    selectedUnitId: number | null,
    childrenMap: Map<number, number[]>
) {
    return useMemo(() => {
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
}


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
