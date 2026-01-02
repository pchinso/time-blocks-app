import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimeBlock, Task } from '../types';

interface BlockState {
  blocks: TimeBlock[];
  tasks: Task[];
  addBlock: (block: Omit<TimeBlock, 'id'>) => string | null;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<TimeBlock>) => boolean;
  extendBlock: (id: string, targetSlot: number) => boolean;
  isSlotAvailable: (start: number, end: number, excludeId?: string) => boolean;
  addTask: (task: Task) => void;
}

export const useBlockStore = create<BlockState>()(
  persist(
    (set, get) => ({
      blocks: [],
      tasks: [
        { id: '1', name: 'Work', color: '#3b82f6' },
        { id: '2', name: 'Rest', color: '#10b981' },
        { id: '3', name: 'Exercise', color: '#f59e0b' },
        { id: '4', name: 'Learning', color: '#8b5cf6' },
      ],

      isSlotAvailable: (start, end, excludeId) => {
        return !get().blocks.some((block) => {
          if (excludeId && block.id === excludeId) return false;
          return start < block.endSlot && end > block.startSlot;
        });
      },

      addBlock: (newBlock) => {
        if (!get().isSlotAvailable(newBlock.startSlot, newBlock.endSlot)) {
          return null;
        }
        const id = crypto.randomUUID();
        set((state) => ({
          blocks: [...state.blocks, { ...newBlock, id }],
        }));
        return id;
      },

      removeBlock: (id) => {
        set((state) => ({
          blocks: state.blocks.filter((b) => b.id !== id),
        }));
      },

      updateBlock: (id, updates) => {
        const current = get().blocks.find((b) => b.id === id);
        if (!current) return false;

        const nextStart = updates.startSlot ?? current.startSlot;
        const nextEnd = updates.endSlot ?? current.endSlot;

        if (!get().isSlotAvailable(nextStart, nextEnd, id)) {
          return false;
        }

        set((state) => ({
          blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
        return true;
      },

      extendBlock: (id, targetSlot) => {
        const current = get().blocks.find((b) => b.id === id);
        if (!current) return false;

        const newStart = Math.min(current.startSlot, targetSlot);
        const newEnd = Math.max(current.endSlot, targetSlot + 1);

        if (!get().isSlotAvailable(newStart, newEnd, id)) {
          return false;
        }

        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, startSlot: newStart, endSlot: newEnd } : b
          ),
        }));
        return true;
      },

      addTask: (task) => {
        set((state) => ({
          tasks: [...state.tasks, task],
        }));
      },
    }),
    {
      name: 'time-blocks-storage',
    }
  )
);
