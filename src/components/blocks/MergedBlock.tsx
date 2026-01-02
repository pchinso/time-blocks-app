import React from 'react';
import { motion } from 'framer-motion';
import type { TimeBlock, Task } from '@/types';
import { cn } from '@/lib/utils';
import { formatSlotTime } from '@/lib/time-utils';

interface MergedBlockProps {
  block: TimeBlock;
  task?: Task;
  onRemove: (id: string) => void;
}

export const MergedBlock: React.FC<MergedBlockProps> = ({ block, task, onRemove }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }}
      style={{
        gridRowStart: block.startSlot + 1,
        gridRowEnd: block.endSlot + 1,
        backgroundColor: task?.color || '#94a3b8',
      }}
      className={cn(
        "relative z-10 flex flex-col overflow-hidden rounded-xl p-2 shadow-sm border-l-4 border-black/10",
        "group cursor-pointer hover:brightness-110 transition-all"
      )}
      onClick={() => onRemove(block.id)}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/90 uppercase tracking-wider">
          {task?.name || 'Task'}
        </span>
        <span className="text-[10px] font-medium text-white/70">
          {formatSlotTime(block.startSlot)}
        </span>
      </div>
      {block.endSlot - block.startSlot > 1 && (
        <div className="mt-1 text-[10px] text-white/80 truncate">
          {Math.round((block.endSlot - block.startSlot) * 10)} mins
        </div>
      )}
    </motion.div>
  );
};
