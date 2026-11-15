import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Avatar from '../components/Avatar';
import { AvatarSource, deleteAvatarFile, pickAvatar } from '../utils/avatar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Category, Task, User } from '../types';
import { MarginLine, RuledLines } from '../components/Paper';
import { categories, colors, font, radius, shadow, space } from '../theme';

interface Props {
  user: User;
  tasks: Task[];
  onBack: () => void;
  onLogout: () => void;
  onReset: () => void;
  onChangeAvatar: (uri?: string) => void;
}

export default function ProfileScreen({ user, tasks, onBack, onLogout, onReset, onChangeAvatar }: Props) {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const choose = async (source: AvatarSource) => {
    setBusy(true);
    try {
      const uri = await pickAvatar(source);
      if (uri) {
        deleteAvatarFile(user.avatarUri);
        onChangeAvatar(uri);
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'permission') {
        Alert.alert(
          'Accès refusé',
          source === 'camera'
            ? 'Autorise l’appareil photo dans les réglages pour prendre une photo.'
            : 'Autorise l’accès aux photos dans les réglages pour en choisir une.'
        );
      } else {
        Alert.alert('Oups', 'Impossible de récupérer cette photo. Réessaie.');
      }
    } finally {
      setBusy(false);
    }
  };

  const changePhoto = () =>
    Alert.alert('Photo de profil', undefined, [
      { text: 'Choisir dans la galerie', onPress: () => choose('library') },
      { text: 'Prendre une photo', onPress: () => choose('camera') },
      ...(user.avatarUri
        ? [
            {
              text: 'Retirer la photo',
              style: 'destructive' as const,
              onPress: () => {
                deleteAvatarFile(user.avatarUri);
                onChangeAvatar(undefined);
              },
            },
          ]
        : []),
      { text: 'Annuler', style: 'cancel' as const },
    ]);
  const done = tasks.filter(t => t.completed).length;
  const todo = tasks.length - done;
  const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const confirmReset = () =>
    Alert.alert(
      'Tout effacer ?',
      'Ton prénom et toutes tes missions seront supprimés de cet appareil. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Tout effacer', style: 'destructive', onPress: onReset },
      ]
    );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <RuledLines />
      <MarginLine />
      <View style={styles.nav}>
        <Pressable onPress={onBack} style={styles.back} hitSlop={8} accessibilityLabel="Retour">
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.navTitle}>Mon profil</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxl }]}>
        <View style={styles.identity}>
          <Pressable
            onPress={changePhoto}
            disabled={busy}
            style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={user.avatarUri ? 'Changer ma photo' : 'Ajouter une photo'}
          >
            <Avatar uri={user.avatarUri} size={112} />
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color={colors.white} />
            </View>
          </Pressable>
          {!user.avatarUri && <Text style={styles.addPhoto}>Ajouter une photo</Text>}
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.caption}>
            {done === 0 ? 'Ta première mission t’attend' : `${done} mission${done > 1 ? 's' : ''} accomplie${done > 1 ? 's' : ''} 💪`}
          </Text>
        </View>

        <View style={styles.stats}>
          <Stat value={String(done)} label="Terminées" />
          <Stat value={String(todo)} label="À faire" />
          <Stat value={`${rate} %`} label="Réussite" accent />
        </View>

        <Text style={styles.sectionTitle}>Par catégorie</Text>
        <View style={styles.card}>
          {(Object.keys(categories) as Category[]).map((c, i) => {
            const list = tasks.filter(t => t.category === c);
            const d = list.filter(t => t.completed).length;
            const pct = list.length ? d / list.length : 0;
            const meta = categories[c];
            return (
              <View key={c} style={[styles.catRow, i > 0 && styles.divider]}>
                <View style={[styles.catIcon, { backgroundColor: meta.bg }]}>
                  <Text style={styles.catEmoji}>{meta.emoji}</Text>
                </View>
                <View style={styles.flex}>
                  <View style={styles.catHead}>
                    <Text style={styles.catLabel}>{meta.label}</Text>
                    <Text style={styles.catCount}>
                      {d}/{list.length}
                    </Text>
                  </View>
                  <View style={styles.bar}>
                    <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: meta.fg }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable onPress={onLogout} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Ionicons name="log-out-outline" size={20} color={colors.text} />
          <Text style={styles.secondaryText}>Se déconnecter</Text>
        </Pressable>
        <Text style={styles.hint}>Tes missions restent sur cet appareil.</Text>

        <Pressable onPress={confirmReset} style={styles.danger} hitSlop={8}>
          <Text style={styles.dangerText}>Tout effacer</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={[styles.stat, accent && styles.statAccent]}>
      <Text style={[styles.statValue, accent && { color: colors.primary }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.paper },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: font.body, fontWeight: font.bold, color: colors.ink },
  content: { paddingHorizontal: space.xl },

  identity: { alignItems: 'center', paddingVertical: space.xl },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
    ...shadow(undefined, 1.5),
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: { fontSize: font.caption, color: colors.primary, fontWeight: font.bold, marginBottom: space.sm },
  name: { fontFamily: font.handBold, fontSize: font.handXL, lineHeight: font.handXLLine, color: colors.ink },
  caption: { fontSize: font.caption, color: colors.textMuted, marginTop: space.xs },

  stats: { flexDirection: 'row', gap: space.md, marginBottom: space.xxl },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
    ...shadow(),
  },
  statAccent: { backgroundColor: '#FFF6F2', borderWidth: 1, borderColor: colors.primaryBorder },
  statValue: { fontFamily: font.handBold, fontSize: font.handM, lineHeight: font.handMLine, color: colors.ink },
  statLabel: { fontSize: font.caption, color: colors.textMuted, marginTop: space.xs },

  sectionTitle: {
    fontSize: font.caption,
    fontWeight: font.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: space.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    marginBottom: space.xxl,
    ...shadow(),
  },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  catIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  catEmoji: { fontSize: font.body },
  catHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.sm },
  catLabel: { fontSize: font.body, color: colors.text },
  catCount: { fontSize: font.caption, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  secondary: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  secondaryText: { fontSize: font.body, fontWeight: font.bold, color: colors.text },
  hint: { fontSize: font.caption, color: colors.textSubtle, textAlign: 'center', marginTop: space.sm },
  danger: { alignSelf: 'center', marginTop: space.xl, minHeight: 44, justifyContent: 'center' },
  dangerText: { fontSize: font.body, color: colors.danger },
});
