import {useState, useRef, useCallback, useEffect} from "react";

export const useCellSelection = (month_meta: { key: string }[], isManager: boolean, onChangeCells: (updates) => void) => {

    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const lastSelectedRef = useRef<{ empId: number; dayKey: string } | null>(null);

    const getCellKey = (empId: number, dayKey: string) => `${empId}_${dayKey}`;

    const handleCellClick = useCallback((
        empId: number,
        dayKey: string,
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        const key = getCellKey(empId, dayKey);

        if (event.shiftKey && lastSelectedRef.current) {
            const last = lastSelectedRef.current;

            if (last?.empId !== empId) {
                const newSet = new Set<string>();
                newSet.add(key);
                setSelectedCells(newSet);
                lastSelectedRef.current = {empId, dayKey};
                return;
            }

            const days = month_meta.map(d => d.key);
            const start = days.indexOf(last.dayKey);
            const end = days.indexOf(dayKey);
            const [from, to] = start < end ? [start, end] : [end, start];

            const newSet = new Set<string>();

            for (let i = from; i <= to; i++) {
                newSet.add(getCellKey(empId, days[i]));
            }

            setSelectedCells(newSet);
        } else {
            const newSet = new Set<string>();
            newSet.add(key);
            setSelectedCells(newSet);
            lastSelectedRef.current = {empId, dayKey};
        }
    }, [month_meta]);

    const handleContextMenu = useCallback((
        e: React.MouseEvent,
        empId: number,
        dayKey: string
    ) => {
        if (!isManager) return;

        e.preventDefault();

        const key = getCellKey(empId, dayKey);

        setSelectedCells(prev => {
            if (prev.has(key)) return prev;
            return new Set([key]);
        });

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
        });
    }, [isManager]);

    const handleChangeCode = useCallback((newCode: string) => {
        const updates = [...selectedCells].map(key => {
            const [empId, dayKey] = key.split("_");
            return {
                empId: Number(empId),
                dayKey,
                code: newCode,
            };
        });

        onChangeCells(updates);

        setContextMenu(null);
        setSelectedCells(new Set());
    }, [selectedCells, onChangeCells]);

    useEffect(() => {
        const close = () => setContextMenu(null);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    const isCellSelected = useCallback(
        (empId: number, dayKey: string) =>
            selectedCells.has(getCellKey(empId, dayKey)),
        [selectedCells]
    );

    return {
        selectedCells,
        contextMenu,
        getCellKey,
        handleCellClick,
        handleContextMenu,
        handleChangeCode,
        isCellSelected
    };
};
