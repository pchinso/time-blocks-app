import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useBlockStore } from '@/store/useBlockStore';
import { formatSlotTime, START_HOUR, formatDuration } from '@/lib/time-utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import * as Popover from '@radix-ui/react-popover';
import { Plus, Trash2, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';

interface BubbleProps {
  slotIndex: number;
  tasks: any[];
  block: any;
  onDragStart: (e: React.DragEvent, blockId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, slotIndex: number) => void;
  handleBubbleClick: (slotIndex: number, taskId: string) => void;
  removeBlock: (id: string) => void;
  addTask: (name: string) => string;
}

const Bubble: React.FC<BubbleProps> = React.memo(({
  slotIndex,
  tasks,
  block,
  onDragStart,
  onDragOver,
  onDrop,
  handleBubbleClick,
  removeBlock,
  addTask,
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const isStart = block && block.startSlot === slotIndex;
  const task = block ? tasks.find(t => t.id === block.taskId) : null;

  return (
    <div 
      className="relative flex flex-col items-center"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, slotIndex)}
    >
      {isStart && task && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="whitespace-nowrap rounded bg-background/90 px-1.5 py-0.5 text-[9px] font-bold text-foreground shadow-sm border border-border/50 backdrop-blur-sm">
            {task.name}
          </span>
        </div>
      )}
      <Popover.Root>
        <Popover.Trigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            draggable={!!block}
            onDragStart={(e) => block && onDragStart(e as unknown as React.DragEvent, block.id)}
            className={cn(
              "relative z-10 h-[26px] w-[26px] rounded-full border transition-all duration-300 shadow-sm",
              block 
                ? "border-transparent shadow-sm" 
                : "border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
            )}
            style={{ 
              backgroundColor: block ? tasks.find(t => t.id === block.taskId)?.color : 'transparent' 
            }}
          >
            {!block && <Plus className="mx-auto h-2.5 w-2.5 text-muted-foreground/40" />}
            {isStart && (
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white pointer-events-none tracking-tighter">
                {formatSlotTime(slotIndex)}
              </span>
            )}
          </motion.button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content 
            className="z-50 w-40 rounded-lg border bg-popover p-2 shadow-lg animate-in fade-in zoom-in-95"
            sideOffset={2}
          >
            <div className="grid gap-2">
              <p className="px-1 py-0.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {formatSlotTime(slotIndex)}
              </p>
              {block ? (
                <button
                  onClick={() => removeBlock(block.id)}
                  className="flex w-full items-center rounded px-2 py-1.5 text-[13px] text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Remove
                </button>
              ) : (
                <>
                  {tasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => handleBubbleClick(slotIndex, task.id)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[13px] hover:bg-accent transition-colors"
                    >
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: task.color }} />
                      {task.name}
                    </button>
                  ))}
                  <div className="mt-1 border-t border-border/50 pt-2">
                    <input
                      type="text"
                      placeholder="New..."
                      className="w-full rounded border border-border/50 bg-background px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTaskName.trim()) {
                          const taskId = addTask(newTaskName.trim());
                          handleBubbleClick(slotIndex, taskId);
                          setNewTaskName('');
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Visual connection for merged blocks */}
      {block && slotIndex < block.endSlot - 1 && (
        <div 
          className="absolute left-1/2 top-[13px] -z-0 h-2 w-full"
          style={{ 
            backgroundColor: tasks.find(t => t.id === block.taskId)?.color,
            width: 'calc(100% + 0.25rem)', // gap-1 is 0.25rem
            transform: 'translateY(-50%)'
          }}
        />
      )}
    </div>
  );
});

interface HourRowProps {
  hour: number;
  hourIdx: number;
  tasks: any[];
  blocks: any[];
  onDragStart: (e: React.DragEvent, blockId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, slotIndex: number) => void;
  handleBubbleClick: (slotIndex: number, taskId: string) => void;
  removeBlock: (id: string) => void;
  addTask: (name: string) => string;
}

const HourRow: React.FC<HourRowProps> = React.memo(({
  hour,
  hourIdx,
  tasks,
  blocks,
  onDragStart,
  onDragOver,
  onDrop,
  handleBubbleClick,
  removeBlock,
  addTask,
}) => {
  return (
    <div className="group flex items-center gap-1.5">
      <div className="w-8 text-right">
        <span className="text-[13px] font-bold text-muted-foreground">
          {hour.toString().padStart(2, '0')}
        </span>
      </div>
      
      <div className="grid flex-1 grid-cols-6 gap-1 rounded-xl bg-accent/20 p-1 border border-border/40">
        {Array.from({ length: 6 }).map((_, minIdx) => {
          const slotIndex = hourIdx * 6 + minIdx;
          const block = blocks.find(b => slotIndex >= b.startSlot && slotIndex < b.endSlot);
          return (
            <Bubble
              key={minIdx}
              slotIndex={slotIndex}
              tasks={tasks}
              block={block}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              handleBubbleClick={handleBubbleClick}
              removeBlock={removeBlock}
              addTask={addTask}
            />
          );
        })}
      </div>
    </div>
  );
});

