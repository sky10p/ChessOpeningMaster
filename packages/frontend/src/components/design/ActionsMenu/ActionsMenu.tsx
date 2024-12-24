import React, { useState, useEffect, useRef } from "react";

interface ActionsMenuProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    items: {name: string, action: () => void}[];
}


export const ActionsMenu: React.FC<ActionsMenuProps> = ({anchorEl, setAnchorEl, items}) => {
    const open = Boolean(anchorEl);
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>, action: () => void) => {
        event.stopPropagation(); // Prevent the click from propagating to the document
        action();
        handleClose();
    };

    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    useEffect(() => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            setPosition({
                top: rect.bottom,
                left: rect.left,
            });
        }
    }, [anchorEl]);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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