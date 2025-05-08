import React, { useState, useEffect, useMemo } from "react";
import { IRepertoireDashboard } from "@chess-opening-master/common";

interface RepertoireFilterDropdownProps {
  filteredRepertoires: IRepertoireDashboard[];
  orientationFilter: 'all' | 'white' | 'black';
  selectedRepertoires: string[];
  setSelectedRepertoires: React.Dispatch<React.SetStateAction<string[]>>;
}

export const RepertoireFilterDropdown: React.FC<RepertoireFilterDropdownProps> = ({
  filteredRepertoires,
  orientationFilter,
  selectedRepertoires,
  setSelectedRepertoires,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const filteredRepertoiresByOrientation = useMemo(() => {
    if (orientationFilter === 'all') {
      return filteredRepertoires;
    } else {
      return filteredRepertoires.filter(r => r.orientation === orientationFilter);
    }
  }, [filteredRepertoires, orientationFilter]);

  useEffect(() => {
    if (filteredRepertoiresByOrientation && filteredRepertoiresByOrientation.length > 0) {
      setSelectedRepertoires(filteredRepertoiresByOrientation.map(r => r._id));
    } else {
      setSelectedRepertoires([]);
    }
  }, [filteredRepertoiresByOrientation, setSelectedRepertoires]);

  const toggleRepertoireSelection = (repertoireId: string) => {
    setSelectedRepertoires(prev => {
      if (prev.includes(repertoireId)) {
        return prev.filter(id => id !== repertoireId);
      } else {
        return [...prev, repertoireId];
      }
    });
  };

  const selectAllRepertoires = () => {
    setSelectedRepertoires(filteredRepertoiresByOrientation.map(r => r._id));
  };

  const deselectAllRepertoires = () => {
    setSelectedRepertoires([]);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full bg-gray-800 text-gray-100 px-3 py-2 border border-gray-700 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out duration-150 text-xs sm:text-sm flex justify-between items-center"
      >
        <span>
          {selectedRepertoires.length === 0 
            ? 'No repertoires' 
            : selectedRepertoires.length === filteredRepertoiresByOrientation.length 
              ? `All ${orientationFilter !== 'all' ? orientationFilter : ''} repertoires`.trim() 
              : `${selectedRepertoires.length} repertoire(s)`}
        </span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {isDropdownOpen && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-700 flex justify-between">
            <button 
              onClick={() => { selectAllRepertoires(); }}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Select All
            </button>
            <button 
              onClick={() => { deselectAllRepertoires(); }}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Deselect All
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto p-2">
            {filteredRepertoiresByOrientation.length > 0 ? (
              filteredRepertoiresByOrientation.map(repertoire => (
                <div key={repertoire._id} className="flex items-center mb-2">
                  <input 
                    type="checkbox" 
                    id={`rep-${repertoire._id}`} 
                    checked={selectedRepertoires.includes(repertoire._id)}
                    onChange={() => toggleRepertoireSelection(repertoire._id)}
                    className="mr-2 form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <label htmlFor={`rep-${repertoire._id}`} className="text-gray-200 text-sm">
                    {repertoire.name}
                    <span className="ml-2 text-xs text-gray-400">
                      ({repertoire.orientation})
                    </span>
                  </label>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">No matching repertoires</div>
            )}
          </div>
          <div className="p-2 border-t border-gray-700">
            <button 
              onClick={() => setIsDropdownOpen(false)}
              className="w-full bg-blue-600 text-white py-1 rounded text-xs hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};