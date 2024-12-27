import React, { ReactElement } from 'react';

interface UiSwitchProps {
    label: string | ReactElement | ((enabled: boolean) => string | ReactElement);
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}

const UiSwitch: React.FC<UiSwitchProps> = ({ label, enabled, setEnabled }) => {
    return (
        <div className="flex items-center">
            <span className="mr-2">{typeof label === 'function' ? label(enabled) : label}</span>
            <button
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                    enabled ? 'bg-accent' : 'bg-gray-300'
                }`}
                onClick={() => setEnabled(!enabled)}
            >
                <span
                    className={`transform transition-transform ${
                        enabled ? 'translate-x-6 bg-white' : 'translate-x-1 bg-black'
                    } inline-block w-4 h-4 rounded-full`}
                />
            </button>
        </div>
    );
};

export default UiSwitch;
