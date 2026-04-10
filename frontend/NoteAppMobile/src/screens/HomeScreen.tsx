import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {useAccessibility} from '../contexts/AccessibilityContext';
import {ThemeMode, useTheme} from '../contexts/ThemeContext';
import {useFlagContext} from '../contexts/FlagContext';
import {FLAG_ORDER, getFlagConfig} from '../theme/flags';
import {FontSizeLevel} from '../theme/typography';
import {NoteDto, notesApi} from '../services/api';
import {borderRadius, MIN_TOUCH_TARGET, shadow, spacing} from '../theme/spacing';
import NoteCard from '../components/NoteCard';

interface HomeScreenProps {
  onNotePress:    (note: NoteDto) => void;
  onCreatePress:  () => void;
  onEditPress:    (note: NoteDto) => void;
  onDeletePress:  (note: NoteDto) => void;
  onSettingsPress: () => void;
  onAgentPress:   () => void;
}

const THEME_OPTS: {mode: ThemeMode; icon: string; label: string}[] = [
  {mode: 'light',  icon: '☀️', label: 'Light'},
  {mode: 'dark',   icon: '🌙', label: 'Dark'},
  {mode: 'system', icon: '💻', label: 'System'},
];

const FONT_OPTS: {level: FontSizeLevel; label: string; fs: number}[] = [
  {level: 'small',  label: 'A', fs: 11},
  {level: 'medium', label: 'A', fs: 14},
  {level: 'large',  label: 'A', fs: 17},
  {level: 'xl',     label: 'A', fs: 21},
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) { return 'Good morning ☀️'; }
  if (h < 17) { return 'Good afternoon 🌤'; }
  return 'Good evening 🌙';
}

