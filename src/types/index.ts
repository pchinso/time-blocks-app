export interface TimeBlock {
  id: string;
  taskId: string;
  startSlot: number; // 0-143 (10-min intervals from 5:30 AM)
  endSlot: number;   // startSlot + durationInSlots
  color?: string;
}

export interface Task {
  id: string;
  name: string;
  color: string;
}
