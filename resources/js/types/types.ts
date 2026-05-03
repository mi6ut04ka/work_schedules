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
    all_children_ids: number[]
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
    position: string
}

export type ViewMode = "dept" | "group";

export interface SchedulePageProps {
    month_meta: DayMeta[];
    employees: Employee[];
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
    all_children_ids?: number[]
    group_employee_ids?: number[]
}

export interface EmployeeRow {
    kind: "employee";
    id: number;
    emp: Employee;
    color: string;
}

export type VirtualRow = GroupHeaderRow | EmployeeRow;

export const FALLBACK_COLORS: readonly string[] = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
];

export const CODE_STYLES: Partial<Record<string, string>> = {
    В: "text-red-400 bg-red-500/10",
    О: "text-amber-400 bg-amber-500/10",
    ОТ: "text-violet-400 bg-violet-500/10",
    Я: "text-emerald-400 bg-emerald-500/10",
};

export const MONTH_NAMES = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
] as const;

export const SCHEDULE_STATUSES = [
    { code: "8",  label: "рабочий день" },
    { code: "Я",  label: "явка" },
    { code: "В",  label: "выходной" },
    { code: "О",  label: "отгул" },
    { code: "ОТ", label: "отпуск" },
] as const;


export const SIDEBAR_W    = 300 as const;
export const ROW_H        = 40  as const;
export const GROUP_H      = 32  as const;
export const CELL_W       = 50  as const;
