import Modal from "@/Pages/Dashboard/Components/ui/Modal";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useVirtualizer } from "@tanstack/react-virtual";

export interface FunctionalGroup {
    id: number;
    name: string;
    min_presence_percent: number;
    organisation_unit_name?: string;
}

export interface Employee {
    id: number;
    personnel_number: string;
    name: string;
    position: string;
}

interface GroupWithEmployees extends FunctionalGroup {
    employees: Employee[];
    isDirty?: boolean; // есть несохранённые изменения
}

interface Props {
    open: boolean;
    onClose: () => void;
    isAdmin?: boolean;
}

export default function FunctionalGroupsModal({ open, onClose, isAdmin = true }: Props) {
    const [groups, setGroups] = useState<GroupWithEmployees[]>([]);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

    const [groupSearch, setGroupSearch] = useState("");
    const [employeeSearch, setEmployeeSearch] = useState("");

    const [editingGroup, setEditingGroup] = useState<Partial<GroupWithEmployees> | null>(null);

    const parentRef = useRef<HTMLDivElement | null>(null);

    const selectedGroup = useMemo(
        () => groups.find(g => g.id === selectedGroupId),
        [groups, selectedGroupId]
    );

    async function fetchData() {
        const res = await axios.get("/groups/index");
        setGroups(res.data);

        setAllEmployees([
            { id: 1, personnel_number: "001", name: "Иван Иванов", position: "Dev" },
            { id: 2, personnel_number: "002", name: "Петр Петров", position: "QA" },
            { id: 3, personnel_number: "003", name: "Анна Смирнова", position: "HR" },
        ]);
    }

    useEffect(() => {
        if (open) fetchData();
    }, [open]);

    const filteredGroups = useMemo(
        () => groups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase())),
        [groups, groupSearch]
    );

    const filteredEmployees = useMemo(
        () => allEmployees.filter(e => e.name.toLowerCase().includes(employeeSearch.toLowerCase())),
        [allEmployees, employeeSearch]
    );

    function markDirty(id: number, changes: Partial<GroupWithEmployees>) {
        setGroups(prev =>
            prev.map(g => (g.id === id ? { ...g, ...changes, isDirty: true } : g))
        );
    }

    async function saveGroup(group: GroupWithEmployees) {
        // TODO: заменить на API
        console.log("saving", group);

        setGroups(prev =>
            prev.map(g => (g.id === group.id ? { ...g, isDirty: false } : g))
        );
    }

    function addGroup() {
        const newGroup: GroupWithEmployees = {
            id: Date.now(),
            name: "Новая группа",
            min_presence_percent: 50,
            employees: [],
            isDirty: true,
        };

        setGroups(prev => [newGroup, ...prev]);
        setSelectedGroupId(newGroup.id);
        setEditingGroup(newGroup);
    }

    function deleteGroup(id: number) {
        setGroups(prev => prev.filter(g => g.id !== id));
        if (selectedGroupId === id) {
            setSelectedGroupId(null);
            setEditingGroup(null);
        }
    }

    function addEmployeeToGroup(emp: Employee) {
        if (!selectedGroup) return;

        setGroups(prev =>
            prev.map(g =>
                g.id === selectedGroup.id
                    ? g.employees.find(e => e.id === emp.id)
                        ? g
                        : { ...g, employees: [...g.employees, emp], isDirty: true }
                    : g
            )
        );
    }

    function removeAllFromGroup() {
        if (!selectedGroup) return;

        setGroups(prev =>
            prev.map(g => (g.id === selectedGroup.id ? { ...g, employees: [], isDirty: true } : g))
        );
    }

    const rowVirtualizer = useVirtualizer({
        count: filteredEmployees.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 60,
    });

    return (
        <Modal open={open} onClose={onClose} size="xl">
            <Modal.Header>
                <div className="flex justify-between w-full text-white">
                    <span>Функциональные группы</span>
                    {isAdmin && (
                        <button onClick={addGroup} className="bg-blue-600 px-3 py-1 rounded">
                            + Добавить группу
                        </button>
                    )}
                </div>
            </Modal.Header>

            <Modal.Body>
                <div className="grid grid-cols-3 gap-4 text-white h-[70vh]">

                    {/* 1. Groups */}
                    <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-xl">
                        <input
                            placeholder="Поиск групп..."
                            value={groupSearch}
                            onChange={e => setGroupSearch(e.target.value)}
                            className="p-2 bg-gray-800 border-b border-gray-700 outline-none"
                        />

                        <div className="overflow-y-auto">
                            {filteredGroups.map(g => (
                                <div
                                    key={g.id}
                                    onClick={() => {
                                        setSelectedGroupId(g.id);
                                        setEditingGroup(g);
                                    }}
                                    className={`p-3 cursor-pointer border-b border-gray-800 ${selectedGroupId === g.id ? "bg-gray-800" : "hover:bg-gray-800"}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm font-medium">{g.name}</div>
                                        {g.isDirty && <span className="text-xs text-yellow-400">●</span>}
                                    </div>

                                    <div className="text-xs text-gray-400">
                                        {g.organisation_unit_name || "—"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Мин: {g.min_presence_percent}%
                                    </div>

                                    {isAdmin && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    saveGroup(g);
                                                }}
                                                className="text-green-400 text-xs"
                                            >
                                                сохранить
                                            </button>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    deleteGroup(g.id);
                                                }}
                                                className="text-red-400 text-xs"
                                            >
                                                удалить
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Group employees */}
                    <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-xl">
                        <div className="p-2 border-b border-gray-700 flex justify-between">
                            <span>Сотрудники</span>
                            <button onClick={removeAllFromGroup} className="text-red-400 text-sm">Очистить</button>
                        </div>

                        <div className="overflow-y-auto">
                            {selectedGroup?.employees.map(emp => (
                                <div key={emp.id} className="p-3 border-b border-gray-800 text-sm">
                                    {emp.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. All employees */}
                    <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-xl">
                        <input
                            placeholder="Поиск сотрудников..."
                            value={employeeSearch}
                            onChange={e => setEmployeeSearch(e.target.value)}
                            className="p-2 bg-gray-800 border-b border-gray-700 outline-none"
                        />

                        <div ref={parentRef} className="overflow-y-auto relative">
                            <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                                    const emp = filteredEmployees[virtualRow.index];
                                    const isAdded = selectedGroup?.employees.some(e => e.id === emp.id);

                                    return (
                                        <div
                                            key={emp.id}
                                            className={`absolute left-0 w-full p-3 border-b border-gray-800 flex justify-between ${isAdded ? 'bg-green-900/30' : ''}`}
                                            style={{ transform: `translateY(${virtualRow.start}px)` }}
                                        >
                                            <span>{emp.name}</span>
                                            <button
                                                disabled={isAdded}
                                                onClick={() => addEmployeeToGroup(emp)}
                                                className="text-green-400 text-sm disabled:opacity-30"
                                            >
                                                добавить
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editing block */}
                {editingGroup && (
                    <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-xl text-white">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-sm">Редактирование группы</div>
                            {editingGroup.isDirty && (
                                <button
                                    onClick={() => saveGroup(editingGroup as GroupWithEmployees)}
                                    className="bg-green-600 px-3 py-1 rounded text-sm"
                                >
                                    Сохранить
                                </button>
                            )}
                        </div>

                        <input
                            value={editingGroup.name || ''}
                            onChange={e => {
                                setEditingGroup(prev => ({ ...prev, name: e.target.value, isDirty: true }));
                                if (editingGroup.id) markDirty(editingGroup.id, { name: e.target.value });
                            }}
                            placeholder="Название"
                            className="w-full p-2 mb-2 bg-gray-800"
                        />

                        <input
                            type="number"
                            value={editingGroup.min_presence_percent || 0}
                            onChange={e => {
                                const val = Number(e.target.value);
                                setEditingGroup(prev => ({ ...prev, min_presence_percent: val, isDirty: true }));
                                if (editingGroup.id) markDirty(editingGroup.id, { min_presence_percent: val });
                            }}
                            placeholder="% присутствия"
                            className="w-full p-2 bg-gray-800"
                        />
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <button onClick={onClose} className="px-3 py-1 bg-gray-700 rounded text-white">
                    Закрыть
                </button>
            </Modal.Footer>
        </Modal>
    );
}
