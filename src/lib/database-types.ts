/** Row shapes for the Supabase tables this app currently reads/writes. Mirrors `supabase/schema.sql`. */

export type ProfileRow = {
  id: string;
  name: string;
  avatar_color: string;
  initials: string;
};

/** A group's member profile, joined with their points within that group. */
export type MemberRow = ProfileRow & { points: number };

export type GroupRow = {
  id: string;
  name: string;
  emoji: string;
  invite_code: string;
  created_by: string;
};

/** A group joined with the current user's membership row. */
export type GroupMembership = GroupRow & {
  role: 'admin' | 'member';
  points: number;
};

export type CategoryRow = {
  id: string;
  group_id: string;
  name: string;
  /** Key into `CATEGORY_ICONS` (@/components/icons). Falls back to `pin` if unknown. */
  icon: string;
  color: string;
  is_default: boolean;
};

export type TaskRow = {
  id: string;
  group_id: string;
  category_id: string | null;
  title: string;
  notes: string | null;
  assignee_id: string | null;
  created_by: string;
  points: number;
  due_date: string | null;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'done';
};
