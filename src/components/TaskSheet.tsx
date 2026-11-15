import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Category, Priority, Task, TaskDraft } from '../types';
import { categories, colors, font, priorities, radius, space } from '../theme';

interface Props {
  visible: boolean;
  task: Task | null; // null = nouvelle mission
  onClose: () => void;
  onSubmit: (draft: TaskDraft) => void;
  onDelete: (id: string) => void;
}

const EMPTY: TaskDraft = { title: '', description: '', priority: 'moyenne', category: 'travail' };

export default function TaskSheet({ visible, task, onClose, onSubmit, onDelete }: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<TaskDraft>(EMPTY);
  const isEdit = !!task;
  const canSave = draft.title.trim().length > 0;

  useEffect(() => {
    if (visible) {
      setDraft(
        task
          ? { title: task.title, description: task.description, priority: task.priority, category: task.category }
          : EMPTY
      );
    }
  }, [visible, task]);

  const submit = () => {
    if (!canSave) return;
    onSubmit({ ...draft, title: draft.title.trim(), description: draft.description.trim() });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{isEdit ? 'Modifier la mission' : 'Nouvelle mission'}</Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.iconBtn} accessibilityLabel="Fermer">
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.titleInput}
              placeholder="Que dois-tu faire ?"
              placeholderTextColor={colors.textSubtle}
              value={draft.title}
              onChangeText={title => setDraft(d => ({ ...d, title }))}
              autoFocus={!isEdit}
              returnKeyType="done"
              onSubmitEditing={submit}
              maxLength={120}
            />
            <TextInput
              style={styles.noteInput}
              placeholder="Ajouter une note (facultatif)"
              placeholderTextColor={colors.textSubtle}
              value={draft.description}
              onChangeText={description => setDraft(d => ({ ...d, description }))}
              multiline
            />

            <Text style={styles.label}>Priorité</Text>
            <View style={styles.segment}>
              {(Object.keys(priorities) as Priority[]).map(p => {
                const active = draft.priority === p;
                const { color, label } = priorities[p];
                return (
                  <Pressable
                    key={p}
                    onPress={() => setDraft(d => ({ ...d, priority: p }))}
                    style={[styles.segmentItem, active && { backgroundColor: colors.surface, borderColor: color }]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.marks, { color }]}>{priorities[p].marks}</Text>
                    <Text style={[styles.segmentText, active && { color: colors.text, fontWeight: font.bold }]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.grid}>
              {(Object.keys(categories) as Category[]).map(c => {
                const active = draft.category === c;
                const { bg, fg, emoji, label } = categories[c];
                return (
                  <Pressable
                    key={c}
                    onPress={() => setDraft(d => ({ ...d, category: c }))}
                    style={[styles.catCard, { backgroundColor: bg }, active && { borderColor: fg }]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={styles.catEmoji}>{emoji}</Text>
                    <Text style={[styles.catLabel, { color: fg }]}>{label}</Text>
                    {active && (
                      <Ionicons name="checkmark-circle" size={18} color={fg} style={styles.catCheck} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <Pressable
            onPress={submit}
            disabled={!canSave}
            style={({ pressed }) => [styles.cta, !canSave && styles.ctaDisabled, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaText}>{isEdit ? 'Enregistrer' : 'Ajouter la mission'}</Text>
          </Pressable>

          {isEdit && task && (
            <Pressable onPress={() => onDelete(task.id)} style={styles.deleteBtn} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={styles.deleteText}>Supprimer la mission</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(28, 26, 25, 0.4)' },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    maxHeight: '92%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: space.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg },
  title: { fontFamily: font.handBold, fontSize: font.handL + 6, color: colors.ink },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperDeep,
  },
  titleInput: {
    fontFamily: font.hand,
    fontSize: font.handL + 6,
    color: colors.ink,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  noteInput: {
    fontSize: font.body,
    color: colors.text,
    paddingVertical: space.md,
    minHeight: 48,
    maxHeight: 120,
    textAlignVertical: 'top',
    marginBottom: space.xl,
  },
  label: {
    fontSize: font.caption,
    fontWeight: font.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: space.sm,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.paperDeep,
    borderRadius: radius.sm,
    padding: space.xs,
    gap: space.xs,
    marginBottom: space.xl,
  },
  segmentItem: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  segmentText: { fontSize: font.caption, color: colors.textMuted },
  marks: { fontFamily: font.handBold, fontSize: font.title, letterSpacing: -1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.xl },
  catCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  catEmoji: { fontSize: font.body },
  catLabel: { fontSize: font.caption, fontWeight: font.bold },
  catCheck: { marginLeft: 'auto' },
  cta: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaPressed: { transform: [{ scale: 0.98 }] },
  ctaText: { color: colors.white, fontSize: font.body, fontWeight: font.bold },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    height: 48,
    marginTop: space.xs,
  },
  deleteText: { color: colors.danger, fontSize: font.body },
});
