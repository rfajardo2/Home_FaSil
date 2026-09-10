import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CATEGORIES } from '@/constants/theme';
import { GROUPS, MEMBERS, TASKS } from '@/data/mock';
import { useAuth } from '@/hooks/use-auth';
import type { CategoryRow, GroupMembership, MemberRow, TaskRow } from '@/lib/database-types';
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
}));

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

// ---------------------------------------------------------------------------

type NewTaskInput = {
  title: string;
  categoryId: string | null;
  assigneeId: string | null;
  recurrence: TaskRow['recurrence'];
  dueDate: string | null;
  notes: string | null;
};

type AppDataContextValue = {
  /** True while the active group's members/categories/tasks are (re)loading. */
  loading: boolean;
  groups: GroupMembership[];
  activeGroup: GroupMembership | null;
  setActiveGroupId: (id: string) => void;
  members: MemberRow[];
  categories: CategoryRow[];
  tasks: TaskRow[];
  createGroup: (name: string, emoji: string) => Promise<{ error: string | null }>;
  joinGroupByCode: (code: string) => Promise<{ error: string | null }>;
  createCategory: (name: string, icon: string, color: string) => Promise<{ error: string | null }>;
  createTask: (input: NewTaskInput) => Promise<{ error: string | null }>;
  toggleTask: (task: TaskRow) => Promise<void>;
  claimTask: (task: TaskRow) => Promise<void>;
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

  const loadGroups = useCallback(async (): Promise<GroupMembership[]> => {
    if (!isSupabaseConfigured || !userId) return [];
    setGroupsLoading(true);
    const { data, error } = await supabase.from('group_members').select('role, points, groups(*)').eq('profile_id', userId);
    setGroupsLoading(false);
    if (error) {
      console.warn('[app-data] no se pudieron cargar los grupos:', error.message);
      return [];
    }
    const rows: GroupMembership[] = (data ?? [])
      .filter((row: any) => row.groups)
      .map((row: any) => ({ ...row.groups, role: row.role, points: row.points }));
    setGroups(rows);
    setActiveGroupIdState((current) => (current && rows.some((g) => g.id === current) ? current : (rows[0]?.id ?? null)));
    return rows;
  }, [userId]);

  const loadGroupContent = useCallback(async (groupId: string) => {
    if (!isSupabaseConfigured) return;
    setContentLoading(true);
    const [membersRes, categoriesRes, tasksRes] = await Promise.all([
      supabase.from('group_members').select('points, profiles(*)').eq('group_id', groupId),
      supabase.from('categories').select('*').eq('group_id', groupId).order('is_default', { ascending: false }),
      supabase.from('tasks').select('*').eq('group_id', groupId).order('created_at', { ascending: false }),
    ]);
    setContentLoading(false);
    if (membersRes.error) console.warn('[app-data] miembros:', membersRes.error.message);
    if (categoriesRes.error) console.warn('[app-data] categorías:', categoriesRes.error.message);
    if (tasksRes.error) console.warn('[app-data] tareas:', tasksRes.error.message);

    const memberRows: MemberRow[] = (membersRes.data ?? [])
      .filter((row: any) => row.profiles)
      .map((row: any) => ({ ...row.profiles, points: row.points }));
    setMembers(memberRows);
    setCategories((categoriesRes.data as CategoryRow[]) ?? []);
    setTasks((tasksRes.data as TaskRow[]) ?? []);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (!userId) {
      setGroups([]);
      setActiveGroupIdState(null);
      setMembers([]);
      setCategories([]);
      setTasks([]);
      return;
    }
    loadGroups();
  }, [userId, loadGroups]);

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
    setActiveGroupIdState(created?.id ?? refreshed[0]?.id ?? null);
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

  const value: AppDataContextValue = {
    loading: groupsLoading || contentLoading,
    groups,
    activeGroup,
    setActiveGroupId: setActiveGroupIdState,
    members,
    categories,
    tasks,
    createGroup,
    joinGroupByCode,
    createCategory,
    createTask,
    toggleTask,
    claimTask,
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
