import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CATEGORIES } from '@/constants/theme';
import { GROUPS, MEMBERS, NOTIFICATIONS, RECENT_EXPENSES, SHARED_ACCOUNTS, TASKS } from '@/data/mock';
import { useAuth } from '@/hooks/use-auth';
import type {
  CategoryRow,
  ExpenseRow,
  GroupMembership,
  MemberRow,
  NotificationRow,
  ProfileRow,
  SharedAccountRow,
  TaskRow,
} from '@/lib/database-types';
import { formatMoney } from '@/lib/format-money';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Mock shim: reshapes src/data/mock.ts into the same row types the real
// Supabase queries return, so screens can use `useAppData()` unconditionally
// even when the app is running without a configured backend.
// ---------------------------------------------------------------------------

const MOCK_GROUPS: GroupMembership[] = GROUPS.map((g) => ({
  id: g.id,
  name: g.name,
  emoji: '🏠',
  invite_code: 'DEMO0000',
  created_by: 'demo',
  role: g.role.toLowerCase().startsWith('admin') ? 'admin' : 'member',
  points: 0,
}));

const MOCK_MEMBERS: MemberRow[] = MEMBERS.map((m) => ({
  id: m.id,
  name: m.name,
  initials: m.initials,
  avatar_color: m.avatarColor,
  points: m.points,
  created_at: new Date().toISOString(),
  first_name: m.name.split(' ')[0] ?? m.name,
  last_name: null,
  username: m.name.toLowerCase().replace(/\s+/g, ''),
}));

const MOCK_MY_PROFILE: ProfileRow = (() => {
  const { points: _points, ...profile } = MOCK_MEMBERS.find((m) => m.id === MEMBERS.find((mm) => mm.isYou)?.id) ?? MOCK_MEMBERS[0];
  return profile;
})();

const MOCK_CATEGORIES: CategoryRow[] = CATEGORIES.map((c) => ({
  id: c.id,
  group_id: MOCK_GROUPS[0].id,
  name: c.label,
  icon: c.icon,
  color: c.color,
  is_default: true,
}));

function inDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const RECURRENCE_FROM_MOCK = { una_vez: 'none', diaria: 'daily', semanal: 'weekly', mensual: 'monthly' } as const;

const MOCK_TASKS: TaskRow[] = TASKS.map((t) => ({
  id: t.id,
  group_id: MOCK_GROUPS[0].id,
  category_id: t.categoryId,
  title: t.title,
  notes: null,
  assignee_id: t.assigneeId,
  created_by: 'demo',
  points: 10,
  due_date: t.dueLabel === 'Hoy' ? inDays(0) : inDays(3),
  recurrence: RECURRENCE_FROM_MOCK[t.frequency],
  status: t.status === 'hecha' ? 'done' : 'pending',
}));

const MOCK_SHARED_ACCOUNTS: SharedAccountRow[] = SHARED_ACCOUNTS.map((a) => ({
  id: a.id,
  group_id: MOCK_GROUPS[0].id,
  name: a.name,
  icon: 'wallet',
  currency: 'USD',
  created_by: 'demo',
}));

function parseMoneyLabel(label: string): number {
  return Number(label.replace(/[^\d]/g, '')) || 0;
}

const MOCK_EXPENSES: ExpenseRow[] = RECENT_EXPENSES.map((e, i) => {
  const total = parseMoneyLabel(e.totalLabel);
  const accountId = MOCK_SHARED_ACCOUNTS[i % MOCK_SHARED_ACCOUNTS.length]?.id ?? '';
  const participants = MEMBERS.slice(0, e.splitCount);
  return {
    id: e.id,
    account_id: accountId,
    group_id: MOCK_GROUPS[0].id,
    category_id: null,
    merchant: e.merchant,
    total,
    currency: 'USD',
    paid_by: MEMBERS[0].id,
    receipt_url: null,
    expense_date: inDays(0),
    expense_splits: participants.map((m) => ({
      id: `${e.id}-${m.id}`,
      expense_id: e.id,
      group_id: MOCK_GROUPS[0].id,
      profile_id: m.id,
      amount: Math.round((total / (participants.length || 1)) * 100) / 100,
      settled: false,
    })),
  };
});

function hoursAgo(n: number) {
  return new Date(Date.now() - n * 3_600_000).toISOString();
}

