import { addMinutes, format, set, startOfDay } from 'date-fns';

export const START_HOUR = 5;
export const START_MINUTE = 0;
export const SLOT_DURATION = 10; // minutes
export const TOTAL_SLOTS = 144; // 24 hours

export const getSlotTime = (slotIndex: number) => {
  const baseDate = set(startOfDay(new Date()), {
    hours: START_HOUR,
    minutes: START_MINUTE,
    seconds: 0,
    milliseconds: 0,
  });
  return addMinutes(baseDate, slotIndex * SLOT_DURATION);
};

export const formatSlotTime = (slotIndex: number) => {
  return format(getSlotTime(slotIndex), 'HH:mm');
};

export const getSlotFromTime = (date: Date) => {
  const baseDate = set(startOfDay(date), {
    hours: START_HOUR,
    minutes: START_MINUTE,
    seconds: 0,
    milliseconds: 0,
  });
  
  let diff = (date.getTime() - baseDate.getTime()) / (1000 * 60);
  if (diff < 0) diff += 24 * 60; // Handle times before 5:30 AM as being in the "previous" day's cycle or just wrap
  
  return Math.floor(diff / SLOT_DURATION);
};

export const formatDuration = (slots: number) => {
  const totalMinutes = slots * SLOT_DURATION;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};