export const BubbleGrid: React.FC = () => {
  const { blocks, tasks, addBlock, removeBlock, extendBlock, addTask, resetAll } = useBlockStore();
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const hours = useMemo(() => Array.from({ length: 24 }).map((_, i) => (START_HOUR + i) % 24), []);
  const morningHours = useMemo(() => hours.slice(0, 12), [hours]);
  const eveningHours = useMemo(() => hours.slice(12, 24), [hours]);

  const getTaskTotalTime = useCallback((taskId: string) => {
    const totalSlots = blocks
      .filter(b => b.taskId === taskId)
      .reduce((acc, b) => acc + (b.endSlot - b.startSlot), 0);
    return formatDuration(totalSlots);
  }, [blocks]);

  const handleBubbleClick = useCallback((slotIndex: number, taskId: string) => {
    const existingBlock = blocks.find(b => slotIndex >= b.startSlot && slotIndex < b.endSlot);
    if (existingBlock) return;

    const id = addBlock({
      taskId,
      startSlot: slotIndex,
      endSlot: slotIndex + 1,
    });

    if (id) {
      toast.success(`Task added at ${formatSlotTime(slotIndex)}`);
    }
  }, [blocks, addBlock]);

  const onDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.setData('blockId', blockId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    const blockId = e.dataTransfer.getData('blockId') || draggedBlockId;
    if (!blockId) return;

    const success = extendBlock(blockId, slotIndex);
    if (success) {
      toast.success('Task extended');
    } else {
      toast.error('Cannot extend task (overlap)');
    }
    setDraggedBlockId(null);
  }, [draggedBlockId, extendBlock]);

  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset all blocks and categories?')) {
      resetAll();
      toast.success('All data cleared');
    }
  }, [resetAll]);

  const handleExportPDF = useCallback(async () => {
    if (!gridRef.current) {
      toast.error('Grid element not found');
      return;
    }

    const toastId = toast.loading('Preparing high-resolution PDF...');

    try {
      const element = gridRef.current;
      
      // Use html-to-image which handles modern CSS (oklch, oklab) much better
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
      });

      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [img.width / 2, img.height / 2]
      });

      pdf.addImage(
        dataUrl, 
        'PNG', 
        0, 
        0, 
        img.width / 2, 
        img.height / 2,
        undefined,
        'FAST'
      );
      
      pdf.save(`daily-bubbles-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF exported successfully', { id: toastId });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId });
    }
  }, []);

  return (
    <div className="flex h-full w-full flex-col bg-background pt-4 px-3 pb-3 overflow-hidden">
      <div className="mb-2 px-2 flex items-center justify-end gap-1 lg:gap-2">
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-1 lg:gap-2 rounded-lg px-2 lg:px-3 py-1.5 text-[12px] lg:text-[14px] font-bold text-primary hover:bg-primary/10 transition-colors border border-primary/20 shadow-sm"
        >
          <Printer className="h-3 lg:h-4 w-3 lg:w-4" />
          <span className="hidden sm:inline">Export PDF</span>
          <span className="sm:hidden">PDF</span>
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 lg:gap-2 rounded-lg px-2 lg:px-3 py-1.5 text-[12px] lg:text-[14px] font-bold text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20 shadow-sm"
        >
          <Trash2 className="h-3 lg:h-4 w-3 lg:w-4" />
          <span className="hidden sm:inline">Reset All</span>
          <span className="sm:hidden">Reset</span>
        </button>
      </div>

      <div ref={gridRef} className="flex flex-1 flex-col lg:grid lg:grid-cols-[1fr_1fr_140px] gap-x-4 gap-y-4 lg:gap-y-0 overflow-y-auto lg:overflow-hidden bg-background p-2 lg:p-4 rounded-xl">
        {/* Morning Column */}
        <div className="flex flex-col gap-y-1 pt-2 lg:pt-6 px-2 lg:px-0 min-h-min">
          {morningHours.map((hour, i) => (
            <HourRow
              key={i}
              hour={hour}
              hourIdx={i}
              tasks={tasks}
              blocks={blocks}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              handleBubbleClick={handleBubbleClick}
              removeBlock={removeBlock}
              addTask={addTask}
            />
          ))}
        </div>

        {/* Evening Column */}
        <div className="flex flex-col gap-y-1 pt-2 lg:pt-6 px-2 lg:px-0 min-h-min">
          {eveningHours.map((hour, i) => (
            <HourRow
              key={i + 12}
              hour={hour}
              hourIdx={i + 12}
              tasks={tasks}
              blocks={blocks}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              handleBubbleClick={handleBubbleClick}
              removeBlock={removeBlock}
              addTask={addTask}
            />
          ))}
        </div>

        {/* Categories Column */}
        <div className="flex flex-col gap-y-0.5 overflow-hidden lg:overflow-y-auto pl-0 lg:pl-3 border-l-0 lg:border-l border-border/80 pt-2 lg:pt-6 px-2 lg:px-0 min-h-min">
          <h2 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Categories</h2>
          {tasks.map(task => (
            <div key={task.id} className="flex flex-col gap-0 rounded-md border bg-card p-0.5 px-1 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1">
                <div className="h-1 w-1 rounded-full" style={{ backgroundColor: task.color }} />
                <span className="text-[9px] font-bold truncate">{task.name}</span>
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground ml-2">
                {getTaskTotalTime(task.id)}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-[12px] text-muted-foreground italic leading-tight p-1">
              No categories yet. Click a bubble to add one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