const MOCK_NOTIFICATIONS: NotificationRow[] = NOTIFICATIONS.map((n, i) => ({
  id: n.id,
  profile_id: MEMBERS[0].id,
  group_id: MOCK_GROUPS[0].id,
  type: n.type,
  title: n.title,
  body: null,
  unread: n.unread,
  created_at: hoursAgo(i + 1),
}));

// ---------------------------------------------------------------------------

type NewTaskInput = {
  title: string;
  categoryId: string | null;
  assigneeId: string | null;
  recurrence: TaskRow['recurrence'];
  dueDate: string | null;
  notes: string | null;
};

type NewExpenseInput = {
  /** Existing shared account id, or null to create one named `newAccountName`. */
  accountId: string | null;
  newAccountName: string | null;
  merchant: string;
  total: number;
  categoryId: string | null;
  paidBy: string;
};

type AppDataContextValue = {
  /** True while the active group's members/categories/tasks are (re)loading. */
  loading: boolean;
  groups: GroupMembership[];
  activeGroup: GroupMembership | null;
  setActiveGroupId: (id: string) => void;
  members: MemberRow[];
  /** The signed-in user's own profile — available even when they belong to no group. */
  myProfile: ProfileRow | null;
  refreshMyProfile: () => Promise<void>;
  categories: CategoryRow[];
  tasks: TaskRow[];
  sharedAccounts: SharedAccountRow[];
  expenses: ExpenseRow[];
  notifications: NotificationRow[];
  createGroup: (name: string, emoji: string) => Promise<{ error: string | null }>;
  joinGroupByCode: (code: string) => Promise<{ error: string | null }>;
  leaveGroup: (groupId: string) => Promise<{ error: string | null }>;
  createCategory: (name: string, icon: string, color: string) => Promise<{ error: string | null }>;
  createTask: (input: NewTaskInput) => Promise<{ error: string | null }>;
  toggleTask: (task: TaskRow) => Promise<void>;
  claimTask: (task: TaskRow) => Promise<void>;
  createExpense: (input: NewExpenseInput) => Promise<{ error: string | null }>;
  settleExpense: (expenseId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [groupsLoading, setGroupsLoading] = useState(isSupabaseConfigured);
  // Only meaningful once there's an active group to load content for — a brand
  // new user with zero groups would otherwise never see `loading` turn false.
  const [contentLoading, setContentLoading] = useState(false);
  const [groups, setGroups] = useState<GroupMembership[]>(isSupabaseConfigured ? [] : MOCK_GROUPS);
  const [activeGroupId, setActiveGroupIdState] = useState<string | null>(isSupabaseConfigured ? null : MOCK_GROUPS[0].id);
  const [members, setMembers] = useState<MemberRow[]>(isSupabaseConfigured ? [] : MOCK_MEMBERS);
  const [categories, setCategories] = useState<CategoryRow[]>(isSupabaseConfigured ? [] : MOCK_CATEGORIES);
  const [tasks, setTasks] = useState<TaskRow[]>(isSupabaseConfigured ? [] : MOCK_TASKS);
  const [sharedAccounts, setSharedAccounts] = useState<SharedAccountRow[]>(isSupabaseConfigured ? [] : MOCK_SHARED_ACCOUNTS);
  const [expenses, setExpenses] = useState<ExpenseRow[]>(isSupabaseConfigured ? [] : MOCK_EXPENSES);
  const [notifications, setNotifications] = useState<NotificationRow[]>(isSupabaseConfigured ? [] : MOCK_NOTIFICATIONS);
  // Your own profile, independent of any group — belonging to a group is optional.
  const [myProfile, setMyProfile] = useState<ProfileRow | null>(isSupabaseConfigured ? null : MOCK_MY_PROFILE);

  const activeGroupStorageKey = (forUserId: string) => `home-hub:active-group:${forUserId}`;

  const persistActiveGroupId = useCallback(
    (id: string | null) => {
      if (!userId) return;
      const key = activeGroupStorageKey(userId);
      (id ? AsyncStorage.setItem(key, id) : AsyncStorage.removeItem(key)).catch(() => {});
    },
    [userId],
  );

  const loadGroups = useCallback(async (): Promise<GroupMembership[]> => {
    if (!isSupabaseConfigured || !userId) return [];
    setGroupsLoading(true);
    const [{ data, error }, storedGroupId] = await Promise.all([
      supabase.from('group_members').select('role, points, groups(*)').eq('profile_id', userId),
      AsyncStorage.getItem(activeGroupStorageKey(userId)).catch(() => null),
    ]);
    setGroupsLoading(false);
    if (error) {
      console.warn('[app-data] no se pudieron cargar los grupos:', error.message);
      return [];
    }
    const rows: GroupMembership[] = (data ?? [])
      .filter((row: any) => row.groups)
      .map((row: any) => ({ ...row.groups, role: row.role, points: row.points }));
    setGroups(rows);
    let resolvedActiveId: string | null = null;
    setActiveGroupIdState((current) => {
      resolvedActiveId =
        current && rows.some((g) => g.id === current)
          ? current
          : storedGroupId && rows.some((g) => g.id === storedGroupId)
            ? storedGroupId
            : (rows[0]?.id ?? null);
      return resolvedActiveId;
    });
    persistActiveGroupId(resolvedActiveId);
    return rows;
  }, [userId, persistActiveGroupId]);

  const loadNotifications = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.warn('[app-data] no se pudieron cargar las notificaciones:', error.message);
      return;
    }
    setNotifications((data as NotificationRow[]) ?? []);
  }, [userId]);

  const loadMyProfile = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      console.warn('[app-data] no se pudo cargar tu perfil:', error.message);
      return;
    }
    setMyProfile((data as ProfileRow) ?? null);
  }, [userId]);

  const loadGroupContent = useCallback(async (groupId: string) => {
    if (!isSupabaseConfigured) return;
    setContentLoading(true);
    const [membersRes, categoriesRes, tasksRes, accountsRes, expensesRes] = await Promise.all([
      supabase.from('group_members').select('points, profiles(*)').eq('group_id', groupId),
      supabase.from('categories').select('*').eq('group_id', groupId).order('is_default', { ascending: false }),
      supabase.from('tasks').select('*').eq('group_id', groupId).order('created_at', { ascending: false }),
      supabase.from('shared_accounts').select('*').eq('group_id', groupId).order('created_at', { ascending: true }),
      supabase
        .from('expenses')
        .select('*, expense_splits(*)')
        .eq('group_id', groupId)
        .order('expense_date', { ascending: false }),
    ]);
    setContentLoading(false);
    if (membersRes.error) console.warn('[app-data] miembros:', membersRes.error.message);
    if (categoriesRes.error) console.warn('[app-data] categorías:', categoriesRes.error.message);
    if (tasksRes.error) console.warn('[app-data] tareas:', tasksRes.error.message);
    if (accountsRes.error) console.warn('[app-data] cuentas compartidas:', accountsRes.error.message);
    if (expensesRes.error) console.warn('[app-data] gastos:', expensesRes.error.message);

    const memberRows: MemberRow[] = (membersRes.data ?? [])
      .filter((row: any) => row.profiles)
      .map((row: any) => ({ ...row.profiles, points: row.points }));
    setMembers(memberRows);
    setCategories((categoriesRes.data as CategoryRow[]) ?? []);
    setTasks((tasksRes.data as TaskRow[]) ?? []);
    setSharedAccounts((accountsRes.data as SharedAccountRow[]) ?? []);
    setExpenses((expensesRes.data as unknown as ExpenseRow[]) ?? []);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (!userId) {
      setGroups([]);
      setActiveGroupIdState(null);
      setMembers([]);
      setCategories([]);
      setTasks([]);
      setSharedAccounts([]);
      setExpenses([]);
      setNotifications([]);
      setMyProfile(null);
      return;
    }
    loadGroups();
    loadNotifications();
    loadMyProfile();
  }, [userId, loadGroups, loadNotifications, loadMyProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured || !activeGroupId) return;
    loadGroupContent(activeGroupId);
  }, [activeGroupId, loadGroupContent]);

  const activeGroup = useMemo(() => groups.find((g) => g.id === activeGroupId) ?? null, [groups, activeGroupId]);

  async function createGroup(name: string, emoji: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured || !userId) return { error: 'Supabase no está configurado.' };
    // Deliberately no `.select()` here: Postgres re-checks a fresh INSERT's
    // RETURNING row against the table's SELECT policy (is_group_member),
    // which the AFTER INSERT trigger that admits the creator hasn't
    // necessarily made visible yet — that combination throws a spurious
    // "new row violates row-level security policy" even though the insert
    // itself is allowed. Insert plain, then find the new group in a fresh
    // (and by then correctly RLS-visible) refetch instead.
    const previousIds = new Set(groups.map((g) => g.id));
    const { error } = await supabase.from('groups').insert({ name, emoji, created_by: userId });
    if (error) return { error: error.message };
    const refreshed = await loadGroups();
    const created = refreshed.find((g) => !previousIds.has(g.id));
    const newActiveId = created?.id ?? refreshed[0]?.id ?? null;
    setActiveGroupIdState(newActiveId);
    persistActiveGroupId(newActiveId);
    return { error: null };
  }

  async function joinGroupByCode(code: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured || !userId) return { error: 'Supabase no está configurado.' };
    const trimmed = code.trim();
    if (!trimmed) return { error: 'Ingresa un código de invitación.' };
    const { data, error } = await supabase.rpc('join_group_by_invite_code', { code: trimmed });
    if (error) return { error: traducirErrorPostgres(error.message) };
    await loadGroups();
    setActiveGroupIdState(data.id);
    persistActiveGroupId(data.id);
    return { error: null };
  }

  async function leaveGroup(groupId: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured || !userId) return { error: 'Supabase no está configurado.' };
    const { error } = await supabase.from('group_members').delete().eq('group_id', groupId).eq('profile_id', userId);
    if (error) return { error: error.message };
    const refreshed = await loadGroups();
    if (activeGroupId === groupId) {
      const nextActiveId = refreshed[0]?.id ?? null;
      setActiveGroupIdState(nextActiveId);
      persistActiveGroupId(nextActiveId);
    }
    return { error: null };
  }

  async function createCategory(name: string, icon: string, color: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured || !activeGroupId) return { error: 'Selecciona un grupo primero.' };
    const { error } = await supabase.from('categories').insert({ group_id: activeGroupId, name, icon, color, is_default: false });
    if (error) return { error: error.message };
    await loadGroupContent(activeGroupId);
    return { error: null };
  }

  async function createTask(input: NewTaskInput): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured || !activeGroupId || !userId) return { error: 'Selecciona un grupo primero.' };
    const { error } = await supabase.from('tasks').insert({
      group_id: activeGroupId,
      category_id: input.categoryId,
      title: input.title,
      notes: input.notes,
      assignee_id: input.assigneeId,
      created_by: userId,
      due_date: input.dueDate,
      recurrence: input.recurrence,
    });
    if (error) return { error: error.message };
    if (input.assigneeId && input.assigneeId !== userId) {
      await notify(input.assigneeId, 'tarea', `Te asignaron: ${input.title}`);
    }
    await loadGroupContent(activeGroupId);
    return { error: null };
  }

  async function toggleTask(task: TaskRow) {
    if (!isSupabaseConfigured || !userId) return;
    const nextStatus = task.status === 'done' ? 'pending' : 'done';
    const { error } = await supabase.from('tasks').update({ status: nextStatus }).eq('id', task.id);
    if (error) {
      console.warn('[app-data] no se pudo actualizar la tarea:', error.message);
      return;
    }
    if (nextStatus === 'done') {
      const { error: occError } = await supabase
        .from('task_occurrences')
        .insert({ task_id: task.id, group_id: task.group_id, completed_by: userId, points_awarded: task.points });
      if (occError) console.warn('[app-data] no se pudo registrar la finalización:', occError.message);
      const actorName = members.find((m) => m.id === userId)?.name ?? 'Alguien';
      await notifyOtherMembers('tarea', `${actorName} completó: ${task.title}`);
    }
    if (activeGroupId) await loadGroupContent(activeGroupId);
  }

  async function claimTask(task: TaskRow) {
    if (!isSupabaseConfigured || !userId) return;
    const { error } = await supabase.from('tasks').update({ assignee_id: userId }).eq('id', task.id);
    if (error) {
      console.warn('[app-data] no se pudo tomar la tarea:', error.message);
      return;
    }
    if (activeGroupId) await loadGroupContent(activeGroupId);
  }

  async function createExpense(input: NewExpenseInput): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured || !activeGroupId || !userId) return { error: 'Selecciona un grupo primero.' };

    let accountId = input.accountId;
    if (!accountId) {
      const name = input.newAccountName?.trim();
      if (!name) return { error: 'Elige o crea una cuenta compartida.' };
      // Safe to use .select() here (unlike creating a *group*): the creator
      // is already a member of `activeGroupId`, so the shared_accounts SELECT
      // policy (is_group_member) is satisfied immediately, no trigger needed.
      const { data, error } = await supabase
        .from('shared_accounts')
        .insert({ group_id: activeGroupId, name, created_by: userId })
        .select()
        .single();
      if (error) return { error: error.message };
      accountId = data.id;
    }

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        account_id: accountId,
        group_id: activeGroupId,
        category_id: input.categoryId,
        merchant: input.merchant,
        total: input.total,
        paid_by: input.paidBy,
      })
      .select()
      .single();
    if (expenseError) return { error: expenseError.message };

    const shareAmount = Math.round((input.total / (members.length || 1)) * 100) / 100;
    const splits = members.map((m) => ({
      expense_id: expense.id,
      group_id: activeGroupId,
      profile_id: m.id,
      amount: shareAmount,
    }));
    const { error: splitsError } = await supabase.from('expense_splits').insert(splits);
    if (splitsError) return { error: splitsError.message };

    const actorName = members.find((m) => m.id === userId)?.name ?? 'Alguien';
    await notifyOtherMembers('gasto', `${actorName} agregó un gasto: ${input.merchant} ${formatMoney(input.total)}`);

    await loadGroupContent(activeGroupId);
    return { error: null };
  }

  /** Notifies a single group member (used when a specific person is directly affected, e.g. a task assignment). */
  async function notify(profileId: string, type: NotificationRow['type'], title: string) {
    if (!isSupabaseConfigured || !activeGroupId) return;
    const { error } = await supabase.from('notifications').insert({ profile_id: profileId, group_id: activeGroupId, type, title });
    if (error) console.warn('[app-data] no se pudo crear la notificación:', error.message);
  }

  /** Notifies every OTHER member of the active group (used for group-wide activity like a completed task or a new expense). */
  async function notifyOtherMembers(type: NotificationRow['type'], title: string) {
    if (!isSupabaseConfigured || !activeGroupId || !userId) return;
    const targets = members.filter((m) => m.id !== userId);
    if (targets.length === 0) return;
    const rows = targets.map((m) => ({ profile_id: m.id, group_id: activeGroupId, type, title }));
    const { error } = await supabase.from('notifications').insert(rows);
    if (error) console.warn('[app-data] no se pudieron crear notificaciones:', error.message);
  }

  async function markNotificationRead(id: string) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('notifications').update({ unread: false }).eq('id', id);
    if (error) {
      console.warn('[app-data] no se pudo marcar la notificación:', error.message);
      return;
    }
    await loadNotifications();
  }

  async function markAllNotificationsRead() {
    if (!isSupabaseConfigured || !userId) return;
    const { error } = await supabase.from('notifications').update({ unread: false }).eq('profile_id', userId).eq('unread', true);
    if (error) {
      console.warn('[app-data] no se pudieron marcar las notificaciones:', error.message);
      return;
    }
    await loadNotifications();
  }

  async function settleExpense(expenseId: string) {
    if (!isSupabaseConfigured || !activeGroupId) return;
    const { error } = await supabase.from('expense_splits').update({ settled: true }).eq('expense_id', expenseId);
    if (error) {
      console.warn('[app-data] no se pudo confirmar la división:', error.message);
      return;
    }
    await loadGroupContent(activeGroupId);
  }

  const value: AppDataContextValue = {
    loading: groupsLoading || contentLoading,
    groups,
    activeGroup,
    setActiveGroupId: (id) => {
      setActiveGroupIdState(id);
      persistActiveGroupId(id);
    },
    members,
    myProfile,
    refreshMyProfile: loadMyProfile,
    categories,
    tasks,
    sharedAccounts,
    expenses,
    notifications,
    createGroup,
    joinGroupByCode,
    leaveGroup,
    createCategory,
    createTask,
    toggleTask,
    claimTask,
    createExpense,
    settleExpense,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData debe usarse dentro de <AppDataProvider>.');
  return ctx;
}

function traducirErrorPostgres(message: string): string {
  if (message.includes('Código de invitación inválido')) return 'No encontramos ningún grupo con ese código.';
  return message;
}
