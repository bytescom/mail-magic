import { useEffect } from "react";

/**
 * Locks document.body scroll while `isOpen` is true.
 * Restores original overflow on cleanup.
 */
export function useScrollLock(isOpen) {
    useEffect(() => {
        if (!isOpen) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = original; };
    }, [isOpen]);
}
