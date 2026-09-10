import type { CategoryId } from '@/constants/theme';

export type FamilyMember = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  points: number;
  level: number;
  isYou?: boolean;
};

export type FamilyGroup = {
  id: string;
  name: string;
  memberCount: number;
  role: 'Administradora' | 'Administrador' | 'Miembro';
  active: boolean;
  pendingTasksLabel: string;
};

export type TaskFrequency = 'una_vez' | 'diaria' | 'semanal' | 'mensual';

export type Task = {
  id: string;
  title: string;
  categoryId: CategoryId;
  /** null = tarea abierta: cualquiera del grupo puede tomarla. */
  assigneeId: string | null;
  frequency: TaskFrequency;
  status: 'pendiente' | 'hecha';
  dueLabel: string;
};

export type Achievement = {
  id: string;
  label: string;
  unlocked: boolean;
};

export type SharedAccount = {
  id: string;
  name: string;
  monthTotalLabel: string;
  memberIds: string[];
  categoryId: CategoryId;
};

export type Expense = {
  id: string;
  merchant: string;
  dateLabel: string;
  splitCount: number;
  totalLabel: string;
};

export type ExpenseLineItem = {
  id: string;
  label: string;
  amountLabel: string;
  assigneeId: string;
};

export type ExpenseSplitShare = {
  memberId: string;
  amountLabel: string;
};

export type InvoiceDetail = {
  id: string;
  merchant: string;
  dateLabel: string;
  totalLabel: string;
  itemCount: number;
  items: ExpenseLineItem[];
  otherItemsLabel: string;
  otherItemsAmountLabel: string;
  splits: ExpenseSplitShare[];
};

export type NotificationType = 'tarea' | 'factura' | 'ranking' | 'recomendacion' | 'logro' | 'gasto';

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  timeLabel: string;
  unread: boolean;
};

export type CategoryBreakdownSlice = {
  categoryId: CategoryId;
  label: string;
  amountLabel: string;
  percent: number;
  color: string;
};

export type MonthlyTrendPoint = {
  label: string;
  amount: number;
  isCurrent?: boolean;
};
