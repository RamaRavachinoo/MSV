import { getDaysInMonth, format } from 'date-fns';

export const currentPeriod = () => format(new Date(), 'yyyy-MM');

export const dueDateThisMonth = (dueDay) => {
    const now = new Date();
    const clampedDay = Math.min(dueDay, getDaysInMonth(now));
    return new Date(now.getFullYear(), now.getMonth(), clampedDay);
};
