import {useEffect} from "react";

export default function useColumnHighlightStyle(highlightedCol: string | null) {
    useEffect(() => {
        const el = document.getElementById("col-hl-style") ??
            (() => {
                const s = document.createElement("style");
                s.id = "col-hl-style";
                document.head.appendChild(s);
                return s;
            })();

        el.textContent = highlightedCol
            ? `.cell[data-day="${highlightedCol}"] { background: rgba(59,130,246,0.18) !important; }`
            : "";
    }, [highlightedCol]);
}
