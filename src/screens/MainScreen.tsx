import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TaskItem from '../components/TaskItem';
import TaskSheet from '../components/TaskSheet';
import { Priority, Task, TaskDraft, User } from '../types';
import { colors, font, radius, shadow, space } from '../theme';

type Filter = 'todo' | 'done' | 'all';

interface Props {
  user: User;
  tasks: Task[];
  onAdd: (draft: TaskDraft) => void;
  onUpdate: (id: string, draft: TaskDraft) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (task: Task) => void;
  onClearCompleted: () => void;
  onShowProfile: () => void;
}

const PRIORITY_RANK: Record<Priority, number> = { haute: 0, moyenne: 1, basse: 2 };

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5 || h >= 18) return 'Bonsoir';
  if (h >= 12) return 'Bon après-midi';
  return 'Bonjour';
};

const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

export default function MainScreen(props: Props) {
  const { user, tasks } = props;
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('todo');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);
  const snack = useRef(new Animated.Value(0)).current;

  const done = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const remaining = total - done;
  const progress = total ? done / total : 0;
  const allDone = total > 0 && remaining === 0;

  const visible = useMemo(() => {
    const todo = tasks
      .filter(t => !t.completed)
      .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.createdAt - a.createdAt);
    const completed = tasks
      .filter(t => t.completed)
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
    if (filter === 'todo') return todo;
    if (filter === 'done') return completed;
    return [...todo, ...completed];
  }, [tasks, filter]);

  // Snackbar « Annuler » après suppression
  useEffect(() => {
    if (!lastDeleted) return;
    Animated.spring(snack, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
    const t = setTimeout(() => hideSnack(), 4000);
    return () => clearTimeout(t);
  }, [lastDeleted]);

  const hideSnack = () =>
    Animated.timing(snack, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
      setLastDeleted(null)
    );

  const openNew = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setSheetOpen(true);
  };

  const submit = (draft: TaskDraft) => {
    animate();
    if (editing) props.onUpdate(editing.id, draft);
    else {
      props.onAdd(draft);
      if (filter === 'done') setFilter('todo');
    }
    setSheetOpen(false);
  };

  const remove = (id: string) => {
    const task = tasks.find(t => t.id === id);
    animate();
    props.onDelete(id);
    setSheetOpen(false);
    if (task) setLastDeleted(task);
  };

  const undo = () => {
    if (!lastDeleted) return;
    animate();
    props.onRestore(lastDeleted);
    hideSnack();
  };

  const toggle = (id: string) => {
    animate();
    props.onToggle(id);
  };

  const clearCompleted = () =>
    Alert.alert('Effacer les missions terminées ?', `${done} mission${done > 1 ? 's' : ''} sera supprimée${done > 1 ? 's' : ''}.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Effacer',
        style: 'destructive',
        onPress: () => {
          animate();
          props.onClearCompleted();
        },
      },
    ]);

  const header = (
    <View>
      {/* En-tête */}
      <View style={styles.topBar}>
        <View style={styles.flex}>
          <Text style={styles.date}>{capitalize(format(new Date(), 'EEEE d MMMM', { locale: fr }))}</Text>
          <Text style={styles.hello} numberOfLines={1}>
            {greeting()}, {user.name} 👋
          </Text>
        </View>
        <Pressable
          onPress={props.onShowProfile}
          style={styles.avatar}
          accessibilityLabel="Ouvrir mon profil"
          hitSlop={4}
        >
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </Pressable>
      </View>

      {/* Carte progression */}
      <View style={styles.progressCard}>
        <View style={styles.progressGlow} />
        {allDone ? (
          <>
            <Text style={styles.progressBig}>Journée bouclée 🎉</Text>
            <Text style={styles.progressSub}>Toutes tes missions sont terminées. Bravo !</Text>
          </>
        ) : (
          <>
            <View style={styles.progressRow}>
              <Text style={styles.progressBig}>
                {done}
                <Text style={styles.progressOf}> / {total}</Text>
              </Text>
              <Text style={styles.progressPct}>{Math.round(progress * 100)} %</Text>
            </View>
            <Text style={styles.progressSub}>
              {total === 0
                ? 'Ajoute ta première mission pour commencer'
                : `mission${done > 1 ? 's' : ''} terminée${done > 1 ? 's' : ''} · encore ${remaining}`}
            </Text>
          </>
        )}
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filters}>
        {(
          [
            ['todo', 'À faire', remaining],
            ['done', 'Terminées', done],
            ['all', 'Toutes', total],
          ] as [Filter, string, number][]
        ).map(([key, label, count]) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => {
                animate();
                setFilter(key);
              }}
              style={[styles.filter, active && styles.filterActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
              <View style={[styles.badge, active && styles.badgeActive]}>
                <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{count}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {filter === 'done' && done > 0 && (
        <Pressable onPress={clearCompleted} style={styles.clearRow} hitSlop={8}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={styles.clearText}>Effacer les terminées</Text>
        </Pressable>
      )}
    </View>
  );

  const empty = (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyEmoji}>{filter === 'done' ? '🏁' : allDone ? '🎉' : '📝'}</Text>
      </View>
      <Text style={styles.emptyTitle}>
        {filter === 'done'
          ? 'Rien de terminé pour l’instant'
          : allDone
          ? 'Tout est fait !'
          : 'Aucune mission'}
      </Text>
      <Text style={styles.emptyText}>
        {filter === 'done'
          ? 'Coche une mission pour la voir ici.'
          : allDone
          ? 'Profite, ou ajoute la prochaine mission.'
          : 'Que veux-tu accomplir aujourd’hui ?'}
      </Text>
      {filter !== 'done' && (
        <Pressable onPress={openNew} style={styles.emptyCta}>
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text style={styles.emptyCtaText}>Créer une mission</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={visible}
        keyExtractor={t => t.id}
        renderItem={({ item }) => <TaskItem task={item} onToggle={toggle} onOpen={openEdit} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* Snackbar annuler */}
      {lastDeleted && (
        <Animated.View
          style={[
            styles.snack,
            { bottom: insets.bottom + 96 },
            {
              opacity: snack,
              transform: [{ translateY: snack.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
            },
          ]}
        >
          <Text style={styles.snackText} numberOfLines={1}>
            Mission supprimée
          </Text>
          <Pressable onPress={undo} hitSlop={12}>
            <Text style={styles.snackAction}>Annuler</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Bouton principal, zone du pouce */}
      <Pressable
        onPress={openNew}
        style={({ pressed }) => [styles.fab, { bottom: insets.bottom + space.xl }, pressed && styles.fabPressed]}
        accessibilityLabel="Nouvelle mission"
      >
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={styles.fabText}>Nouvelle mission</Text>
      </Pressable>

      <TaskSheet
        visible={sheetOpen}
        task={editing}
        onClose={() => setSheetOpen(false)}
        onSubmit={submit}
        onDelete={remove}
      />
    </View>
  );
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: space.xl },

  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: space.xl, paddingBottom: space.xl },
  date: { fontSize: font.caption, color: colors.textMuted, marginBottom: space.xs },
  hello: { fontSize: font.title, fontWeight: font.bold, color: colors.ink },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.lg,
  },
  avatarText: { fontSize: font.title, fontWeight: font.bold, color: colors.primary },

  progressCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: space.xl,
    overflow: 'hidden',
    marginBottom: space.xl,
    ...shadow(colors.primary, 1.5),
  },
  progressGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -60,
    top: -80,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  progressBig: { fontSize: font.display, fontWeight: font.bold, color: colors.white, fontVariant: ['tabular-nums'] },
  progressOf: { fontSize: font.title, color: 'rgba(255,255,255,0.7)', fontWeight: font.regular },
  progressPct: { fontSize: font.body, fontWeight: font.bold, color: colors.white, fontVariant: ['tabular-nums'] },
  progressSub: { fontSize: font.caption, color: 'rgba(255,255,255,0.85)', marginTop: space.xs },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: space.lg,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: colors.white },

  filters: {
    flexDirection: 'row',
    backgroundColor: 'rgba(28, 26, 25, 0.05)',
    borderRadius: radius.sm,
    padding: space.xs,
    marginBottom: space.lg,
  },
  filter: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  filterActive: { backgroundColor: colors.surface, ...shadow(undefined, 0.5) },
  filterText: { fontSize: font.caption, color: colors.textMuted },
  filterTextActive: { color: colors.ink, fontWeight: font.bold },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28, 26, 25, 0.06)',
  },
  badgeActive: { backgroundColor: colors.primarySoft },
  badgeText: { fontSize: font.caption, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  badgeTextActive: { color: colors.primary, fontWeight: font.bold },

  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: space.xs,
    marginBottom: space.md,
    minHeight: 32,
  },
  clearText: { color: colors.danger, fontSize: font.caption },

  empty: { alignItems: 'center', paddingTop: space.xxl, paddingHorizontal: space.xl },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
    ...shadow(),
  },
  emptyEmoji: { fontSize: font.display },
  emptyTitle: { fontSize: font.body, fontWeight: font.bold, color: colors.text, marginBottom: space.xs },
  emptyText: { fontSize: font.caption, color: colors.textMuted, textAlign: 'center' },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginTop: space.lg,
    height: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  emptyCtaText: { color: colors.primary, fontWeight: font.bold, fontSize: font.caption },

  fab: {
    position: 'absolute',
    alignSelf: 'center',
    height: 56,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    ...shadow(colors.primary, 2),
  },
  fabPressed: { transform: [{ scale: 0.96 }] },
  fabText: { color: colors.white, fontSize: font.body, fontWeight: font.bold },

  snack: {
    position: 'absolute',
    left: space.xl,
    right: space.xl,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    ...shadow(),
  },
  snackText: { color: colors.white, fontSize: font.caption, flex: 1 },
  snackAction: { color: '#FF8A5C', fontWeight: font.bold, fontSize: font.caption },
});
