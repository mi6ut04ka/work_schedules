import {FC, ReactNode, useEffect} from "react";
import {createPortal} from "react-dom";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl"
}

interface HeaderProps { className: string, children: ReactNode }
interface BodyProps { children: ReactNode }
interface FooterProps { children: ReactNode }


const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-5xl",
};

function ModalRoot({open, onClose, children, size = 'md'}: ModalProps) {

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return;

        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/10 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className={`relative bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-full ${sizeClasses[size]} mx-4`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}

export function ModalHeader({children, className = ""}: HeaderProps) {
    return (
        <div className={`absolute -top-3 left-3 backdrop-blur-[1px] text-slate-300  ${className}`}>
            {children}
        </div>
    );
}

export function ModalBody({children}: BodyProps) {
    return (
        <div className="p-4 text-sm text-slate-300">
            {children}
        </div>
    );
}

export function ModalFooter({children}: FooterProps) {
    return (
        <div className="px-4 py-3 border-t border-slate-700 flex justify-end gap-2">
            {children}
        </div>
    );
}

type ModalComponent = FC<ModalProps> & {
    Header: FC<HeaderProps>;
    Body: FC<BodyProps>;
    Footer: FC<FooterProps>;
};

const Modal = ModalRoot as ModalComponent;

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
