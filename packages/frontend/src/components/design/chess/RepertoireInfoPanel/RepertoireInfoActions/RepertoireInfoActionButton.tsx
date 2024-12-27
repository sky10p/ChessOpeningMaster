import React from "react";

interface RepertoireInfoActionButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    icon: React.ReactElement;
    label?: string;
    className?: string;
}

export const RepertoireInfoActionButton: React.FC<RepertoireInfoActionButtonProps> = ({
    onClick,
    icon,
    label,
    className,
}) => {
    return (
        <div className={`flex flex-col items-center ${className}`}>
            <button onClick={onClick} className="text-gray-700 my-2">
                {icon}
            </button>
            {label && <span className="text-xs text-center truncate">{label}</span>}
        </div>
    );
};