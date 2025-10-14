"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon} from "lucide-react"

import { cn } from "@/lib/utils"

// Types
interface TreeSelectContextType {
  selectedValue: string;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  handleSelect: (value: string, label: string) => void;
}

interface TreeSelectItemProps extends Omit<React.ComponentProps<typeof SelectPrimitive.Item>, 'value'> {
  value: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  level?: number;
}

// Context
const TreeSelectContext = React.createContext<TreeSelectContextType | null>(null);

const useTreeSelectContext = () => {
  const context = React.useContext(TreeSelectContext);
  if (!context) {
    throw new Error('TreeSelectItem must be used within TreeSelectContent');
  }
  return context;
};

// TreeSelectItem Component
function TreeSelectItem({
  className,
  children,
  value,
  icon,
  level = 0,
  ...props
}: TreeSelectItemProps) {
  const { selectedValue, expandedIds, toggleExpand, handleSelect } = useTreeSelectContext();
  
  const hasChildren = React.Children.count(children) > 0;
  const isExpanded = expandedIds.has(value);
  const isSelected = selectedValue === value;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (hasChildren) {
      toggleExpand(value);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only handle selection if it's not a parent with children or if it's a leaf node
    if (!hasChildren) {
      // Extract text content from children for the label
      const getTextContent = (node: React.ReactNode): string => {
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return String(node);
        if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
          return getTextContent(node.props.children);
        }
        if (Array.isArray(node)) {
          return node.map(getTextContent).join('');
        }
        return '';
      };

      const label = getTextContent(children);
      handleSelect(value, label);
    } else {
      // For parent nodes, just toggle expansion
      e.preventDefault();
      toggleExpand(value);
    }
  };

  return (
    <>
      <SelectPrimitive.Item
        value={value}
        data-slot="select-item"
        className={cn(
          "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        {...props}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={handleToggle}
            className="flex items-center justify-center w-4 h-4 hover:bg-accent-foreground/10 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-3 h-3" />
            ) : (
              <ChevronRightIcon className="w-3 h-3" />
            )}
          </button>
        )}
        
        {!hasChildren && <span className="w-4" />}
        
        <SelectPrimitive.ItemText>
          {typeof children === 'string' || typeof children === 'number' 
            ? children 
            : React.Children.toArray(children).find(child => 
                typeof child === 'string' || typeof child === 'number'
              )
          }
        </SelectPrimitive.ItemText>
      </SelectPrimitive.Item>

      {hasChildren && isExpanded && (
        <div>
          {React.Children.map(children, (child) => {
            if (React.isValidElement<TreeSelectItemProps>(child) && child.type === TreeSelectItem) {
              return React.cloneElement(child, {
                level: level + 1,
              });
            }
            return null;
          })}
        </div>
      )}
    </>
  );
}

// TreeSelectContent Component (wrapper for SelectContent with context)
interface TreeSelectContentProps extends React.ComponentProps<typeof SelectPrimitive.Content> {
  expandedIds?: Set<string>;
  toggleExpand?: (id: string) => void;
  handleSelect?: (value: string, label: string) => void;
}

function TreeSelectContent({
  className,
  children,
  position = "popper",
  expandedIds: propExpandedIds,
  toggleExpand: propToggleExpand,
  handleSelect: propHandleSelect,
  ...props
}: TreeSelectContentProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [selectedValue, setSelectedValue] = React.useState<string>("");

  const toggleExpand = (id: string) => {
    if (propToggleExpand) {
      propToggleExpand(id);
    } else {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }
  };

  const handleSelect = (value: string, label: string) => {
    setSelectedValue(value);
    if (propHandleSelect) {
      propHandleSelect(value, label);
    }
  };

  const currentExpandedIds = propExpandedIds || expandedIds;

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          <TreeSelectContext.Provider value={{ selectedValue, expandedIds: currentExpandedIds, toggleExpand, handleSelect }}>
            {children}
          </TreeSelectContext.Provider>
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// TreeSelect Component that integrates TreeSelectContent with Select
function TreeSelect({
  children,
  onValueChange,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

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

  const handleSelect = (value: string, label: string) => {
    if (onValueChange) {
      onValueChange(value);
    }
  };

  return (
    <SelectPrimitive.Root data-slot="select" onValueChange={onValueChange} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TreeSelectContent) {
          return React.cloneElement(child as React.ReactElement<any>, {
            expandedIds,
            toggleExpand,
            handleSelect,
          });
        }
        return child;
      })}
    </SelectPrimitive.Root>
  );
}

// Re-export original Select components
function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <ChevronDownIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  TreeSelect,
  TreeSelectContent,
  TreeSelectItem,
}