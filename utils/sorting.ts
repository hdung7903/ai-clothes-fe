/**
 * Interface for objects with sortText property
 */
interface SortableItem {
  sortText: string;
  [key: string]: any;
}

/**
 * Sorts an array of objects by their sortText property (numeric order)
 * @param items - Array of objects with sortText property
 * @param order - Sort order: 'asc' or 'desc'
 * @returns Sorted array
 */
export function sortBySortText<T extends SortableItem>(
  items: T[],
  order: "asc" | "desc" = "asc"
): T[] {
  return [...items].sort((a, b) => {
    const numA = parseFloat(a.sortText);
    const numB = parseFloat(b.sortText);

    // Handle non-numeric values
    if (isNaN(numA) && isNaN(numB)) return 0;
    if (isNaN(numA)) return 1;
    if (isNaN(numB)) return -1;

    return order === "asc" ? numA - numB : numB - numA;
  });
}
