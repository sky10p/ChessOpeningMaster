import React, { useState, useEffect, useRef, useLayoutEffect } from "react";

interface ActionsMenuProps {
    anchorEl: HTMLElement | null;
    closeMenu: () => void;
    items: {name: string, action: () => void}[];
}


export const ActionsMenu: React.FC<ActionsMenuProps> = ({anchorEl, closeMenu, items}) => {
    const open = Boolean(anchorEl);
    const handleClose = () => {
        closeMenu();
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>, action: () => void) => {
        event.stopPropagation(); // Prevent the click from propagating to the document
        action();
        handleClose();
    };

    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    useLayoutEffect(() => {
        if (anchorEl && menuRef.current) {
            const rect = anchorEl.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();

            let newLeft = rect.left;
            let newTop = rect.bottom;
            const padding = 10; // 10px padding from edges


            if (rect.left + menuRect.width > window.innerWidth) {
                newLeft = window.innerWidth - menuRect.width - padding;
            }

            if (newLeft < padding) {
                newLeft = padding;
            }

            if (rect.bottom + menuRect.height > window.innerHeight) {
                newTop = rect.top - menuRect.height;
            }

            if (newTop < padding) {
                newTop = padding;
            }

            setPosition({
                top: newTop,
                left: newLeft,
            });
        }
    }, [anchorEl, items]);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                anchorEl &&
                !anchorEl.contains(event.target as Node)
            ) {
                handleClose();
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);
        
    return (
        open ? (
            <div 
                className="absolute bg-white border rounded shadow mt-2 z-50"
                style={{ top: position.top, left: position.left }}
                ref={menuRef}
                onMouseDown={(e) => e.stopPropagation()} // Prevent menu from closing when interacting
            >
                {items.map((item) => (
                    <div 
                        key={item.name} 
                        onClick={(event) => handleClick(event, item.action)} 
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    >
                        {item.name}
                    </div>
                ))}
            </div>
        ) : null
    );
};