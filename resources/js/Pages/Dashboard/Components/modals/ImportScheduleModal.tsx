import Modal from "@/Pages/Dashboard/Components/ui/Modal";
import { useState } from "react";

interface ImportItem {
    id: number;
    fileName: string;
    status: "queued" | "processing" | "success" | "error";
    createdAt: string;
    message?: string;
    errors?: string[];
}

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function ImportScheduleModal({ open, onClose }: Props) {
    const [imports, setImports] = useState<ImportItem[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    function simulateJob(file: File) {
        const id = Date.now();

        const item: ImportItem = {
            id,
            fileName: file.name,
            status: "queued",
            createdAt: new Date().toLocaleString(),
        };

        setImports(prev => [item, ...prev]);
        setSelectedId(id);

        setTimeout(() => {
            setImports(prev =>
                prev.map(i => (i.id === id ? { ...i, status: "processing" } : i))
            );
        }, 800);

        setTimeout(() => {
            const isError = Math.random() > 0.6;

            setImports(prev =>
                prev.map(i =>
                    i.id === id
                        ? isError
                            ? {
                                ...i,
                                status: "error",
                                message: "Ошибка обработки файла",
                                errors: [
                                    "Неверный формат строки 12",
                                    "Отсутствует колонка 'Дата'",
                                ],
                            }
                            : {
                                ...i,
                                status: "success",
                                message: "Файл успешно обработан",
                            }
                        : i
                )
            );
        }, 2500);
    }

    function handleUpload() {
        if (!file) return;
        simulateJob(file);
        setFile(null);
    }

    function getStatusLabel(status: ImportItem["status"]) {
        switch (status) {
            case "queued":
                return "В очереди";
            case "processing":
                return "Обработка";
            case "success":
                return "Готово";
            case "error":
                return "Ошибка";
        }
    }

    function getStatusColor(status: ImportItem["status"]) {
        switch (status) {
            case "queued":
                return "text-gray-400";
            case "processing":
                return "text-blue-400";
            case "success":
                return "text-green-400";
            case "error":
                return "text-red-400";
        }
    }

    const selected = imports.find(i => i.id === selectedId);

    return (
        <Modal open={open} onClose={onClose} size="xl">
            <Modal.Header>
                <div className="text-white text-lg font-medium">Импорт графиков</div>
            </Modal.Header>

            <Modal.Body>
                <div className="grid grid-cols-3 gap-4 text-white">

                    {/* LEFT */}
                    <div className="col-span-2 space-y-4">

                        {/* Upload block */}
                        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
                            <div className="text-sm text-gray-400">Загрузить файл</div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                                />

                                <button
                                    onClick={handleUpload}
                                    className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded text-sm"
                                >
                                    Загрузить
                                </button>
                            </div>

                            {file && (
                                <div className="text-xs text-gray-500">
                                    Выбран файл: {file.name}
                                </div>
                            )}
                        </div>

                        {/* List */}
                        <div className="bg-gray-900 border border-gray-700 rounded-xl divide-y divide-gray-800 max-h-[40vh] overflow-y-auto">
                            {imports.length === 0 && (
                                <div className="p-6 text-center text-gray-500">
                                    Нет загрузок
                                </div>
                            )}

                            {imports.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    className={`p-4 cursor-pointer hover:bg-gray-800 transition ${
                                        selectedId === item.id ? "bg-gray-800" : ""
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="font-medium text-sm">{item.fileName}</div>
                                        <div className={`text-xs ${getStatusColor(item.status)}`}>
                                            {getStatusLabel(item.status)}
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500 mt-1">
                                        {item.createdAt}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Example block */}
                        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
                            <div className="text-sm text-gray-400">Пример файла</div>

                            <div className="text-xs text-gray-500">
                                Файл должен быть в формате Excel. Обязательные колонки: Дата, Сотрудник, Смена.
                            </div>

                            <div
                                className="border border-gray-700 rounded cursor-pointer overflow-hidden"
                                onClick={() => setPreviewOpen(true)}
                            >
                                <img
                                    src="./img/1.jpg"
                                    alt="example"
                                    className="w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="col-span-1 bg-gray-900 border border-gray-700 rounded-xl p-4">
                        {!selected && (
                            <div className="text-gray-500 text-sm">
                                Выберите загрузку
                            </div>
                        )}

                        {selected && (
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-gray-400">Файл</div>
                                    <div className="text-sm">{selected.fileName}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-400">Статус</div>
                                    <div className={`text-sm ${getStatusColor(selected.status)}`}>
                                        {getStatusLabel(selected.status)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-400">Дата</div>
                                    <div className="text-sm">{selected.createdAt}</div>
                                </div>

                                {selected.message && (
                                    <div>
                                        <div className="text-xs text-gray-400">Сообщение</div>
                                        <div className="text-sm">{selected.message}</div>
                                    </div>
                                )}

                                {selected.errors && (
                                    <div>
                                        <div className="text-xs text-red-400 mb-1">Ошибки</div>
                                        <ul className="text-xs space-y-1 text-red-300">
                                            {selected.errors.map((e, i) => (
                                                <li key={i}>• {e}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Image preview modal */}
                {previewOpen && (
                    <div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                        onClick={() => setPreviewOpen(false)}
                    >
                        <img
                            src="./img/1.jpg"
                            alt="preview"
                            className="max-h-[90vh] max-w-[90vw] rounded"
                        />
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <button
                    onClick={onClose}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                >
                    Закрыть
                </button>
            </Modal.Footer>
        </Modal>
    );
}
