import * as React from "react";

// Hook reutilizable de drag & drop compatible con mouse y touch.
// Implementa HTML5 drag para desktop y un fallback por pointer events para móvil.
export function useDragAndDrop<T>() {
  const [draggedItem, setDraggedItem] = React.useState<T | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOverZone, setDragOverZone] = React.useState<string | null>(null);

  const dropHandlersRef = React.useRef(new Map<string, (item: T) => void>());
  const draggedRef = React.useRef<T | null>(null);
  const isPointerDragRef = React.useRef(false);

  const clear = React.useCallback(() => {
    draggedRef.current = null;
    isPointerDragRef.current = false;
    setDraggedItem(null);
    setIsDragging(false);
    setDragOverZone(null);
  }, []);

  React.useEffect(() => {
    const onPointerUp = () => {
      if (!isPointerDragRef.current) return;
      const item = draggedRef.current;
      const zone = dragOverZone;
      if (item && zone) {
        const fn = dropHandlersRef.current.get(zone);
        fn?.(item);
      }
      clear();
    };
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [clear, dragOverZone]);

  const startDrag = React.useCallback(
    (item: T) => {
      const onDragStart = (e: React.DragEvent) => {
        draggedRef.current = item;
        setDraggedItem(item);
        setIsDragging(true);
        try {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", "crm-dnd");
        } catch {
          // noop
        }
      };

      const onDragEnd = () => clear();

      const onPointerDown = (e: React.PointerEvent) => {
        // Pointer drag: útil en móvil (touch)
        if (e.pointerType === "touch") {
          isPointerDragRef.current = true;
          draggedRef.current = item;
          setDraggedItem(item);
          setIsDragging(true);
          // Evita scroll accidental durante el arrastre
          (e.target as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
        }
      };

      return {
        draggable: true,
        onDragStart,
        onDragEnd,
        onPointerDown,
      } as const;
    },
    [clear],
  );

  const registerDropZone = React.useCallback(
    (zoneId: string, onDropItem: (item: T) => void) => {
      dropHandlersRef.current.set(zoneId, onDropItem);

      const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverZone(zoneId);
      };

      const onDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverZone(zoneId);
      };

      const onDragLeave = () => {
        setDragOverZone((prev) => (prev === zoneId ? null : prev));
      };

      const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const item = draggedRef.current;
        if (item) onDropItem(item);
        clear();
      };

      const onPointerEnter = () => {
        if (!isPointerDragRef.current) return;
        setDragOverZone(zoneId);
      };

      const onPointerLeave = () => {
        if (!isPointerDragRef.current) return;
        setDragOverZone((prev) => (prev === zoneId ? null : prev));
      };

      return {
        onDragOver,
        onDragEnter,
        onDragLeave,
        onDrop,
        onPointerEnter,
        onPointerLeave,
      } as const;
    },
    [clear],
  );

  return { startDrag, registerDropZone, draggedItem, isDragging, dragOverZone };
}

