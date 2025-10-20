import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"

// Standard Checkbox Component
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  description?: string
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked)
      }
    }

    return (
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {(label || description) && (
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                htmlFor={props.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

interface TreeItem {
  id: string
  name: string
  subCategories?: TreeItem[]
  parentCategoryId?: string | null
}

interface TreeCheckboxProps {
  data: TreeItem[]
  onSelectionChange?: (selectedIds: string[]) => void
}

const TreeCheckboxNode = ({
  item,
  level,
  expanded,
  checked,
  onToggleExpanded,
  onToggleChecked,
  getAllChildrenIds,
  isIndeterminate,
  isAllChildrenChecked
}: any) => {
  const hasChildren = item.subCategories && item.subCategories.length > 0
  const isOpen = expanded[item.id]
  const isCheckedState = checked[item.id]
  const isIndeterminateState = isIndeterminate(item)
  const allChildrenChecked = isAllChildrenChecked(item)

  return (
    <div>
      <div className={`flex items-center gap-2 py-1 px-2 hover:bg-accent hover:text-accent-foreground rounded text-sm`} style={{ marginLeft: `${level * 16}px` }}>
        {hasChildren && (
          <button
            onClick={() => onToggleExpanded(item.id)}
            className="p-0 w-4 h-4 flex items-center justify-center hover:bg-accent-foreground/10 rounded"
          >
            {isOpen ? (
              <ChevronDown size={14} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}

        <div className="relative w-5 h-5 flex items-center justify-center">
          <input
            type="checkbox"
            checked={isCheckedState || allChildrenChecked}
            onChange={() => onToggleChecked(item.id, item, hasChildren)}
            className="w-4 h-4 cursor-pointer accent-blue-600"
          />
          {(isIndeterminateState || (allChildrenChecked && !isCheckedState)) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2 h-0.5 bg-blue-600" />
            </div>
          )}
        </div>

        <span className={`flex-1 text-sm select-none cursor-pointer ${isCheckedState || allChildrenChecked ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
          {item.name}
        </span>
      </div>

      {hasChildren && isOpen && (
        <div>
          {item.subCategories.map((child: TreeItem) => (
            <TreeCheckboxNode
              key={child.id}
              item={child}
              level={level + 1}
              expanded={expanded}
              checked={checked}
              onToggleExpanded={onToggleExpanded}
              onToggleChecked={onToggleChecked}
              getAllChildrenIds={getAllChildrenIds}
              isIndeterminate={isIndeterminate}
              isAllChildrenChecked={isAllChildrenChecked}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const TreeCheckbox = ({ data, onSelectionChange }: TreeCheckboxProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const previousCheckedRef = useRef<Record<string, boolean>>({})
  const isInitialMount = useRef(true)

  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getAllChildrenIds = (item: TreeItem): string[] => {
    let ids: string[] = [item.id]
    if (item.subCategories && item.subCategories.length > 0) {
      item.subCategories.forEach((child: TreeItem) => {
        ids = ids.concat(getAllChildrenIds(child))
      })
    }
    return ids
  }

  const toggleChecked = (id: string, item: TreeItem, hasChildren: boolean) => {
    setChecked(prev => {
      const newChecked = { ...prev }
      const newState = !newChecked[id]
      
      if (hasChildren) {
        const allIds = getAllChildrenIds(item)
        allIds.forEach(childId => {
          newChecked[childId] = newState
        })
      }
      
      return newChecked
    })
  }

  // Memoize the callback to prevent infinite loops
  const memoizedOnSelectionChange = useCallback((selectedIds: string[]) => {
    if (onSelectionChange) {
      onSelectionChange(selectedIds)
    }
  }, [onSelectionChange])

  // Use useEffect to call onSelectionChange after state updates
  useEffect(() => {
    // Skip initial mount to prevent unnecessary callback
    if (isInitialMount.current) {
      isInitialMount.current = false
      previousCheckedRef.current = checked
      return
    }

    // Only call callback if checked state actually changed
    const hasChanged = JSON.stringify(checked) !== JSON.stringify(previousCheckedRef.current)
    if (hasChanged && memoizedOnSelectionChange) {
      const selectedIds = Object.keys(checked).filter(key => checked[key])
      memoizedOnSelectionChange(selectedIds)
      previousCheckedRef.current = checked
    }
  }, [checked, memoizedOnSelectionChange])

  const isIndeterminate = (item: TreeItem) => {
    if (!item.subCategories || !item.subCategories.length) return false
    const allChildIds = getAllChildrenIds(item).slice(1)
    if (allChildIds.length === 0) return false
    
    const childStates = allChildIds.map(id => checked[id])
    return childStates.some(state => state) && childStates.some(state => !state)
  }

  const isAllChildrenChecked = (item: TreeItem): boolean => {
    if (!item.subCategories || !item.subCategories.length) return false
    const allChildIds = getAllChildrenIds(item).slice(1)
    return allChildIds.length > 0 && allChildIds.every(id => checked[id])
  }

  return (
    <div className="w-full">
      <div className="space-y-0">
        {data.map(item => (
          <TreeCheckboxNode
            key={item.id}
            item={item}
            level={0}
            expanded={expanded}
            checked={checked}
            onToggleExpanded={toggleExpanded}
            onToggleChecked={toggleChecked}
            getAllChildrenIds={getAllChildrenIds}
            isIndeterminate={isIndeterminate}
            isAllChildrenChecked={isAllChildrenChecked}
          />
        ))}
      </div>
    </div>
  )
}

export { Checkbox, TreeCheckbox }