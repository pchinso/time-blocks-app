import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimeBlock, Task } from '../types';

interface GridTemplate {
  id: string;
  name: string;
  createdAt: string;
  blocks: TimeBlock[];
  tasks: Task[];
}

interface BlockState {
  blocks: TimeBlock[];
  tasks: Task[];
  isRunningMode: boolean;
  blinkRate: number; // in seconds
  setRunningMode: (isRunning: boolean) => void;
  setBlinkRate: (rate: number) => void;
  templates: GridTemplate[];
  saveTemplate: (name: string) => string | null;
  loadTemplate: (id: string) => boolean;
  deleteTemplate: (id: string) => void;
  addBlock: (block: Omit<TimeBlock, 'id'>) => string | null;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<TimeBlock>) => boolean;
  extendBlock: (id: string, targetSlot: number) => boolean;
  isSlotAvailable: (start: number, end: number, excludeId?: string) => boolean;
  addTask: (name: string) => string;
  resetAll: () => void;
}

export const useBlockStore = create<BlockState>()(
  persist(
    (set, get) => ({
      blocks: [],
      tasks: [],
      isRunningMode: false,
      blinkRate: 1.5, // default 1.5 seconds
      templates: [],

      setRunningMode: (isRunning) => {
        set({ isRunningMode: isRunning });
      },

      setBlinkRate: (rate) => {
        set({ blinkRate: rate });
      },

      saveTemplate: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return null;
        const id = crypto.randomUUID();
        const snapshot: GridTemplate = {
          id,
          name: trimmed,
          createdAt: new Date().toISOString(),
          // Deep copy to avoid later mutations affecting template
          blocks: JSON.parse(JSON.stringify(get().blocks)),
          tasks: JSON.parse(JSON.stringify(get().tasks)),
        };
        set((state) => ({ templates: [snapshot, ...state.templates] }));
        return id;
      },

      loadTemplate: (id) => {
        const tpl = get().templates.find(t => t.id === id);
        if (!tpl) return false;
        // Replace current state with template snapshot
        set({
          tasks: JSON.parse(JSON.stringify(tpl.tasks)),
          blocks: JSON.parse(JSON.stringify(tpl.blocks)),
        });
        return true;
      },

      deleteTemplate: (id) => {
        set((state) => ({ templates: state.templates.filter(t => t.id !== id) }));
      },

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

      addTask: (name: string) => {
        const existing = get().tasks.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (existing) return existing.id;

        const id = crypto.randomUUID();
        const colors = [
          '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
          '#ef4444', '#06b6d4', '#f43f5e', '#84cc16',
          '#ec4899', '#6366f1', '#14b8a6', '#f97316'
        ];
        const color = colors[get().tasks.length % colors.length];
        
        const newTask = { id, name, color };
        set(state => ({ tasks: [...state.tasks, newTask] }));
        return id;
      },

      resetAll: () => {
        set({ blocks: [], tasks: [] });
      },
    }),
    {
      name: 'time-blocks-storage',
    }
  )
);
