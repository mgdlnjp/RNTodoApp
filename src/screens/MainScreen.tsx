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
import { MarginLine } from '../components/Paper';
import Avatar from '../components/Avatar';
import { Priority, Task, TaskDraft, User } from '../types';
import { colors, font, notebook, radius, shadow, space } from '../theme';

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
  onClearAll: () => void;
  onShowProfile: () => void;
}

const PRIORITY_RANK: Record<Priority, number> = { haute: 0, moyenne: 1, basse: 2 };
const MIN_LINES = 9; // la page paraît toujours « à remplir »

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5 || h >= 18) return 'Bonsoir';
  if (h >= 12) return 'Coucou';
  return 'Salut';
};

const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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

  const toggle = (id: string) => props.onToggle(id);

  const clearCompleted = () =>
    Alert.alert('Arracher les missions barrées ?', `${done} mission${done > 1 ? 's' : ''} sera supprimée${done > 1 ? 's' : ''}.`, [
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

  const clearAll = () =>
    Alert.alert('Effacer toute la liste ?', `Les ${total} mission${total > 1 ? 's' : ''} (à faire et barrées) seront supprimée${total > 1 ? 's' : ''}.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Tout effacer',
        style: 'destructive',
        onPress: () => {
          animate();
          props.onClearAll();
        },
      },
    ]);

  const header = (
    <View>
      {/* En-tête de page */}
      <View style={styles.topBar}>
        <View style={styles.flex}>
          <Text style={styles.date}>{capitalize(format(new Date(), 'EEEE d MMMM', { locale: fr }))}</Text>
          <Text style={styles.hello} numberOfLines={1}>
            {greeting()} {user.name} !
          </Text>
        </View>
        <Pressable
          onPress={props.onShowProfile}
          style={styles.avatar}
          accessibilityLabel="Ouvrir mon profil"
          hitSlop={4}
        >
          <Avatar uri={user.avatarUri} size={44} />
        </Pressable>
      </View>

      {/* Post-it de progression */}
      <View style={styles.postIt}>
        <View style={styles.tape} />
        {allDone ? (
          <>
            <Text style={styles.postItBig}>Tout est coché ! 🎉</Text>
            <Text style={styles.postItSub}>Page terminée, bien joué.</Text>
          </>
        ) : total === 0 ? (
          <>
            <Text style={styles.postItBig}>Page blanche…</Text>
            <Text style={styles.postItSub}>Écris ta première mission sur une ligne.</Text>
          </>
        ) : (
          <>
            <View style={styles.postItRow}>
              <Text style={styles.postItBig}>
                {done} / {total} cochée{done > 1 ? 's' : ''}
              </Text>
              <Text style={styles.postItPct}>{Math.round(progress * 100)} %</Text>
            </View>
            <Text style={styles.postItSub}>Encore {remaining} à faire aujourd'hui</Text>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
            </View>
          </>
        )}
      </View>

      {/* Onglets surlignés */}
      <View style={styles.tabs}>
        {(
          [
            ['todo', 'À faire', remaining],
            ['done', 'Barrées', done],
            ['all', 'Tout', total],
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
              style={styles.tab}
              hitSlop={6}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              {active && <View style={styles.highlight} />}
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {label} <Text style={styles.tabCount}>{count}</Text>
              </Text>
            </Pressable>
          );
        })}
        {((filter === 'done' && done > 0) || (filter === 'all' && total > 0)) && (
          <Pressable
            onPress={filter === 'done' ? clearCompleted : clearAll}
            hitSlop={10}
            style={styles.clear}
            accessibilityLabel={filter === 'done' ? 'Effacer les barrées' : 'Effacer toute la liste'}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        )}
      </View>
    </View>
  );

  const empty = (
    <View style={styles.line}>
      <Text style={styles.emptyNote}>
        {filter === 'done'
          ? 'Rien de barré pour l’instant.'
          : allDone
          ? 'Tout est fait, profite ! ☀️'
          : 'Rien à faire… pour l’instant ✏️'}
      </Text>
    </View>
  );

  // Lignes vides : on touche pour écrire une nouvelle mission.
  const blankCount = Math.max(3, MIN_LINES - Math.max(visible.length, 1));
  const footer = (
    <View>
      {Array.from({ length: blankCount }, (_, i) => (
        <Pressable
          key={i}
          onPress={openNew}
          style={({ pressed }) => [styles.line, pressed && styles.linePressed]}
          accessibilityLabel={i === 0 ? 'Écrire une nouvelle mission' : undefined}
        >
          {i === 0 && <Text style={styles.placeholder}>+ écrire une mission…</Text>}
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <MarginLine />
      <FlatList
        data={visible}
        keyExtractor={t => t.id}
        renderItem={({ item }) => <TaskItem task={item} onToggle={toggle} onOpen={openEdit} />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={footer}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 120 }}
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
            Mission gommée
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
        <Ionicons name="pencil" size={20} color={colors.white} />
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

const INDENT = notebook.margin + space.lg;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.paper },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: INDENT,
    paddingRight: space.xl,
    paddingTop: space.lg,
  },
  date: { fontFamily: font.hand, fontSize: font.handL, lineHeight: font.handLLine, color: colors.primary },
  hello: { fontFamily: font.handBold, fontSize: font.handXL, lineHeight: font.handXLLine, color: colors.ink },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.lg,
    ...shadow(),
  },

  postIt: {
    marginLeft: notebook.margin - space.sm,
    marginRight: space.xxl,
    marginTop: space.xl,
    marginBottom: space.xxl,
    backgroundColor: colors.postIt,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    paddingBottom: space.lg,
    borderBottomRightRadius: radius.md,
    transform: [{ rotate: '-1.5deg' }],
    ...shadow(colors.postItShadow, 1.2),
  },
  tape: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    width: 72,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(31, 42, 68, 0.06)',
    transform: [{ rotate: '3deg' }],
  },
  postItRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  postItBig: { fontFamily: font.handBold, fontSize: font.handM, lineHeight: font.handMLine, color: colors.ink },
  postItPct: { fontFamily: font.handBold, fontSize: font.handL, lineHeight: font.handLLine, color: colors.primary },
  postItSub: { fontSize: font.caption, color: colors.textMuted, marginTop: space.xs },
  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(31, 42, 68, 0.10)',
    marginTop: space.md,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },

  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
    paddingLeft: INDENT,
    paddingRight: space.xl,
    height: notebook.line,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  tab: { minHeight: 44, justifyContent: 'center' },
  highlight: {
    position: 'absolute',
    left: -4,
    right: -4,
    bottom: 10,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.highlighter,
    transform: [{ rotate: '-2deg' }],
  },
  tabText: { fontFamily: font.hand, fontSize: font.handL, lineHeight: font.handLLine, color: colors.textSubtle },
  tabTextActive: { color: colors.ink },
  tabCount: { fontFamily: font.hand, fontSize: font.caption, color: colors.textSubtle },
  clear: { marginLeft: 'auto', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  line: {
    height: notebook.line,
    justifyContent: 'center',
    paddingLeft: INDENT,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  linePressed: { backgroundColor: colors.highlighter },
  placeholder: { fontFamily: font.hand, fontSize: font.handL, lineHeight: font.handLLine, color: colors.textSubtle },
  emptyNote: { fontFamily: font.hand, fontSize: font.handL, lineHeight: font.handLLine, color: colors.textMuted },

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
    ...shadow(colors.primary, 1.5),
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
