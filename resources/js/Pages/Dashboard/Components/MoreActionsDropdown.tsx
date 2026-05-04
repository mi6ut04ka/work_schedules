import {useState, useRef, useEffect} from "react";
import {ChevronDownIcon} from "@heroicons/react/24/outline";

interface ActionItem {
    label: string;
    icon: any;
    onClick: () => void;
}

interface Props {
    actions: ActionItem[];
}

export default function MoreActionsDropdown({actions}: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;

        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const handleClick = (action: ActionItem) => {
        action.onClick();
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="h-8 flex items-center gap-1.5 px-2.5 text-xs font-medium rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors active:scale-95"
            >
                <ChevronDownIcon
                    className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                />
                Ещё
            </button>

            {open && (
                <div
                    className="absolute right-0 mt-1 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {actions.map((action, i) => {
                        const Icon = action.icon as React.ReactElement;

                        return (
                            <div key={`${i}_${action.label}`}>
                                <button
                                    onClick={() => handleClick(action)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-700 text-slate-300 transition-colors"
                                >
                                    <Icon className="w-3.5 h-3.5"/>
                                    {action.label}
                                </button>
                                {i !== actions.length - 1 && (
                                    <div className="h-px bg-slate-700 mx-2"/>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
