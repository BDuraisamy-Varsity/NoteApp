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
import {useTheme} from '../contexts/ThemeContext';
import {CreateNoteRequest, NoteDto, UpdateNoteRequest, notesApi} from '../services/api';
import {borderRadius, MIN_TOUCH_TARGET, spacing} from '../theme/spacing';

interface EditNoteScreenProps {
  note?: NoteDto;          // if provided → edit mode, else → create mode
  onSave: (note: NoteDto) => void;
  onCancel: () => void;
  onDelete?: (note: NoteDto) => void;
}

export default function EditNoteScreen({note, onSave, onCancel, onDelete}: EditNoteScreenProps) {
  const {colors} = useTheme();
  const {typography} = useAccessibility();
  const isEditMode = !!note;

  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = title.trim().length > 0 && !isSaving;
  const isDirty = title !== (note?.title ?? '') || body !== (note?.body ?? '');

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
          tags: note.tags,
          todoItems: note.todoItems,
        };
        saved = await notesApi.update(note.id, req);
      } else {
        const req: CreateNoteRequest = {
          title: title.trim(),
          body: body.trim(),
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
