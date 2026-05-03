import {useState, useMemo, useCallback} from "react";
import axios from "axios";

export function useScheduleDraft(setLocalEmployees) {
    const [draftChanges, setDraftChanges] = useState<Map<string, string>>(new Map());

    const updateCells = useCallback((updates) => {
        setLocalEmployees(prev =>
            prev.map(emp => {
                const empUpdates = updates.filter(u => u.empId === emp.id);
                if (!empUpdates.length) return emp;

                const newSchedule = {...emp.schedule};

                for (const u of empUpdates) {
                    newSchedule[u.dayKey] = u.code;
                }

                return {...emp, schedule: newSchedule};
            })
        );

        setDraftChanges(prev => {
            const newMap = new Map(prev);

            for (const u of updates) {
                const key = `${u.empId}_${u.dayKey}`;
                newMap.set(key, u.code);
            }

            return newMap;
        });
    }, [setLocalEmployees]);

    const save = useCallback(async () => {
        const payload = [...draftChanges.entries()].map(([key, code]) => {
            const [empId, dayKey] = key.split("_");

            return {
                empId: Number(empId),
                dayKey,
                code,
            };
        });

        await axios.post('/save', payload);
        setDraftChanges(new Map());
    }, [draftChanges]);

    const dirtyKeys = useMemo(
        () => new Set(draftChanges.keys()),
        [draftChanges]
    );

    return {
        draftChanges,
        dirtyKeys,
        updateCells,
        save,
    };
}
