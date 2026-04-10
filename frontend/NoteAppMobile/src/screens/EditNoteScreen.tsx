import React, {useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAccessibility} from '../contexts/AccessibilityContext';
import {useFlagContext} from '../contexts/FlagContext';
import {useTheme} from '../contexts/ThemeContext';
import {CreateNoteRequest, FlagLevel, NoteDto, TodoItemDto, UpdateNoteRequest, aiApi, notesApi} from '../services/api';
import {borderRadius, MIN_TOUCH_TARGET, spacing} from '../theme/spacing';
import {FLAG_ORDER, getFlagConfig, autoDetectFlag} from '../theme/flags';

interface EditNoteScreenProps {
  note?: NoteDto;          // if provided → edit mode, else → create mode
  onSave: (note: NoteDto) => void;
  onCancel: () => void;
  onDelete?: (note: NoteDto) => void;
}

export default function EditNoteScreen({note, onSave, onCancel, onDelete}: EditNoteScreenProps) {
  const {colors} = useTheme();
  const {typography} = useAccessibility();
  const {flagConfigs} = useFlagContext();
  const isEditMode = !!note;

  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [flag, setFlag] = useState<FlagLevel>(note?.flag ?? 'None');
  const [todoItems, setTodoItems] = useState<TodoItemDto[]>(note?.todoItems ?? []);
  const [newTodoText, setNewTodoText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<'tags' | 'summary' | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const canSave = title.trim().length > 0 && !isSaving;
  const isDirty = title !== (note?.title ?? '') || body !== (note?.body ?? '');

  const handleAiSuggestTags = async () => {
    if (!title.trim()) { return; }
    setAiLoading('tags');
    setError(null);
    try {
      const suggested = await aiApi.suggestTags(title, body);
      // navigate to edit screen is already open; just show as info for now
      setAiSummary(`Suggested tags: ${suggested.join(', ')}`);
    } catch {
      setError('AI tag suggestion failed.');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiSummarize = async () => {
    if (!title.trim()) { return; }
    setAiLoading('summary');
    setError(null);
    try {
      const summary = await aiApi.summarize(title, body);
      setAiSummary(summary);
    } catch {
      setError('AI summarization failed.');
    } finally {
      setAiLoading(null);
    }
  };

  const addTodoItem = () => {
    if (!newTodoText.trim()) { return; }
    const item: TodoItemDto = {
      id: `temp-${Date.now()}`,
      text: newTodoText.trim(),
      isCompleted: false,
      order: todoItems.length,
    };
    setTodoItems(prev => [...prev, item]);
    setNewTodoText('');
  };

  const toggleTodoItem = (id: string) => {
    setTodoItems(prev =>
      prev.map(t => t.id === id ? {...t, isCompleted: !t.isCompleted} : t),
    );
  };

  const deleteTodoItem = (id: string) => {
    setTodoItems(prev => prev.filter(t => t.id !== id));
  };

  const handleSave = async () => {
    if (!canSave) { return; }
    setIsSaving(true);
    setError(null);
    try {
      let saved: NoteDto;
      if (isEditMode && note) {
        const req: UpdateNoteRequest = {
          id: note.id,
          title: title.trim(),
          body: body.trim(),
          flag,
          tags: note.tags,
          todoItems: todoItems.map((t, idx) => ({
            ...t,
            id: t.id.startsWith('temp-') ? '00000000-0000-0000-0000-000000000000' : t.id,
            order: idx,
          })),
        };
        saved = await notesApi.update(note.id, req);
      } else {
        const req: CreateNoteRequest = {
          title: title.trim(),
          body: body.trim(),
          flag,
          tags: [],
          todoItems: [],
        };
        saved = await notesApi.create(req);
      }
      onSave(saved);
    } catch {
      setError('Failed to save. Please try again.');
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!note || !onDelete) { return; }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!note || !onDelete) { return; }
    setShowDeleteConfirm(false);
    try {
      await notesApi.delete(note.id);
      onDelete(note);
    } catch {
      setError('Failed to delete. Please try again.');
    }
  };

  const styles = buildStyles(colors, typography);

  return (
    <View style={styles.container}>
      {/* ── Top bar ──────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarBtn}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel">
          <Text style={styles.cancelText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.screenTitle}>{isEditMode ? 'Edit Note' : 'New Note'}</Text>

        <View style={styles.topBarActions}>
          {isEditMode && onDelete && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              accessibilityRole="button"
              accessibilityLabel="Delete note">
              <Text style={styles.deleteBtnIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave}
            accessibilityRole="button"
            accessibilityLabel="Save note"
            accessibilityState={{disabled: !canSave}}>
            {isSaving
              ? <ActivityIndicator size="small" color={colors.textOnPrimary} />
              : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Error ────────────────────────────────── */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} accessibilityRole="alert">⚠ {error}</Text>
        </View>
      )}

      {/* ── Form ─────────────────────────────────── */}
      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <TextInput
            style={styles.titleInput}
            placeholder="Note title"
            placeholderTextColor={colors.textDisabled}
            value={title}
            onChangeText={setTitle}
            accessibilityLabel="Note title"
            autoFocus={!isEditMode}
            returnKeyType="next"
            maxLength={200}
          />

          <View style={styles.divider} />

          {/* Flag selector */}
          <View style={styles.flagSection}>
            <View style={styles.flagHeader}>
              <Text style={styles.flagSectionLabel}>Priority flag</Text>
              <TouchableOpacity
                onPress={() => setFlag(autoDetectFlag(title, body) as FlagLevel)}
                accessibilityRole="button"
                accessibilityLabel="Auto-detect flag from content">
                <Text style={styles.autoDetectBtn}>✨ Auto-detect</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.flagPicker}>
              {FLAG_ORDER.map(level => {
                const cfg = getFlagConfig(flagConfigs, level as any);
                const isActive = flag === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[styles.flagOption, {borderColor: cfg.color}, isActive && {backgroundColor: cfg.color}]}
                    onPress={() => setFlag(level as FlagLevel)}
                    accessibilityRole="button"
                    accessibilityLabel={`Set flag to ${cfg.label}`}
                    accessibilityState={{selected: isActive}}>
                    <Text style={styles.flagOptionEmoji}>{cfg.emoji}</Text>
                    <Text style={[styles.flagOptionLabel, isActive && {color: cfg.textColor}]}>
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          <TextInput
            style={styles.bodyInput}
            placeholder="Start writing your note…"
            placeholderTextColor={colors.textDisabled}
            value={body}
            onChangeText={setBody}
            accessibilityLabel="Note body"
            multiline
            textAlignVertical="top"
          />

          <View style={styles.divider} />

          {/* AI actions */}
          <View style={styles.aiRow}>
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={handleAiSuggestTags}
              disabled={!!aiLoading}
              accessibilityRole="button"
              accessibilityLabel="Suggest tags with AI">
              {aiLoading === 'tags'
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Text style={styles.aiBtnText}>✨ Suggest Tags</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={handleAiSummarize}
              disabled={!!aiLoading}
              accessibilityRole="button"
              accessibilityLabel="Summarize note with AI">
              {aiLoading === 'summary'
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Text style={styles.aiBtnText}>📝 Summarize</Text>}
            </TouchableOpacity>
          </View>

          {aiSummary && (
            <View style={styles.aiResult}>
              <Text style={styles.aiResultText}>{aiSummary}</Text>
              <TouchableOpacity onPress={() => setAiSummary(null)} accessibilityLabel="Dismiss AI result">
                <Text style={styles.aiResultDismiss}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* To-Do list */}
        <View style={[styles.formCard, {marginTop: 0}]}>
          <Text style={styles.sectionLabel}>TO-DO LIST</Text>

          {todoItems.map(item => (
            <View key={item.id} style={styles.todoRow}>
              <TouchableOpacity
                onPress={() => toggleTodoItem(item.id)}
                accessibilityRole="checkbox"
                accessibilityState={{checked: item.isCompleted}}
                style={styles.todoCheck}>
                <Text style={styles.todoCheckIcon}>{item.isCompleted ? '☑' : '☐'}</Text>
              </TouchableOpacity>
              <Text style={[styles.todoText, item.isCompleted && styles.todoTextDone]}>
                {item.text}
              </Text>
              <TouchableOpacity
                onPress={() => deleteTodoItem(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Delete todo: ${item.text}`}
                style={styles.todoDelete}>
                <Text style={styles.todoDeleteIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.todoInputRow}>
            <TextInput
              style={styles.todoInput}
              placeholder="Add to-do item…"
              placeholderTextColor={colors.textDisabled}
              value={newTodoText}
              onChangeText={setNewTodoText}
              onSubmitEditing={addTodoItem}
              returnKeyType="done"
              accessibilityLabel="New to-do item"
            />
            <TouchableOpacity
              style={styles.todoAddBtn}
              onPress={addTodoItem}
              disabled={!newTodoText.trim()}
              accessibilityRole="button"
              accessibilityLabel="Add to-do item">
              <Text style={styles.todoAddBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Metadata row for edit mode */}
        {isEditMode && note && (
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Created {formatDate(note.createdAt)}
            </Text>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaText}>
              Updated {formatDate(note.updatedAt)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Delete confirm dialog ─────────────────── */}
      {showDeleteConfirm && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Delete this note?</Text>
            <Text style={styles.dialogBody}>This action cannot be undone.</Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogCancel}
                onPress={() => setShowDeleteConfirm(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel delete">
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogConfirm}
                onPress={confirmDelete}
                accessibilityRole="button"
                accessibilityLabel="Confirm delete">
                <Text style={styles.dialogConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function buildStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useAccessibility>['typography'],
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Top bar
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.headerBorder,
      minHeight: 56,
    },
    topBarBtn: {
      minWidth: 80,
      minHeight: MIN_TOUCH_TARGET,
      justifyContent: 'center',
    },
    cancelText: {
      fontSize: typography.md,
      color: colors.primary,
      fontWeight: '500',
    },
    screenTitle: {
      fontSize: typography.md,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    topBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minWidth: 80,
      justifyContent: 'flex-end',
    },
    deleteBtn: {
      width: MIN_TOUCH_TARGET,
      height: MIN_TOUCH_TARGET,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.sm,
    },
    deleteBtnIcon: {
      fontSize: 20,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.xl,
      minWidth: 64,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 36,
    },
    saveBtnDisabled: {
      backgroundColor: colors.border,
    },
    saveBtnText: {
      color: colors.textOnPrimary,
      fontSize: typography.sm,
      fontWeight: '700',
    },

    // Error
    errorBanner: {
      backgroundColor: colors.errorLight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.error,
    },
    errorText: {
      fontSize: typography.sm,
      color: colors.error,
    },

    // Form
    body: {
      flex: 1,
      padding: spacing.md,
    },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    titleInput: {
      fontSize: typography.xl,
      fontWeight: '700',
      color: colors.textPrimary,
      minHeight: MIN_TOUCH_TARGET,
      paddingVertical: spacing.sm,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: spacing.sm,
    },
    bodyInput: {
      fontSize: typography.md,
      color: colors.textPrimary,
      lineHeight: typography.md * 1.7,
      minHeight: 240,
      paddingVertical: spacing.sm,
    },

    // AI actions
    aiRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    aiBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: borderRadius.xl,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 36,
    },
    aiBtnText: {
      fontSize: typography.sm,
      color: colors.primary,
      fontWeight: '600',
    },
    aiResult: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.primaryLight,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    aiResultText: {
      flex: 1,
      fontSize: typography.sm,
      color: colors.textPrimary,
      lineHeight: typography.sm * 1.5,
    },
    aiResultDismiss: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '700',
    },

    // Section label
    sectionLabel: {
      fontSize: typography.xs,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },

    // To-do list
    todoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.xs,
      gap: spacing.sm,
    },
    todoCheck: {
      width: MIN_TOUCH_TARGET,
      height: MIN_TOUCH_TARGET,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todoCheckIcon: {
      fontSize: 20,
      color: colors.primary,
    },
    todoText: {
      flex: 1,
      fontSize: typography.md,
      color: colors.textPrimary,
    },
    todoTextDone: {
      textDecorationLine: 'line-through' as const,
      color: colors.textDisabled,
    },
    todoDelete: {
      width: MIN_TOUCH_TARGET,
      height: MIN_TOUCH_TARGET,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todoDeleteIcon: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    todoInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    todoInput: {
      flex: 1,
      fontSize: typography.md,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      minHeight: MIN_TOUCH_TARGET,
    },
    todoAddBtn: {
      width: MIN_TOUCH_TARGET,
      height: MIN_TOUCH_TARGET,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todoAddBtnText: {
      fontSize: 22,
      color: colors.textOnPrimary,
      fontWeight: '700',
      lineHeight: 26,
    },

    // Flag selector
    flagSection: { marginVertical: spacing.sm },
    flagHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    flagSectionLabel: { fontSize: typography.sm, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    autoDetectBtn: { fontSize: typography.sm, color: colors.primary, fontWeight: '600' },
    flagPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    flagOption: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      borderWidth: 1.5, borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm, paddingVertical: 6,
    },
    flagOptionEmoji: { fontSize: 13 },
    flagOptionLabel: { fontSize: typography.xs, fontWeight: '600', color: colors.textSecondary },

    // Metadata
    metaRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.xs,
      marginBottom: spacing.md,
    },
    metaText: {
      fontSize: typography.xs,
      color: colors.textDisabled,
    },
    metaSep: {
      fontSize: typography.xs,
      color: colors.textDisabled,
    },

    // Delete dialog
    dialogOverlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
    },
    dialog: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      width: '80%',
      maxWidth: 360,
    },
    dialogTitle: {
      fontSize: typography.lg,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    dialogBody: {
      fontSize: typography.md,
      color: colors.textSecondary,
      marginBottom: spacing.xl,
    },
    dialogActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'flex-end',
    },
    dialogCancel: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dialogCancelText: {
      fontSize: typography.md,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    dialogConfirm: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.error,
    },
    dialogConfirmText: {
      fontSize: typography.md,
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });
}
