import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAccessibility} from '../contexts/AccessibilityContext';
import {useTheme} from '../contexts/ThemeContext';
import {AgentResponse, aiApi} from '../services/api';
import {borderRadius, MIN_TOUCH_TARGET, shadow, spacing} from '../theme/spacing';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actions?: string[];
  notesAffected?: number;
  isLoading?: boolean;
}

interface AgentScreenProps {
  onBack: () => void;
}

export default function AgentScreen({onBack}: AgentScreenProps) {
  const {colors} = useTheme();
  const {typography} = useAccessibility();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm your AI note assistant. I can help you create, search, update, and manage your notes. What would you like to do?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const styles = buildStyles(colors, typography);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) { return; }
    setInput('');

    const userMsg: Message = {id: `u-${Date.now()}`, role: 'user', text};
    const loadingMsg: Message = {id: `l-${Date.now()}`, role: 'assistant', text: '', isLoading: true};

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 100);

    try {
      const response: AgentResponse = await aiApi.chat(text);
      setMessages(prev => {
        const without = prev.filter(m => !m.isLoading);
        return [
          ...without,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            text: response.message,
            actions: response.actions,
            notesAffected: response.notesAffected,
          },
        ];
      });
    } catch {
      setMessages(prev => {
        const without = prev.filter(m => !m.isLoading);
        return [
          ...without,
          {
            id: `e-${Date.now()}`,
            role: 'assistant',
            text: 'Sorry, something went wrong. Please check that the backend is running and try again.',
          },
        ];
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 100);
    }
  };

  const renderMessage = ({item}: {item: Message}) => {
    const isUser = item.role === 'user';

    if (item.isLoading) {
      return (
        <View style={[styles.bubble, styles.bubbleAssistant]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    return (
      <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.text}
          </Text>
          {!isUser && item.actions && item.actions.length > 0 && (
            <View style={styles.actionsList}>
              {item.actions.map((action, i) => (
                <Text key={i} style={styles.actionItem}>• {action}</Text>
              ))}
            </View>
          )}
          {!isUser && (item.notesAffected ?? 0) > 0 && (
            <Text style={styles.notesAffected}>
              {item.notesAffected} note{item.notesAffected !== 1 ? 's' : ''} affected
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSubtitle}>Claude · Day 5</Text>
        </View>
        <View style={{width: 80}} />
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({animated: false})}
      />

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask Claude to manage your notes…"
          placeholderTextColor={colors.textDisabled}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          accessibilityLabel="Message input"
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || isLoading}
          accessibilityRole="button"
          accessibilityLabel="Send message">
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
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
    header: {
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
    backBtn: {
      minWidth: 80,
      minHeight: MIN_TOUCH_TARGET,
      justifyContent: 'center',
    },
    backBtnText: {
      fontSize: typography.md,
      color: colors.primary,
      fontWeight: '500',
    },
    headerCenter: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: typography.md,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    headerSubtitle: {
      fontSize: typography.xs,
      color: colors.textSecondary,
      marginTop: 1,
    },
    messageList: {
      padding: spacing.md,
      paddingBottom: spacing.lg,
    },
    bubbleRow: {
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    bubbleRowUser: {
      justifyContent: 'flex-end',
    },
    bubble: {
      maxWidth: '80%',
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadow.sm,
    },
    bubbleUser: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: borderRadius.xs,
    },
    bubbleAssistant: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomLeftRadius: borderRadius.xs,
    },
    bubbleText: {
      fontSize: typography.md,
      color: colors.textPrimary,
      lineHeight: typography.md * 1.5,
    },
    bubbleTextUser: {
      color: colors.textOnPrimary,
    },
    actionsList: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionItem: {
      fontSize: typography.xs,
      color: colors.textSecondary,
      lineHeight: typography.xs * 1.8,
    },
    notesAffected: {
      fontSize: typography.xs,
      color: colors.primary,
      fontWeight: '600',
      marginTop: spacing.xs,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: typography.md,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      maxHeight: 120,
      backgroundColor: colors.background,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: {
      backgroundColor: colors.border,
    },
    sendBtnText: {
      fontSize: 20,
      color: colors.textOnPrimary,
      fontWeight: '700',
    },
  });
}
