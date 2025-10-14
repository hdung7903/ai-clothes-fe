import React, { useState, createContext, useContext, ReactNode } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

// Types
interface TreeContextType {
  selectedId: string | null;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  handleSelect: (id: string, data: Record<string, any>) => void;
}

interface TreeProps {
  children: ReactNode;
  onSelect?: (item: { id: string; data: Record<string, any> }) => void;
  className?: string;
}

interface TreeItemProps {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  level?: number;
  data?: Record<string, any>;
}

// Context for tree state management
const TreeContext = createContext<TreeContextType | null>(null);

const useTreeContext = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('Tree components must be used within a Tree');
  }
  return context;
};

// Main Tree component
export const Tree: React.FC<TreeProps> = ({ children, onSelect, className = '' }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelect = (id: string, data: Record<string, any>) => {
    setSelectedId(id);
    if (onSelect) {
      onSelect({ id, data });
    }
  };

  return (
    <TreeContext.Provider
      value={{ selectedId, expandedIds, toggleExpand, handleSelect }}
    >
      <div className={`select-none ${className}`}>{children}</div>
    </TreeContext.Provider>
  );
};

// TreeItem component
export const TreeItem: React.FC<TreeItemProps> = ({
  id,
  label,
  icon,
  children,
  level = 0,
  data = {},
}) => {
  const { selectedId, expandedIds, toggleExpand, handleSelect } = useTreeContext();
  
  const hasChildren = React.Children.count(children) > 0;
  const isExpanded = expandedIds.has(id);
  const isSelected = selectedId === id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleExpand(id);
    }
  };

  const handleClick = () => {
    handleSelect(id, { label, ...data });
    if (hasChildren && !isExpanded) {
      toggleExpand(id);
    }
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
          isSelected ? 'bg-accent' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <button
            onClick={handleToggle}
            className="flex items-center justify-center w-4 h-4 hover:bg-accent-foreground/10 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Icons removed by request */}
        <span className="text-sm truncate flex-1 min-w-0">{label}</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {React.Children.map(children, (child) => {
            if (React.isValidElement<TreeItemProps>(child)) {
              return React.cloneElement(child, {
                level: level + 1,
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};