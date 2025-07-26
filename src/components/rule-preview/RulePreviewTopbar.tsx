import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { RulesPath } from './RulesPath';
import { RulesPreviewActions } from './RulesPreviewActions';
import type { RulesContent } from '../../services/rules-builder/RulesBuilderTypes.ts';
import {
  type AIEnvironment,
  AIEnvironmentName,
  aiEnvironmentConfig,
} from '../../data/ai-environments.ts';
import RulesPreviewCopyDownloadActions from './RulesPreviewCopyDownloadActions.tsx';

interface RulePreviewTopbarProps {
  rulesContent: RulesContent[];
}

interface EnvironmentDropdownProps {
  selectedEnvironment: AIEnvironment;
  onSetSelectedEnvironment: (environment: AIEnvironment) => void;
}

const EnvironmentDropdown: React.FC<EnvironmentDropdownProps> = ({
  selectedEnvironment,
  onSetSelectedEnvironment,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (environment: AIEnvironment) => {
    onSetSelectedEnvironment(environment);
    setIsOpen(false);
  };

  const selectedConfig = aiEnvironmentConfig[selectedEnvironment];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center justify-between w-full sm:w-auto min-w-[180px] px-3 py-2 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select AI environment"
      >
        <span className="truncate">{selectedConfig?.displayName || 'Select Environment'}</span>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full sm:w-64 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          <ul role="listbox" className="py-1">
            {Object.values(AIEnvironmentName).map((environment) => {
              const config = aiEnvironmentConfig[environment];
              if (!config) return null;

              const isSelected = selectedEnvironment === environment;

              return (
                <li key={environment} role="option" aria-selected={isSelected}>
                  <button
                    onClick={() => handleOptionSelect(environment)}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${
                      isSelected ? 'bg-gray-700 text-white' : 'text-gray-300'
                    }`}
                  >
                    <span className="truncate">{config.displayName}</span>
                    {isSelected && <Check className="h-4 w-4 text-indigo-400 ml-2 flex-shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export const RulePreviewTopbar: React.FC<RulePreviewTopbarProps> = ({ rulesContent }) => {
  const { selectedEnvironment, setSelectedEnvironment, isHydrated } = useProjectStore();

  // If state hasn't been hydrated from storage yet, don't render the selector
  // This prevents the "blinking" effect when loading persisted state
  if (!isHydrated) {
    return (
      <div className="p-2 bg-gray-800 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 opacity-0">
          {/* Invisible placeholder content with the same structure to prevent layout shift */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="min-w-[180px] px-3 py-2 text-sm bg-gray-700 rounded-md"></div>
            <div className="text-sm text-gray-400 w-32 h-5"></div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="px-3 py-1 rounded-md"></div>
            <div className="px-3 py-1 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-gray-800 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start space-y-3 sm:space-y-0">
        {/* Left side: Environment selector dropdown and path */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Environment selector dropdown */}
          <EnvironmentDropdown
            selectedEnvironment={selectedEnvironment}
            onSetSelectedEnvironment={setSelectedEnvironment}
          />

          {/* Path display */}
          <RulesPath />
        </div>

        {/* Right side: Action buttons */}
        <div className="w-full sm:w-auto">
          <div className="flex flex-wrap gap-2 w-full">
            <RulesPreviewCopyDownloadActions rulesContent={rulesContent} />
            <RulesPreviewActions></RulesPreviewActions>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulePreviewTopbar;
