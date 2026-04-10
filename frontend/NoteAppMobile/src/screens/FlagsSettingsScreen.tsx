import React, {useState} from 'react';
import {
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import {useFlagContext} from '../contexts/FlagContext';
import {useAccessibility} from '../contexts/AccessibilityContext';
import {useTheme} from '../contexts/ThemeContext';
import {FlagConfig, FLAG_ORDER} from '../theme/flags';
import {borderRadius, MIN_TOUCH_TARGET, spacing} from '../theme/spacing';

const PALETTE = [
  '#FF3B30','#FF6B35','#FF9F0A','#FFCC00','#34C759',
  '#007AFF','#5856D6','#AF52DE','#FF2D55','#636366',
  '#1C1C1E','#FFFFFF','#E2E8F0','#94A3B8',
];

interface Props { onBack: () => void; }

export default function FlagsSettingsScreen({onBack}: Props) {
  const {colors} = useTheme();
  const {typography} = useAccessibility();
  const {flagConfigs, updateFlagConfig, resetFlagConfigs} = useFlagContext();
  const [editing, setEditing] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState('');

  const orderedConfigs = FLAG_ORDER.map(l => flagConfigs.find(c => c.level === l)!).filter(Boolean);
  const s = buildStyles(colors, typography);

  const startEdit = (cfg: FlagConfig) => {
    setEditing(cfg.level);
    setLabelDraft(cfg.label);
  };

  const saveLabel = async (cfg: FlagConfig) => {
    if (labelDraft.trim()) {
      await updateFlagConfig({...cfg, label: labelDraft.trim()});
    }
    setEditing(null);
  };

  const setColor = async (cfg: FlagConfig, color: string) => {
    const isDark = isColorDark(color);
    await updateFlagConfig({...cfg, color, textColor: isDark ? '#FFFFFF' : '#1C1C1E'});
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Flag Settings</Text>
        <TouchableOpacity style={s.resetBtn} onPress={resetFlagConfigs} accessibilityRole="button" accessibilityLabel="Reset to defaults">
          <Text style={s.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>TAP A FLAG TO CUSTOMISE ITS NAME AND COLOR</Text>

        {orderedConfigs.map(cfg => (
          <View key={cfg.level} style={s.row}>
            <View style={[s.flagBadge, {backgroundColor: cfg.color, borderColor: cfg.borderColor}]}>
              <Text style={s.flagEmoji}>{cfg.emoji}</Text>
              <Text style={[s.flagLabel, {color: cfg.textColor}]}>{cfg.label}</Text>
            </View>

            {editing === cfg.level ? (
              <View style={s.editArea}>
                {/* Label editor */}
                <TextInput
                  style={s.labelInput}
                  value={labelDraft}
                  onChangeText={setLabelDraft}
                  maxLength={20}
                  accessibilityLabel={`Edit label for ${cfg.level}`}
                  autoFocus
                />
                {/* Color picker */}
                <View style={s.palette}>
                  {PALETTE.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        s.swatch,
                        {backgroundColor: color},
                        cfg.color === color && s.swatchActive,
                      ]}
                      onPress={() => setColor(cfg, color)}
                      accessibilityRole="button"
                      accessibilityLabel={`Select color ${color}`}
                    />
                  ))}
                </View>
                <TouchableOpacity style={s.saveBtn} onPress={() => saveLabel(cfg)} accessibilityRole="button" accessibilityLabel="Save changes">
                  <Text style={s.saveBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => startEdit(cfg)}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${cfg.label} flag`}>
                <Text style={s.editBtnText}>✏️ Customise</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={s.hint}>
          <Text style={s.hintText}>
            Colors follow a hot-to-cool scale: 🔴 Critical → 🟠 High → 🟡 Important → 🟢 Normal → 🔵 Low
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function isColorDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
}

function buildStyles(colors: any, typography: any) {
  return StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
      minHeight: 56,
    },
    backBtn: {minWidth: 80, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center'},
    backText: {fontSize: typography.md, color: colors.primary, fontWeight: '500'},
    title: {fontSize: typography.md, fontWeight: '700', color: colors.textPrimary},
    resetBtn: {minWidth: 80, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', alignItems: 'flex-end'},
    resetText: {fontSize: typography.sm, color: colors.error, fontWeight: '600'},
    body: {flex: 1, padding: spacing.md},
    sectionLabel: {
      fontSize: typography.xs, fontWeight: '700', color: colors.textSecondary,
      letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.md,
    },
    row: {
      backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1,
      borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm,
    },
    flagBadge: {
      flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
      borderRadius: borderRadius.full, borderWidth: 1.5,
      paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
      gap: spacing.xs, marginBottom: spacing.sm,
    },
    flagEmoji: {fontSize: 16},
    flagLabel: {fontSize: typography.sm, fontWeight: '700'},
    editArea: {gap: spacing.sm},
    labelInput: {
      borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      fontSize: typography.md, color: colors.textPrimary,
      minHeight: MIN_TOUCH_TARGET,
    },
    palette: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
    swatch: {width: 32, height: 32, borderRadius: borderRadius.full, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)'},
    swatchActive: {borderWidth: 3, borderColor: colors.primary},
    saveBtn: {
      backgroundColor: colors.primary, borderRadius: borderRadius.full,
      paddingVertical: spacing.sm, alignItems: 'center',
    },
    saveBtnText: {color: '#FFFFFF', fontWeight: '700', fontSize: typography.sm},
    editBtn: {alignSelf: 'flex-start'},
    editBtnText: {fontSize: typography.sm, color: colors.primary, fontWeight: '600'},
    hint: {
      backgroundColor: colors.primaryLight, borderRadius: borderRadius.md,
      padding: spacing.md, marginTop: spacing.md, marginBottom: spacing.xxl,
    },
    hintText: {fontSize: typography.sm, color: colors.primary, lineHeight: typography.sm * 1.6},
  });
}
