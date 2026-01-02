import React, { useState, useRef, useEffect } from 'react';
import { useBlockStore } from '@/store/useBlockStore';
import { TOTAL_SLOTS, formatSlotTime } from '@/lib/time-utils';
import { MergedBlock } from './MergedBlock';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const TimeGrid: React.FC = () => {
  const { blocks, tasks, addBlock, removeBlock, isSlotAvailable } = useBlockStore();
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (slotIndex: number) => {
    if (!isSlotAvailable(slotIndex, slotIndex + 1)) return;
    setSelection({ start: slotIndex, end: slotIndex + 1 });
    setIsDragging(true);
  };

  const handleMouseEnter = (slotIndex: number) => {
    if (!isDragging || !selection) return;
    
    const start = selection.start;
    const end = slotIndex >= start ? slotIndex + 1 : slotIndex;
    
    // Check if the entire range is available
    const rangeStart = Math.min(start, end);
    const rangeEnd = Math.max(start, end);
    
    if (isSlotAvailable(rangeStart, rangeEnd)) {
      setSelection({ start, end });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selection) {
      const startSlot = Math.min(selection.start, selection.end);
      const endSlot = Math.max(selection.start, selection.end);
      
      // Default to first task for now
      const taskId = tasks[0]?.id || '1';
      
      const id = addBlock({
        taskId,
        startSlot,
        endSlot,
      });

      if (id) {
        toast.success(`Block added: ${formatSlotTime(startSlot)} - ${formatSlotTime(endSlot)}`);
      } else {
        toast.error('Could not add block (overlap)');
      }
    }
    setIsDragging(false);
    setSelection(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) handleMouseUp();
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, selection]);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Today's Schedule</h1>
        <div className="flex space-x-2">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: task.color }} />
              <span className="text-xs text-muted-foreground">{task.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto pr-4 custom-scrollbar">
        <div 
          ref={gridRef}
          className="relative grid w-full"
          style={{ 
            gridTemplateRows: `repeat(${TOTAL_SLOTS}, minmax(40px, 1fr))`,
            gridTemplateColumns: '60px 1fr'
          }}
        >
          {/* Time Labels & Slots */}
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex items-start justify-end pr-4 pt-1 text-[10px] font-medium text-muted-foreground">
                {i % 3 === 0 ? formatSlotTime(i) : ''}
              </div>
              <div
                onMouseDown={() => handleMouseDown(i)}
                onMouseEnter={() => handleMouseEnter(i)}
                className={cn(
                  "relative border-t border-dashed border-border transition-colors",
                  i % 6 === 0 && "border-t-solid border-t-2",
                  "hover:bg-accent/50"
                )}
              />
            </React.Fragment>
          ))}

          {/* Selection Overlay */}
          {selection && (
            <div
              className="absolute right-0 z-20 rounded-xl bg-primary/20 border-2 border-primary/50 pointer-events-none"
              style={{
                gridColumnStart: 2,
                gridRowStart: Math.min(selection.start, selection.end) + 1,
                gridRowEnd: Math.max(selection.start, selection.end) + 1,
              }}
            />
          )}

          {/* Rendered Blocks */}
          {blocks.map(block => (
            <div 
              key={block.id}
              style={{
                gridColumnStart: 2,
                gridRowStart: block.startSlot + 1,
                gridRowEnd: block.endSlot + 1,
              }}
              className="relative z-10 p-[1px]"
            >
              <MergedBlock 
                block={block} 
                task={tasks.find(t => t.id === block.taskId)}
                onRemove={removeBlock}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
