import { format, startOfWeek, parseISO } from 'date-fns';

export const toWeekDay = (date) => {
  return format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), "yy-'Week'-ww");
};
