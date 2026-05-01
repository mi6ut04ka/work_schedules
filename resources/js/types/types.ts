export type ScheduleCode = "8" | "В" | "О" | "ОТ" | "Я" | string;

export interface DayMeta {
    num: number;
    key: string;
    dow: number;
    isWeekend: boolean;
    dowLabel: string;
}

export interface OrganisationUnit {
    id: number;
    name: string;
    parent_id: number | null;
    color?: string;
    all_children?: OrganisationUnit[];
}

export interface FunctionalGroup {
    id: number;
    name: string;
    min_presence_percent: number;
}

export interface Employee {
    id: number;
    personnel_number: string;
    name: string;
    organisation_unit_id?: number;
    organisation_unit?: OrganisationUnit;
    functional_groups?: FunctionalGroup[];
    schedule: Record<string, ScheduleCode>;
    is_rotation?: boolean;
}

export type ViewMode = "dept" | "group";

export interface SchedulePageProps {
    month_meta: DayMeta[];
    employees: Employee[];
    /** Корневые подразделения с рекурсивными children от сервера */
    organisation_units: OrganisationUnit[];
    functional_groups?: FunctionalGroup[];
    filters: {
        month: number;
        year: number;
        unit_id?: number | null;
        search?: string;
    };
}


export interface GroupHeaderRow {
    kind: "group-header";
    id: string;
    label: string;
    depth: number;
    color: string;
}

export interface EmployeeRow {
    kind: "employee";
    id: number;
    emp: Employee;
    color: string;
}

export type VirtualRow = GroupHeaderRow | EmployeeRow;
