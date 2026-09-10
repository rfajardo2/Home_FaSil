import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { UsersIcon } from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { IconCircle } from '@/components/ui/IconCircle';
import { PrimaryButton } from '@/components/ui/Button';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Shown on group-dependent screens (Tareas, Grupo, Gastos, Categorías) when
 * the user doesn't belong to any group yet. Belonging to a group is
 * optional — this is a prompt, not a gate: the rest of the app (Inicio,
 * Notificaciones, Perfil) stays reachable regardless.
 */
export function NoGroupCard({ message }: { message?: string }) {
  const theme = useTheme();
  return (
    <Card padding={20} style={{ alignItems: 'center', gap: Spacing.three }}>
      <IconCircle size={48} background={theme.primarySoft}>
        <UsersIcon size={22} color={theme.primary} />
      </IconCircle>
      <View style={{ gap: 4, alignItems: 'center' }}>
        <Text style={{ color: theme.text, fontFamily: Fonts.display, fontSize: 16 }}>Sin grupo todavía</Text>
        <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 12.5, textAlign: 'center' }}>
          {message ?? 'Crea un grupo o únete a uno con un código de invitación para empezar a compartir tareas y gastos.'}
        </Text>
      </View>
      <View style={{ width: '100%', maxWidth: 260 }}>
        <PrimaryButton label="Crear o unirse a un grupo" onPress={() => router.push('/nuevo-grupo')} />
      </View>
    </Card>
  );
}
