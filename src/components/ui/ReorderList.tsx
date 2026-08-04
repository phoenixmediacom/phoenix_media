import { useState, type ReactNode } from "react";

interface ReorderListProps<T extends { id: string }> {
  items: T[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, dragHandleProps: { draggable: boolean }) => ReactNode;
}

/**
 * Native HTML5 drag-and-drop reordering — no external dependency needed.
 * Works identically in LTR and RTL since it operates on vertical list
 * order, not horizontal direction.
 */
export function ReorderList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: ReorderListProps<T>) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }
    const ids = items.map((i) => i.id);
    const fromIndex = ids.indexOf(draggingId);
    const toIndex = ids.indexOf(targetId);
    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, draggingId);
    onReorder(ids);
    setDraggingId(null);
    setOverId(null);
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          draggable
          onDragStart={() => setDraggingId(item.id)}
          onDragOver={(e) => {
            e.preventDefault();
            setOverId(item.id);
          }}
          onDragLeave={() => setOverId((current) => (current === item.id ? null : current))}
          onDrop={() => handleDrop(item.id)}
          onDragEnd={() => {
            setDraggingId(null);
            setOverId(null);
          }}
          className={`rounded-lg transition-colors ${
            overId === item.id && draggingId !== item.id
              ? "ring-2 ring-primary"
              : ""
          } ${draggingId === item.id ? "opacity-40" : ""}`}
        >
          {renderItem(item, { draggable: true })}
        </li>
      ))}
    </ul>
  );
}
