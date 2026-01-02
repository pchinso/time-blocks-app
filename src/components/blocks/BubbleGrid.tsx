import React, { useState } from 'react';
import { useBlockStore } from '@/store/useBlockStore';
import { TOTAL_SLOTS, formatSlotTime, START_HOUR } from '@/lib/time-utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import * as Popover from '@radix-ui/react-popover';
import { Plus } from 'lucide-react';

export const BubbleGrid: React.FC = () => {
  const { blocks, tasks, addBlock, removeBlock, extendBlock, isSlotAvailable } = useBlockStore();
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const hours = Array.from({ length: 24 }).map((_, i) => (START_HOUR + i) % 24);
  const morningHours = hours.slice(0, 12);
  const eveningHours = hours.slice(12, 24);

  const getBlockAtSlot = (slotIndex: number) => {
    return blocks.find(b => slotIndex >= b.startSlot && slotIndex < b.endSlot);
  };

  const handleBubbleClick = (slotIndex: number, taskId: string) => {
    const existingBlock = getBlockAtSlot(slotIndex);
    if (existingBlock) return;

    const id = addBlock({
      taskId,
      startSlot: slotIndex,
      endSlot: slotIndex + 1,
    });

    if (id) {
      toast.success(`Task added at ${formatSlotTime(slotIndex)}`);
    }
  };

  const onDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.setData('blockId', blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, slotIndex: number) => {
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
  };

  return (
    <div className="flex h-full w-full flex-col bg-background p-2 overflow-hidden" style={{ maxWidth: '800px', maxHeight: '500px' }}>
      <div className="mb-2 flex items-center justify-between px-2">
        <h1 className="text-lg font-bold tracking-tight">Daily Bubbles</h1>
        <div className="flex gap-1">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: task.color }} />
              <span className="text-[10px] font-medium">{task.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-x-2 overflow-hidden">
        {/* Morning Column */}
        <div className="flex flex-col gap-y-0.5">
          {morningHours.map((hour, i) => {
            const hourIdx = i;
            return (
              <div key={hourIdx} className="group flex items-center gap-1.5">
                <div className="w-6 text-right">
                  <span className="text-[9px] font-bold text-muted-foreground">
                    {hour.toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="grid flex-1 grid-cols-6 gap-0.5 rounded-lg bg-accent/10 p-1 border border-border/20">
                  {Array.from({ length: 6 }).map((_, minIdx) => {
                    const slotIndex = hourIdx * 6 + minIdx;
                    const block = getBlockAtSlot(slotIndex);
                    
                    return (
                      <div 
                        key={minIdx}
                        className="relative flex flex-col items-center"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, slotIndex)}
                      >
                        <Popover.Root>
                          <Popover.Trigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              draggable={!!block}
                              onDragStart={(e) => block && onDragStart(e, block.id)}
                              className={cn(
                                "relative z-10 h-5 w-5 rounded-full border transition-all duration-300 shadow-sm",
                                block 
                                  ? "border-transparent shadow-sm" 
                                  : "border-dashed border-muted-foreground/10 hover:border-primary/50 hover:bg-primary/5"
                              )}
                              style={{ 
                                backgroundColor: block ? tasks.find(t => t.id === block.taskId)?.color : 'transparent' 
                              }}
                            >
                              {!block && <Plus className="mx-auto h-1.5 w-1.5 text-muted-foreground/20" />}
                            </motion.button>
                          </Popover.Trigger>

                          <Popover.Portal>
                            <Popover.Content 
                              className="z-50 w-32 rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in zoom-in-95"
                              sideOffset={2}
                            >
                              <div className="grid gap-0.5">
                                <p className="px-1 py-0.5 text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
                                  {formatSlotTime(slotIndex)}
                                </p>
                                {block ? (
                                  <button
                                    onClick={() => removeBlock(block.id)}
                                    className="flex w-full items-center rounded px-1 py-0.5 text-[10px] text-destructive hover:bg-destructive/10 transition-colors"
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  tasks.map(task => (
                                    <button
                                      key={task.id}
                                      onClick={() => handleBubbleClick(slotIndex, task.id)}
                                      className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-[10px] hover:bg-accent transition-colors"
                                    >
                                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: task.color }} />
                                      {task.name}
                                    </button>
                                  ))
                                )}
                              </div>
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>

                        {/* Visual connection for merged blocks */}
                        {block && slotIndex < block.endSlot - 1 && (
                          <div 
                            className="absolute left-1/2 top-2.5 -z-0 h-1 w-full"
                            style={{ 
                              backgroundColor: tasks.find(t => t.id === block.taskId)?.color,
                              width: 'calc(100% + 0.125rem)', // gap-0.5 is 0.125rem
                              transform: 'translateY(-50%)'
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Evening Column */}
        <div className="flex flex-col gap-y-0.5">
          {eveningHours.map((hour, i) => {
            const hourIdx = i + 12;
            return (
              <div key={hourIdx} className="group flex items-center gap-1.5">
                <div className="w-6 text-right">
                  <span className="text-[9px] font-bold text-muted-foreground">
                    {hour.toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="grid flex-1 grid-cols-6 gap-0.5 rounded-lg bg-accent/10 p-1 border border-border/20">
                  {Array.from({ length: 6 }).map((_, minIdx) => {
                    const slotIndex = hourIdx * 6 + minIdx;
                    const block = getBlockAtSlot(slotIndex);
                    
                    return (
                      <div 
                        key={minIdx}
                        className="relative flex flex-col items-center"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, slotIndex)}
                      >
                        <Popover.Root>
                          <Popover.Trigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              draggable={!!block}
                              onDragStart={(e) => block && onDragStart(e, block.id)}
                              className={cn(
                                "relative z-10 h-5 w-5 rounded-full border transition-all duration-300 shadow-sm",
                                block 
                                  ? "border-transparent shadow-sm" 
                                  : "border-dashed border-muted-foreground/10 hover:border-primary/50 hover:bg-primary/5"
                              )}
                              style={{ 
                                backgroundColor: block ? tasks.find(t => t.id === block.taskId)?.color : 'transparent' 
                              }}
                            >
                              {!block && <Plus className="mx-auto h-1.5 w-1.5 text-muted-foreground/20" />}
                            </motion.button>
                          </Popover.Trigger>

                          <Popover.Portal>
                            <Popover.Content 
                              className="z-50 w-32 rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in zoom-in-95"
                              sideOffset={2}
                            >
                              <div className="grid gap-0.5">
                                <p className="px-1 py-0.5 text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
                                  {formatSlotTime(slotIndex)}
                                </p>
                                {block ? (
                                  <button
                                    onClick={() => removeBlock(block.id)}
                                    className="flex w-full items-center rounded px-1 py-0.5 text-[10px] text-destructive hover:bg-destructive/10 transition-colors"
                                  >
                                    Remove
                                  </button>
                                ) : (
                                  tasks.map(task => (
                                    <button
                                      key={task.id}
                                      onClick={() => handleBubbleClick(slotIndex, task.id)}
                                      className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-[10px] hover:bg-accent transition-colors"
                                    >
                                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: task.color }} />
                                      {task.name}
                                    </button>
                                  ))
                                )}
                              </div>
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>

                        {/* Visual connection for merged blocks */}
                        {block && slotIndex < block.endSlot - 1 && (
                          <div 
                            className="absolute left-1/2 top-2.5 -z-0 h-1 w-full"
                            style={{ 
                              backgroundColor: tasks.find(t => t.id === block.taskId)?.color,
                              width: 'calc(100% + 0.125rem)', // gap-0.5 is 0.125rem
                              transform: 'translateY(-50%)'
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