export default function HomeScreen({onNotePress, onCreatePress, onEditPress, onDeletePress, onSettingsPress, onAgentPress}: HomeScreenProps) {
  const {colors, themeMode, setTheme, isDark} = useTheme();
  const {typography, fontSizeLevel, setFontSizeLevel} = useAccessibility();
  const {flagConfigs} = useFlagContext();
  const {width} = useWindowDimensions();

  const [notes, setNotes]             = useState<NoteDto[]>([]);
  const [filtered, setFiltered]       = useState<NoteDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag]     = useState<string | null>(null);
  const [activeFlag, setActiveFlag]   = useState<string | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const isTablet   = width >= 768;
  const numColumns = isTablet ? 2 : 1;

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notesApi.getAll();
      setNotes(data);
      setFiltered(data);
    } catch {
      setError('Failed to load notes. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Collect all unique tags across notes
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const applyFilter = useCallback((query: string, tag: string | null, flag: string | null, all: NoteDto[]) => {
    let result = all;
    if (tag)  { result = result.filter(n => n.tags.includes(tag)); }
    if (flag) { result = result.filter(n => (n.flag ?? 'None') === flag); }
    if (query.trim()) { result = result.filter(n =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.body.toLowerCase().includes(query.toLowerCase()),
    ); }
    setFiltered(result);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0 && !activeTag && !activeFlag) {
      setFiltered(notes);
      return;
    }
    if (query.trim().length > 1) {
      try {
        const results = await notesApi.search(query);
        setFiltered(results);
      } catch { setError('Search failed.'); }
    } else {
      applyFilter(query, activeTag, activeFlag, notes);
    }
  }, [notes, activeTag, applyFilter]);

  const handleTagFilter = (tag: string | null) => {
    setActiveTag(tag);
    applyFilter(searchQuery, tag, activeFlag, notes);
  };

  const handleFlagFilter = (flag: string | null) => {
    setActiveFlag(flag);
    applyFilter(searchQuery, activeTag, flag, notes);
  };

  const s = buildStyles(colors, typography, isDark);

  const Hero = (
    <View style={s.hero}>
      {/* ── Controls ─────────────────────────── */}
      <View style={s.controlsRow}>
        <View style={s.pill}>
          {THEME_OPTS.map(o => (
            <TouchableOpacity
              key={o.mode}
              style={[s.pillBtn, themeMode === o.mode && s.pillBtnActive]}
              onPress={() => setTheme(o.mode)}
              accessibilityRole="button"
              accessibilityLabel={`${o.label} theme`}
              accessibilityState={{selected: themeMode === o.mode}}>
              <Text style={s.pillIcon}>{o.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.pill}>
          {FONT_OPTS.map(o => (
            <TouchableOpacity
              key={o.level}
              style={[s.pillBtn, fontSizeLevel === o.level && s.pillBtnActive]}
              onPress={() => setFontSizeLevel(o.level)}
              accessibilityRole="button"
              accessibilityLabel={`Font ${o.level}`}
              accessibilityState={{selected: fontSizeLevel === o.level}}>
              <Text style={[s.fontBtnText, {fontSize: o.fs}, fontSizeLevel === o.level && s.fontBtnActive]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Greeting + logo ──────────────────── */}
      <View style={s.brandRow}>
        <View>
          <Text style={s.greetingText}>{greeting()}</Text>
          <Text style={s.heroTitle}>NoteApp</Text>
          <Text style={s.heroSubtitle}>Capture, organise & find your ideas</Text>
        </View>
        <View style={s.logoWrap}>
          <Text style={s.logoGlyph}>✦</Text>
        </View>
      </View>

      {/* ── Stats row ────────────────────────── */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statNum}>{notes.length}</Text>
          <Text style={s.statLbl}>{notes.length === 1 ? 'Note' : 'Notes'}</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNum}>{notes.filter(n => n.tags.length > 0).length}</Text>
          <Text style={s.statLbl}>Tagged</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNum}>{notes.filter(n => n.todoItems.length > 0).length}</Text>
          <Text style={s.statLbl}>With todos</Text>
        </View>
        <View style={{flex: 1}} />
        <TouchableOpacity style={s.settingsBtn} onPress={onSettingsPress} accessibilityRole="button" accessibilityLabel="Flag settings">
          <Text style={s.settingsBtnIcon}>🏷️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.settingsBtn} onPress={onAgentPress} accessibilityRole="button" accessibilityLabel="AI Assistant">
          <Text style={s.settingsBtnIcon}>🤖</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.newBtn} onPress={onCreatePress} accessibilityRole="button" accessibilityLabel="New note">
          <Text style={s.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const Controls = (
    <>
      {/* ── Search ───────────────────────────── */}
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Text style={s.searchGlass}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search notes…"
            placeholderTextColor={colors.textDisabled}
            value={searchQuery}
            onChangeText={handleSearch}
            accessibilityLabel="Search notes"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} accessibilityLabel="Clear" hitSlop={{top:8,bottom:8,left:8,right:8}}>
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Tag filter chips ─────────────────── */}
      {allTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsRow}
          style={s.chipsScroll}>
          <TouchableOpacity
            style={[s.chip, !activeTag && s.chipActive]}
            onPress={() => handleTagFilter(null)}
            accessibilityRole="button"
            accessibilityLabel="All notes"
            accessibilityState={{selected: !activeTag}}>
            <Text style={[s.chipText, !activeTag && s.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {allTags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[s.chip, activeTag === tag && s.chipActive]}
              onPress={() => handleTagFilter(tag)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${tag}`}
              accessibilityState={{selected: activeTag === tag}}>
              <Text style={[s.chipText, activeTag === tag && s.chipTextActive]}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Flag filter chips ────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipsRow}
        style={s.chipsScroll}>
        <TouchableOpacity
          style={[s.chip, !activeFlag && s.chipActive]}
          onPress={() => handleFlagFilter(null)}
          accessibilityRole="button"
          accessibilityLabel="All flags"
          accessibilityState={{selected: !activeFlag}}>
          <Text style={[s.chipText, !activeFlag && s.chipTextActive]}>All flags</Text>
        </TouchableOpacity>
        {FLAG_ORDER.filter(f => f !== 'None').map(level => {
          const cfg = getFlagConfig(flagConfigs, level as any);
          const isActive = activeFlag === level;
          return (
            <TouchableOpacity
              key={level}
              style={[s.chip, isActive && {backgroundColor: cfg.color, borderColor: cfg.color}]}
              onPress={() => handleFlagFilter(level)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${cfg.label}`}
              accessibilityState={{selected: isActive}}>
              <Text style={[s.chipText, isActive && {color: cfg.textColor}]}>
                {cfg.emoji} {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Section label ────────────────────── */}
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>
          {searchQuery ? `Results for "${searchQuery}"` : activeTag ? `#${activeTag}` : activeFlag ? activeFlag : 'Recent'}
        </Text>
        <Text style={s.sectionCount}>{filtered.length}</Text>
      </View>

      {/* ── Error ────────────────────────────── */}
      {error && (
        <View style={s.errorBar}>
          <Text style={s.errorTxt} accessibilityRole="alert">⚠ {error}</Text>
          <TouchableOpacity onPress={loadNotes} accessibilityLabel="Retry">
            <Text style={s.retryTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && filtered.length === 0 && (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingTxt}>Loading notes…</Text>
        </View>
      )}
    </>
  );

  return (
    <View style={s.container}>
      <FlatList
        data={filtered}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={item => item.id}
        ListHeaderComponent={<>{Hero}{Controls}</>}
        renderItem={({item}) => (
          <View style={isTablet ? s.tabletItem : undefined}>
            <NoteCard
              note={item}
              onPress={() => onNotePress(item)}
              onEdit={() => onEditPress(item)}
              onDelete={() => onDeletePress(item)}
            />
          </View>
        )}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📝</Text>
              <Text style={s.emptyTitle}>
                {searchQuery || activeTag ? 'No results found' : 'Your workspace is empty'}
              </Text>
              <Text style={s.emptyBody}>
                {searchQuery || activeTag
                  ? 'Try a different search or filter.'
                  : 'Tap + New above or the button below to create your first note.'}
              </Text>
              {!searchQuery && !activeTag && (
                <TouchableOpacity style={s.emptyBtn} onPress={onCreatePress} accessibilityRole="button" accessibilityLabel="Create first note">
                  <Text style={s.emptyBtnText}>Create a note</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        onRefresh={loadNotes}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={s.fab} onPress={onCreatePress} accessibilityRole="button" accessibilityLabel="Create new note">
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function buildStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useAccessibility>['typography'],
  isDark: boolean,
) {
  const heroBg = isDark ? '#1E1B4B' : '#4F46E5';

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // ── Hero ──────────────────────────────────────────────────────
    hero: {
      backgroundColor: heroBg,
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxxl,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },

    // Pill (theme + font)
    pill: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: borderRadius.full,
      padding: 3,
      gap: 2,
    },
    pillBtn: {
      minWidth: 36, height: 36,
      borderRadius: borderRadius.full,
      alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 6,
    },
    pillBtnActive: { backgroundColor: 'rgba(255,255,255,0.9)' },
    pillIcon:      { fontSize: 16 },
    fontBtnText:   { color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
    fontBtnActive: { color: '#4F46E5' },

    // Branding
    brandRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    greetingText: {
      fontSize: typography.sm,
      color: 'rgba(255,255,255,0.75)',
      marginBottom: 4,
      fontWeight: '500',
    },
    heroTitle: {
      fontSize: typography.title,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -1,
      lineHeight: typography.title * 1.1,
    },
    heroSubtitle: {
      fontSize: typography.sm,
      color: 'rgba(255,255,255,0.65)',
      marginTop: 4,
    },
    logoWrap: {
      width: 56, height: 56,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center',
    },
    logoGlyph: { fontSize: 26, color: '#FFFFFF' },

    // Stats
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    statItem: { alignItems: 'center' },
    statNum:  { fontSize: typography.xl, fontWeight: '800', color: '#FFFFFF' },
    statLbl:  { fontSize: typography.xs, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
    statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
    settingsBtn: {
      width: 36, height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center',
    },
    settingsBtnIcon: { fontSize: 18 },
    newBtn: {
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
    },
    newBtnText: { color: '#1C1C1E', fontSize: typography.sm, fontWeight: '800' },

    // ── Search ─────────────────────────────────────────────────────
    searchWrap: {
      paddingHorizontal: spacing.md,
      marginTop: -spacing.lg,
      marginBottom: spacing.sm,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      minHeight: 52,
      gap: spacing.sm,
      ...shadow.md,
    },
    searchGlass:  { fontSize: 16 },
    searchInput:  { flex: 1, fontSize: typography.md, color: colors.textPrimary, paddingVertical: spacing.sm },
    clearBtn:     { fontSize: 14, color: colors.textDisabled, padding: spacing.xs },

    // ── Chips ──────────────────────────────────────────────────────
    chipsScroll: { marginBottom: spacing.xs },
    chipsRow: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      flexDirection: 'row',
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    chipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText:       { fontSize: typography.sm, color: colors.textSecondary, fontWeight: '600' },
    chipTextActive: { color: '#FFFFFF' },

    // ── Section label ──────────────────────────────────────────────
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xs,
    },
    sectionTitle: {
      fontSize: typography.xs,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    sectionCount: {
      fontSize: typography.xs,
      color: colors.textDisabled,
      fontWeight: '600',
    },

    // ── Error ──────────────────────────────────────────────────────
    errorBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.errorLight,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    errorTxt:  { flex: 1, fontSize: typography.sm, color: colors.error },
    retryTxt:  { fontSize: typography.sm, color: colors.error, fontWeight: '700', marginLeft: spacing.md },

    // ── Loading ────────────────────────────────────────────────────
    loadingWrap: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
    loadingTxt:  { fontSize: typography.md, color: colors.textSecondary },

    // ── List ───────────────────────────────────────────────────────
    listContent: { paddingBottom: 100 },
    tabletItem:  { flex: 1 },

    // ── Empty state ────────────────────────────────────────────────
    empty: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.xxl,
    },
    emptyIcon:  { fontSize: 52, marginBottom: spacing.md },
    emptyTitle: { fontSize: typography.lg, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
    emptyBody:  { fontSize: typography.md, color: colors.textSecondary, textAlign: 'center', lineHeight: typography.md * 1.6, marginBottom: spacing.lg },
    emptyBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
    },
    emptyBtnText: { color: '#FFFFFF', fontSize: typography.md, fontWeight: '700' },

    // ── FAB ────────────────────────────────────────────────────────
    fab: {
      position: 'absolute',
      bottom: spacing.xl, right: spacing.xl,
      width: 60, height: 60,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
      ...shadow.lg,
    },
    fabIcon: { color: '#FFFFFF', fontSize: 34, fontWeight: '300', lineHeight: 38, marginTop: -2 },
  });
}
