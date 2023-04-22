import { Menu, MenuItem } from "@mui/material";
import React from "react";

interface MoreOptionsMenuProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    items: {name: string, action: () => void}[];
}


export const MoreOptionsMenu: React.FC<MoreOptionsMenuProps> = ({anchorEl, setAnchorEl, items}) => {
    const open = Boolean(anchorEl);
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>, action: (event: React.MouseEvent<HTMLElement>) => void) => {
        action(event);
        handleClose();
    };
        
    return (
        
        <Menu
            id="long-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleClose}
        >
            {items.map((item) => (
                <MenuItem key={item.name} onClick={(event) => handleClick(event, item.action)}>
                    {item.name}
                </MenuItem>
            ))}
            
        </Menu>
    );
    };