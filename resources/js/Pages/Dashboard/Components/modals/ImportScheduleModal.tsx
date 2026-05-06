import {useState} from "react";
import Modal from "@/Pages/Dashboard/Components/ui/Modal";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (file: File) => void;
}

export default function ImportScheduleModal({open, onClose, onSubmit}: Props) {
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = () => {
        if (!file) return;
        onSubmit(file);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} size={'xl'}>
            <Modal.Header>Импорт графика</Modal.Header>
            <Modal.Body>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="text-xs"
                />
            </Modal.Body>
            <Modal.Footer>
                <button
                    onClick={onClose}
                    className="px-3 py-1  bg-slate-700 rounded text-white"
                >
                    Отмена
                </button>

                <button
                    onClick={handleSubmit}
                    className="px-3 py-1 bg-blue-600 rounded disabled:opacity-50 text-white"
                    disabled={!file}
                >
                    Загрузить
                </button>
            </Modal.Footer>
        </Modal>
    );
}
