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
    <div className="flex flex-1 flex-col overflow-hidden bg-background p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Bubbles</h1>
          <p className="text-muted-foreground">Click to plan, drag to extend.</p>
        </div>
        <div className="flex gap-2">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 shadow-sm">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: task.color }} />
              <span className="text-xs font-medium">{task.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-6">
          {hours.map((hour, hourIdx) => (
            <div key={hourIdx} className="group flex items-center gap-6">
              <div className="w-16 text-right">
                <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
              
              <div className="grid flex-1 grid-cols-6 gap-4 rounded-3xl bg-accent/30 p-4 backdrop-blur-sm border border-border/50">
                {Array.from({ length: 6 }).map((_, minIdx) => {
                  const slotIndex = hourIdx * 6 + minIdx;
                  const block = getBlockAtSlot(slotIndex);
                  
                  return (
                    <div 
                      key={minIdx}
                      className="relative flex flex-col items-center gap-2"
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
                              "relative z-10 h-12 w-12 rounded-full border-2 transition-all duration-300 shadow-sm",
                              block 
                                ? "border-transparent shadow-md" 
                                : "border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
                            )}
                            style={{ 
                              backgroundColor: block ? tasks.find(t => t.id === block.taskId)?.color : 'transparent' 
                            }}
                          >
                            {!block && <Plus className="mx-auto h-4 w-4 text-muted-foreground/50" />}
                          </motion.button>
                        </Popover.Trigger>

                        <Popover.Portal>
                          <Popover.Content 
                            className="z-50 w-48 rounded-2xl border bg-popover p-2 shadow-xl animate-in fade-in zoom-in-95"
                            sideOffset={5}
                          >
                            <div className="grid gap-1">
                              <p className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {formatSlotTime(slotIndex)}
                              </p>
                              {block ? (
                                <button
                                  onClick={() => removeBlock(block.id)}
                                  className="flex w-full items-center rounded-xl px-2 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  Remove Task
                                </button>
                              ) : (
                                tasks.map(task => (
                                  <button
                                    key={task.id}
                                    onClick={() => handleBubbleClick(slotIndex, task.id)}
                                    className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-accent transition-colors"
                                  >
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: task.color }} />
                                    {task.name}
                                  </button>
                                ))
                              )}
                            </div>
                            <Popover.Arrow className="fill-popover" />
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                      
                      <span className="text-[10px] font-medium text-muted-foreground/60">
                        {minIdx * 10}m
                      </span>

                      {/* Visual connection for merged blocks */}
                      {block && slotIndex < block.endSlot - 1 && (
                        <div 
                          className="absolute left-1/2 top-6 -z-0 h-3 w-full"
                          style={{ 
                            backgroundColor: tasks.find(t => t.id === block.taskId)?.color,
                            width: 'calc(100% + 1rem)', // gap-4 is 1rem
                            transform: 'translateY(-50%)'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
