import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckIcon, ChevronRightIcon, HomeIcon, PlusIcon } from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { GhostAddButton } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { IconCircle } from '@/components/ui/IconCircle';
import { AccentColors, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const ROLE_LABEL = { admin: 'Administrador', member: 'Miembro' } as const;

export default function GruposScreen() {
  const theme = useTheme();
  const { groups, activeGroup, setActiveGroupId, leaveGroup } = useAppData();
  const [leavingId, setLeavingId] = useState<string | null>(null);

  async function handleLeave(groupId: string) {
    if (leavingId) return;
    setLeavingId(groupId);
    await leaveGroup(groupId);
    setLeavingId(null);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <Header title="Mis grupos" showBack size="md" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          {groups.map((group) => {
            const active = group.id === activeGroup?.id;
            return (
              <Card key={group.id} style={styles.groupRow} padding={15} outlined={active} outlineColor={theme.primary}>
                <Pressable style={styles.selectArea} onPress={() => setActiveGroupId(group.id)}>
                  <IconCircle size={46} background={active ? theme.primary : theme.surfaceAlt}>
                    <HomeIcon size={21} color={active ? theme.primaryOn : AccentColors.avatar2} />
                  </IconCircle>
                  <View style={styles.flexGrow}>
                    <View style={styles.nameRow}>
                      <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 15 }}>{group.name}</Text>
                      {active && (
                        <View style={[styles.activeBadge, { backgroundColor: theme.primarySoft }]}>
                          <Text style={{ color: theme.primary, fontFamily: Fonts.bodyBold, fontSize: 10 }}>ACTIVO</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
                      {ROLE_LABEL[group.role]} · código {group.invite_code}
                    </Text>
                  </View>
                  {active ? (
                    <View style={[styles.checkDot, { backgroundColor: theme.primary }]}>
                      <CheckIcon size={13} color="#fff" strokeWidth={2.8} />
                    </View>
                  ) : (
                    <ChevronRightIcon size={17} color={theme.textFaint} />
                  )}
                </Pressable>
                <Pressable onPress={() => handleLeave(group.id)} style={styles.leaveBtn} hitSlop={8}>
                  <Text style={{ color: theme.danger, fontFamily: Fonts.bodyMedium, fontSize: 11.5 }}>
                    {leavingId === group.id ? 'Saliendo...' : 'Salir del grupo'}
                  </Text>
                </Pressable>
              </Card>
            );
          })}

          <View style={{ marginTop: Spacing.two }}>
            <GhostAddButton
              label="Unirse o crear un grupo"
              icon={<PlusIcon size={15} color={theme.primary} strokeWidth={2.2} />}
              onPress={() => router.push('/nuevo-grupo')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: Spacing.eight },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five, gap: Spacing.three },
  groupRow: { gap: Spacing.two },
  selectArea: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flexGrow: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  activeBadge: { paddingVertical: 2, paddingHorizontal: 7, borderRadius: Radii.pill },
  checkDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  leaveBtn: { alignSelf: 'flex-end' },
});
