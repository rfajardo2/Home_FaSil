/**
 * Example data for the Familia García group — mirrors the approved mockup
 * exactly (same names, numbers and copy) so the built screens are a
 * faithful port. Swap this module for real Supabase queries later; every
 * screen only reads from these exported constants, so that's the only
 * file that needs to change.
 */

import { AccentColors } from '@/constants/theme';
import type {
  Achievement,
  Expense,
  FamilyGroup,
  FamilyMember,
  InvoiceDetail,
  MonthlyTrendPoint,
  NotificationItem,
  SharedAccount,
  Task,
} from '@/types';

export const MEMBERS: FamilyMember[] = [
  { id: 'valentina', name: 'Valentina', initials: 'V', avatarColor: AccentColors.avatar1, points: 320, level: 4, isYou: true },
  { id: 'andres', name: 'Andrés', initials: 'A', avatarColor: AccentColors.avatar2, points: 275, level: 3 },
  { id: 'mateo', name: 'Mateo', initials: 'M', avatarColor: AccentColors.avatar3, points: 190, level: 2 },
  { id: 'sofia', name: 'Sofía', initials: 'S', avatarColor: AccentColors.avatar4, points: 480, level: 5 },
];

export const GROUPS: FamilyGroup[] = [
  { id: 'garcia', name: 'Familia García', memberCount: 4, role: 'Administradora', active: true, pendingTasksLabel: '3 tareas pendientes hoy' },
  { id: 'playa', name: 'Casa de Playa', memberCount: 3, role: 'Miembro', active: false, pendingTasksLabel: 'Sin tareas pendientes' },
];

export const TASKS: Task[] = [
  { id: 't1', title: 'Lavar los platos', categoryId: 'cocina', assigneeId: 'andres', frequency: 'diaria', status: 'pendiente', dueLabel: 'Hoy' },
  { id: 't2', title: 'Sacar la basura', categoryId: 'limpieza', assigneeId: 'mateo', frequency: 'diaria', status: 'hecha', dueLabel: 'Hoy' },
  { id: 't3', title: 'Pagar factura de luz', categoryId: 'servicios', assigneeId: 'valentina', frequency: 'una_vez', dueLabel: 'Hoy', status: 'pendiente' },
  { id: 't4', title: 'Decorar para el cumpleaños', categoryId: 'eventos', assigneeId: null, frequency: 'una_vez', status: 'pendiente', dueLabel: 'Esta semana' },
  { id: 't5', title: 'Revisar filtro de agua', categoryId: 'mantenimiento', assigneeId: 'andres', frequency: 'mensual', status: 'pendiente', dueLabel: 'Esta semana' },
  { id: 't6', title: 'Cumpleaños de Sofía', categoryId: 'eventos', assigneeId: null, frequency: 'una_vez', status: 'pendiente', dueLabel: 'Esta semana' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', label: 'Racha x7', unlocked: true },
  { id: 'a2', label: 'Madrugador', unlocked: true },
  { id: 'a3', label: 'Cocinero pro', unlocked: true },
  { id: 'a4', label: '100 tareas', unlocked: false },
  { id: 'a5', label: 'Ahorrador', unlocked: false },
  { id: 'a6', label: 'Team player', unlocked: false },
];

export const SHARED_ACCOUNTS: SharedAccount[] = [
  { id: 'mercado', name: 'Mercado', monthTotalLabel: '$210.000 este mes', memberIds: ['valentina', 'andres', 'mateo'], categoryId: 'cocina' },
  { id: 'servicios', name: 'Servicios', monthTotalLabel: '$340.000 este mes', memberIds: ['valentina', 'andres', 'sofia'], categoryId: 'servicios' },
];

export const RECENT_EXPENSES: Expense[] = [
  { id: 'e1', merchant: 'Supermercado La Colonia', dateLabel: 'Hoy', splitCount: 3, totalLabel: '$96.000' },
  { id: 'e2', merchant: 'Factura de luz', dateLabel: 'Ayer', splitCount: 4, totalLabel: '$84.000' },
  { id: 'e3', merchant: 'Internet y cable', dateLabel: 'Lunes', splitCount: 4, totalLabel: '$60.000' },
];

export const INVOICE_DETAIL: InvoiceDetail = {
  id: 'e1',
  merchant: 'Supermercado La Colonia',
  dateLabel: 'Hoy · 18:32',
  totalLabel: '$96.000',
  itemCount: 12,
  items: [
    { id: 'i1', label: 'Arroz x2', amountLabel: '$8.000', assigneeId: 'valentina' },
    { id: 'i2', label: 'Leche x3', amountLabel: '$12.000', assigneeId: 'andres' },
    { id: 'i3', label: 'Pollo', amountLabel: '$28.000', assigneeId: 'mateo' },
    { id: 'i4', label: 'Verduras', amountLabel: '$14.000', assigneeId: 'sofia' },
  ],
  otherItemsLabel: 'Otros (8 ítems)',
  otherItemsAmountLabel: '$34.000',
  splits: [
    { memberId: 'valentina', amountLabel: '$32.000' },
    { memberId: 'andres', amountLabel: '$32.000' },
    { memberId: 'mateo', amountLabel: '$32.000' },
  ],
};

export const NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', type: 'tarea', title: 'Te toca lavar los platos hoy', timeLabel: 'Hace 1 hora', unread: true },
  { id: 'n2', type: 'factura', title: 'La factura de luz vence en 2 días', timeLabel: 'Hace 3 horas', unread: true },
  { id: 'n3', type: 'ranking', title: 'Vas subiendo en el ranking esta semana', timeLabel: 'Hace 5 horas', unread: false },
  { id: 'n4', type: 'recomendacion', title: 'Reparte mejor las tareas de cocina esta semana', timeLabel: 'Hace 6 horas', unread: false },
  { id: 'n5', type: 'logro', title: 'Desbloqueaste el logro Racha x7', timeLabel: 'Ayer, 20:14', unread: false },
  { id: 'n6', type: 'gasto', title: 'Andrés agregó un gasto: Supermercado $96.000', timeLabel: 'Ayer, 18:32', unread: false },
];

export const EXPENSE_BREAKDOWN = [
  { categoryId: 'servicios' as const, label: 'Servicios', amountLabel: '$173.000', percent: 35 },
  { categoryId: 'cocina' as const, label: 'Cocina', amountLabel: '$148.000', percent: 30 },
  { categoryId: 'limpieza' as const, label: 'Limpieza', amountLabel: '$79.000', percent: 16 },
  { categoryId: 'mantenimiento' as const, label: 'Mantenimiento', amountLabel: '$54.000', percent: 11 },
  { categoryId: 'eventos' as const, label: 'Eventos', amountLabel: '$40.000', percent: 8 },
];

export const MONTHLY_TREND: MonthlyTrendPoint[] = [
  { label: 'Abr', amount: 457 },
  { label: 'May', amount: 471 },
  { label: 'Jun', amount: 402 },
  { label: 'Jul', amount: 468 },
  { label: 'Ago', amount: 457 },
  { label: 'Sep', amount: 494, isCurrent: true },
];

export const CURRENT_USER_ID = 'valentina';

export function findMember(id: string | null): FamilyMember | undefined {
  if (!id) return undefined;
  return MEMBERS.find((m) => m.id === id);
}
