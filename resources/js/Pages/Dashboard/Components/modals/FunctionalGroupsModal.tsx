import Modal from "@/Pages/Dashboard/Components/ui/Modal";
import { useEffect, useState } from "react";
import { Employee, FunctionalGroup } from "@/types/types";
import axios from "axios";

interface FunctionalGroupWithEmployees extends FunctionalGroup {
    employees: Employee[];
}

interface ModalProps {
    open: boolean;
    onClose: () => void;
}

// mock employees for dropdown
const mockEmployees: Partial<Employee>[] = [
    { id: 100, personnel_number: "010", name: "Иван Петров", position: "Dev" },
    { id: 101, personnel_number: "011", name: "Мария Смирнова", position: "QA" },
];

export default function FunctionalGroupsModal(props: ModalProps) {
    const [groups, setGroups] = useState<FunctionalGroupWithEmployees[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

    async function fetchGroups() {
        setLoading(true);
        try {
            const response = await axios.get("/groups/index");
            setGroups(response.data);
        } catch (error) {
            console.error("Ошибка при групп:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void fetchGroups();
    }, []);

    function toggleGroup(id: number) {
        setExpandedGroupId(prev => (prev === id ? null : id));
    }

    function deleteGroup(id: number) {
        setGroups(prev => prev.filter(g => g.id !== id));
    }

    function addGroup() {
        const newGroup: FunctionalGroupWithEmployees = {
            id: Date.now(),
            name: "Новая группа",
            min_presence_percent: 50,
            employees: [],
        };
        setGroups(prev => [...prev, newGroup]);
    }

    function saveGroup(id: number) {
        console.log("save group", id);
    }

    function updatePresence(id: number, value: number) {
        setGroups(prev => prev.map(g => (g.id === id ? { ...g, min_presence_percent: value } : g)));
    }

    function addEmployee(groupId: number) {
        const emp = mockEmployees.find(e => e.id === selectedEmployee);
        if (!emp) return;

        setGroups(prev =>
            prev.map(g =>
                g.id === groupId
                    ? { ...g, employees: [...g.employees, { ...emp, id: Date.now() }] }
                    : g
            )
        );
    }

    function deleteEmployee(groupId: number, empId: number) {
        setGroups(prev =>
            prev.map(g =>
                g.id === groupId
                    ? { ...g, employees: g.employees.filter(e => e.id !== empId) }
                    : g
            )
        );
    }

    function editGroupName(id: number, name: string) {
        setGroups(prev => prev.map(g => (g.id === id ? { ...g, name } : g)));
    }

    return (
        <Modal open={props.open} onClose={props.onClose} size="xl">
            <Modal.Header>
                <div className="flex justify-between items-center w-full text-white">
                    <span>Функциональные группы</span>
                    <button onClick={addGroup} className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded">
                        + Группа
                    </button>
                </div>
            </Modal.Header>

            <Modal.Body>
                <div className="max-h-[60vh] overflow-y-auto space-y-4 text-white">
                    {loading && <div className="text-center p-10">Загрузка...</div>}

                    {!loading &&
                        groups.map(group => (
                            <div key={group.id} className="border border-gray-700 bg-gray-900 rounded-xl shadow">
                                <div className="flex justify-between items-center bg-gray-800 p-3 rounded-t-xl">
                                    <input
                                        value={group.name}
                                        onChange={e => editGroupName(group.id, e.target.value)}
                                        className="font-semibold bg-transparent outline-none border-b border-gray-600"
                                    />

                                    <div className="flex gap-2">
                                        <button onClick={() => saveGroup(group.id)} className="text-green-400 text-sm">
                                            Сохранить
                                        </button>
                                        <button onClick={() => toggleGroup(group.id)} className="text-blue-400 text-sm">
                                            {expandedGroupId === group.id ? "Скрыть" : "Открыть"}
                                        </button>
                                        <button onClick={() => deleteGroup(group.id)} className="text-red-400 text-sm">
                                            Удалить
                                        </button>
                                    </div>
                                </div>

                                {expandedGroupId === group.id && (
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-400">Мин. присутствие:</span>
                                                <input
                                                    type="number"
                                                    value={group.min_presence_percent}
                                                    onChange={e => updatePresence(group.id, Number(e.target.value))}
                                                    className="w-20 bg-gray-800 border border-gray-600 rounded px-2 py-1"
                                                />
                                                <span>%</span>
                                            </div>

                                            <div className="flex gap-2">
                                                <select
                                                    onChange={e => setSelectedEmployee(Number(e.target.value))}
                                                    className="bg-gray-800 border border-gray-600 rounded px-2 py-1"
                                                >
                                                    <option value="">Выбрать сотрудника</option>
                                                    {mockEmployees.map(e => (
                                                        <option key={e.id} value={e.id}>
                                                            {e.name}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    onClick={() => addEmployee(group.id)}
                                                    className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <table className="w-full text-sm">
                                            <thead>
                                            <tr className="text-left text-gray-400 border-b border-gray-700">
                                                <th className="p-2">№</th>
                                                <th className="p-2">ФИО</th>
                                                <th className="p-2">Должность</th>
                                                <th className="p-2"></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {group.employees.length > 0 ? (
                                                group.employees.map(emp => (
                                                    <tr key={emp.id} className="border-b border-gray-800">
                                                        <td className="p-2">{emp.personnel_number}</td>
                                                        <td className="p-2">{emp.name}</td>
                                                        <td className="p-2">{emp.position}</td>
                                                        <td className="p-2 text-right">
                                                            <button
                                                                onClick={() => deleteEmployee(group.id, emp.id)}
                                                                className="text-red-400"
                                                            >
                                                                Удалить
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center p-3 text-gray-500">
                                                        Нет сотрудников
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            </Modal.Body>

            <Modal.Footer>
                <button onClick={props.onClose} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white">
                    Закрыть
                </button>
            </Modal.Footer>
        </Modal>
    );
}
