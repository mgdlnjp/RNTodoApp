import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { categories, colors, font, notebook, priorities, space } from '../theme';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onOpen: (task: Task) => void;
}

// Une mission = une ligne du cahier. La case est dans la marge,
// la coche et le trait « au feutre » sont animés.
export default function TaskItem({ task, onToggle, onOpen }: Props) {
  const tick = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const strike = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const cat = categories[task.category];
  const prio = priorities[task.priority];

  useEffect(() => {
    if (task.completed) {
      Animated.sequence([
        Animated.spring(tick, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
        Animated.timing(strike, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      tick.setValue(0);
      strike.setValue(0);
    }
  }, [task.completed]);

  return (
    <Pressable
      onPress={() => onOpen(task)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityHint="Ouvre la mission pour la modifier"
    >
      {/* Marge : la case à cocher */}
      <Pressable
        onPress={() => onToggle(task.id)}
        hitSlop={8}
        style={styles.marginCell}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={task.completed ? 'Marquer comme à faire' : 'Marquer comme terminée'}
      >
        <View style={[styles.box, task.completed && styles.boxDone]} />
        <Animated.View
          pointerEvents="none"
          style={[styles.tick, { opacity: tick, transform: [{ scale: tick }, { rotate: '-8deg' }] }]}
        >
          <Ionicons name="checkmark-sharp" size={30} color={colors.primary} />
        </Animated.View>
      </Pressable>

      {/* Texte de la mission */}
      <View style={styles.body}>
        <View style={styles.titleWrap}>
          <Text
            style={[styles.title, task.completed && styles.titleDone]}
            numberOfLines={task.completed ? 1 : 2}
          >
            {task.title}
          </Text>
          <Animated.View
            pointerEvents="none"
            style={[styles.strike, { transform: [{ rotate: '-1.5deg' }, { scaleX: strike }] }]}
          />
        </View>
        {!task.completed && (
          <Text style={styles.meta} numberOfLines={1}>
            {cat.emoji} {cat.label}
            {task.description ? `  ·  ${task.description}` : ''}
          </Text>
        )}
      </View>

      {!task.completed && (
        <Text style={[styles.marks, { color: prio.color }]} accessibilityLabel={`Priorité ${prio.label}`}>
          {prio.marks}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: notebook.line,
    paddingVertical: space.sm,
    paddingRight: space.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  pressed: { backgroundColor: colors.highlighter },
  marginCell: {
    width: notebook.margin,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(31, 42, 68, 0.55)',
    transform: [{ rotate: '-3deg' }],
  },
  boxDone: { borderColor: 'rgba(31, 42, 68, 0.25)' },
  tick: { position: 'absolute', top: '50%', left: '50%', marginTop: -19, marginLeft: -12 },
  body: { flex: 1, paddingLeft: space.lg },
  titleWrap: { alignSelf: 'flex-start', justifyContent: 'center', maxWidth: '100%' },
  title: { fontSize: font.body, color: colors.ink },
  titleDone: { color: colors.textSubtle },
  strike: {
    position: 'absolute',
    left: -4,
    right: -4,
    top: '50%',
    height: 3,
    marginTop: -1,
    borderRadius: 2,
    backgroundColor: colors.primary,
    opacity: 0.85,
    transformOrigin: 'left',
  },
  meta: { fontSize: font.caption, color: colors.textMuted, marginTop: 2 },
  marks: { fontFamily: font.handBold, fontSize: font.handL, lineHeight: font.handLLine, marginLeft: space.sm },
});
