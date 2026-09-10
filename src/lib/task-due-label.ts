import type { TaskRow } from '@/lib/database-types';

/** Human label for a task's due date, matching the mockup's "Hoy" / "Esta semana" copy. */
export function taskDueLabel(task: Pick<TaskRow, 'due_date' | 'recurrence'>): string {
  if (!task.due_date) return task.recurrence !== 'none' ? 'Hoy' : 'Sin fecha';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${task.due_date}T00:00:00`);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (diffDays <= 0) return 'Hoy';
  if (diffDays <= 7) return 'Esta semana';
  return due.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}
