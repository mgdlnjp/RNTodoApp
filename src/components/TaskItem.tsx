import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { categories, colors, font, priorities, radius, shadow, space } from '../theme';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onOpen: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onOpen }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const cat = categories[task.category];
  const prio = priorities[task.priority];

  const handleToggle = () => {
    // Petit rebond : la validation doit se sentir.
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 160, useNativeDriver: true }),
    ]).start();
    onToggle(task.id);
  };

  return (
    <Pressable
      onPress={() => onOpen(task)}
      style={({ pressed }) => [styles.card, task.completed && styles.cardDone, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityHint="Ouvre la mission pour la modifier"
    >
      <Pressable
        onPress={handleToggle}
        hitSlop={12}
        style={styles.checkHit}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={task.completed ? 'Marquer comme à faire' : 'Marquer comme terminée'}
      >
        <Animated.View
          style={[
            styles.check,
            { borderColor: task.completed ? colors.primary : prio.color },
            task.completed && styles.checkDone,
            { transform: [{ scale }] },
          ]}
        >
          {task.completed && <Ionicons name="checkmark" size={18} color={colors.white} />}
        </Animated.View>
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.title, task.completed && styles.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        {!!task.description && !task.completed && (
          <Text style={styles.description} numberOfLines={1}>
            {task.description}
          </Text>
        )}
        <View style={styles.meta}>
          <View style={[styles.catChip, { backgroundColor: cat.bg }]}>
            <Text style={[styles.metaText, { color: cat.fg }]}>
              {cat.emoji} {cat.label}
            </Text>
          </View>
          {!task.completed && (
            <View style={styles.prio}>
              <View style={[styles.dot, { backgroundColor: prio.color }]} />
              <Text style={styles.metaMuted}>{prio.label}</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    paddingRight: space.lg,
    paddingLeft: space.sm,
    marginBottom: space.md,
    ...shadow(),
  },
  cardDone: { backgroundColor: 'rgba(255,255,255,0.6)', elevation: 0, shadowOpacity: 0 },
  pressed: { transform: [{ scale: 0.98 }] },
  checkHit: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  check: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.primary },
  body: { flex: 1, marginLeft: space.xs, marginRight: space.sm },
  title: { fontSize: font.body, fontWeight: font.bold, color: colors.text },
  titleDone: { color: colors.textSubtle, textDecorationLine: 'line-through', fontWeight: font.regular },
  description: { fontSize: font.caption, color: colors.textMuted, marginTop: space.xs },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: space.sm, gap: space.md },
  catChip: { paddingHorizontal: space.sm, paddingVertical: space.xs, borderRadius: radius.pill },
  metaText: { fontSize: font.caption, fontWeight: font.bold },
  prio: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  metaMuted: { fontSize: font.caption, color: colors.textMuted },
});
