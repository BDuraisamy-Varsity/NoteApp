import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useAccessibility} from '../contexts/AccessibilityContext';
import {useFlagContext} from '../contexts/FlagContext';
import {useTheme} from '../contexts/ThemeContext';
import {NoteDto} from '../services/api';
import {borderRadius, MIN_TOUCH_TARGET, shadow, spacing} from '../theme/spacing';
import {getFlagConfig} from '../theme/flags';

interface NoteCardProps {
  note: NoteDto;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TAG_COLORS = [
  {bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE'},
  {bg: '#F0FDF4', text: '#166534', border: '#BBF7D0'},
  {bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA'},
  {bg: '#FDF4FF', text: '#7E22CE', border: '#E9D5FF'},
  {bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE'},
];

export default function NoteCard({note, onPress, onEdit, onDelete}: NoteCardProps) {
  const {colors} = useTheme();
  const {typography} = useAccessibility();
  const {flagConfigs} = useFlagContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const flagCfg = getFlagConfig(flagConfigs, (note.flag ?? 'None') as any);

  const styles = buildStyles(colors, typography);
  const preview = note.body.replace(/\n+/g, ' ').trim().slice(0, 100);
  const formattedDate = formatDate(note.updatedAt);
  const completedCount = note.todoItems.filter(t => t.isCompleted).length;

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Note: ${note.title}`}
        activeOpacity={0.7}>

        {/* Accent bar — color-coded by flag */}
        <View style={[styles.accentBar, {backgroundColor: note.flag && note.flag !== 'None' ? flagCfg.color : colors.primary}]} />

        <View style={styles.cardContent}>
          {/* Header row */}
          <View style={styles.cardHeader}>
            <Text style={styles.title} numberOfLines={2}>
              {note.title || 'Untitled'}
            </Text>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={e => { e.stopPropagation?.(); setMenuOpen(v => !v); }}
              accessibilityRole="button"
              accessibilityLabel="Note options"
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.menuDots}>⋮</Text>
            </TouchableOpacity>
          </View>

          {/* Body preview */}
          {preview ? (
            <Text style={styles.preview} numberOfLines={3}>
              {preview}
            </Text>
          ) : null}

          {/* Tags */}
          {note.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {note.tags.slice(0, 3).map((tag, i) => {
                const tagColor = TAG_COLORS[i % TAG_COLORS.length];
                return (
                  <View key={tag} style={[styles.tag, {backgroundColor: tagColor.bg, borderColor: tagColor.border}]}>
                    <Text style={[styles.tagText, {color: tagColor.text}]}>{tag}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.date}>{formattedDate}</Text>
            <View style={styles.footerRight}>
              {note.flag && note.flag !== 'None' && (
                <View style={[styles.flagBadge, {backgroundColor: flagCfg.color}]}>
                  <Text style={styles.flagEmoji}>{flagCfg.emoji}</Text>
                  <Text style={[styles.flagBadgeText, {color: flagCfg.textColor}]}>{flagCfg.label}</Text>
                </View>
              )}
                      {note.todoItems.length > 0 && (
                <View style={styles.todoBadge}>
                  <Text style={styles.todoBadgeText}>✓ {completedCount}/{note.todoItems.length}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Inline action menu */}
      {menuOpen && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => { setMenuOpen(false); onEdit(); }}
            accessibilityRole="button"
            accessibilityLabel="Edit note">
            <Text style={styles.menuItemIcon}>✏️</Text>
            <Text style={styles.menuItemText}>Edit</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemDanger]}
            onPress={() => { setMenuOpen(false); onDelete(); }}
            accessibilityRole="button"
            accessibilityLabel="Delete note">
            <Text style={styles.menuItemIcon}>🗑️</Text>
            <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dismiss overlay */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setMenuOpen(false)}
          accessibilityLabel="Close menu"
        />
      )}
    </View>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) { return 'Today'; }
  if (diffDays === 1) { return 'Yesterday'; }
  if (diffDays < 7) { return `${diffDays} days ago`; }
  return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}

function buildStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useAccessibility>['typography'],
) {
  return StyleSheet.create({
    cardWrapper: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      position: 'relative',
      zIndex: 1,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      overflow: 'hidden',
      ...shadow.sm,
    },
    accentBar: {
      width: 4,
      backgroundColor: colors.primary,
      borderTopLeftRadius: borderRadius.md,
      borderBottomLeftRadius: borderRadius.md,
    },
    cardContent: {
      flex: 1,
      padding: spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    title: {
      flex: 1,
      fontSize: typography.lg,
      fontWeight: '700',
      color: colors.textPrimary,
      lineHeight: typography.lg * 1.3,
      marginRight: spacing.sm,
    },
    menuButton: {
      width: MIN_TOUCH_TARGET,
      height: MIN_TOUCH_TARGET,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -spacing.sm,
      marginRight: -spacing.sm,
    },
    menuDots: {
      fontSize: 22,
      color: colors.textSecondary,
      fontWeight: '700',
    },
    preview: {
      fontSize: typography.sm,
      color: colors.textSecondary,
      lineHeight: typography.sm * 1.6,
      marginBottom: spacing.sm,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    tag: {
      borderRadius: borderRadius.full,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    tagText: {
      fontSize: typography.xs,
      fontWeight: '500',
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    date: {
      fontSize: typography.xs,
      color: colors.textDisabled,
      fontWeight: '400',
    },
    footerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    flagBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      gap: 3,
    },
    flagEmoji: { fontSize: 11 },
    flagBadgeText: { fontSize: typography.xs, fontWeight: '700' },
    todoBadge: {
      backgroundColor: colors.primaryLight,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    todoBadgeText: {
      fontSize: typography.xs,
      color: colors.primary,
      fontWeight: '600',
    },
    menu: {
      position: 'absolute',
      top: 48,
      right: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 100,
      minWidth: 140,
      ...shadow.md,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      gap: spacing.sm,
    },
    menuItemDanger: {},
    menuItemIcon: {
      fontSize: 16,
    },
    menuItemText: {
      fontSize: typography.sm,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    menuItemTextDanger: {
      color: colors.error,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing.sm,
    },
    overlay: {
      position: 'absolute',
      top: -1000,
      left: -1000,
      right: -1000,
      bottom: -1000,
      zIndex: 99,
    },
  });
}
