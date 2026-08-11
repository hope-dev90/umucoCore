import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { sendMessage, type ChatTurn } from '../services/geminiChat';
import { colors } from '../theme/colors';

const CHAT_STRINGS = {
  en: {
    greeting: 'Hello! How can I help you today with Rwandan culture and heritage?',
    placeholder: 'Type here...',
    closeLabel: 'Close chat',
    openLabel: 'Open chat with Umuco',
    sendLabel: 'Send message',
    typingLabel: 'Typing...',
    errorMsg:
      "Sorry, we couldn't get a response right now. / Ihangane, ntibishoboka kubona igisubizo ubu.",
  },
  rw: {
    greeting: "Muraho! Ndagufasha gute uyu munsi ku byerekeye umuco w'u Rwanda?",
    placeholder: 'Andika hano...',
    closeLabel: 'Funga ikiganiro',
    openLabel: 'Fungura chat na Umuco',
    sendLabel: 'Ohereza ubutumwa',
    typingLabel: 'Birategerejwe...',
    errorMsg:
      "Ihangane, ntibishoboka kubona igisubizo ubu. / Sorry, we couldn't get a response right now.",
  },
  fr: {
    greeting:
      "Bonjour ! Comment puis-je vous aider aujourd'hui avec la culture et le patrimoine rwandais ?",
    placeholder: 'Écrivez ici...',
    closeLabel: 'Fermer le chat',
    openLabel: 'Ouvrir le chat Umuco',
    sendLabel: 'Envoyer',
    typingLabel: 'Écriture...',
    errorMsg:
      "Désolé, impossible d'obtenir une réponse pour le moment. / Sorry, we couldn't get a response right now.",
  },
} as const;

/** Floating heritage chat — RN equivalent of frontend ChatWidget.jsx */
export default function ChatWidget() {
  const { language } = useLanguage();
  const strings = CHAT_STRINGS[language] || CHAT_STRINGS.en;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<ChatTurn>>(null);

  const initialMessages = useMemo<ChatTurn[]>(
    () => [{ role: 'model', parts: strings.greeting }],
    [strings.greeting]
  );
  const [messages, setMessages] = useState<ChatTurn[]>(initialMessages);

  useEffect(() => {
    setMessages([{ role: 'model', parts: strings.greeting }]);
  }, [strings.greeting]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: ChatTurn = { role: 'user', parts: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.filter((m, i) => !(m.role === 'model' && i === 0));
      const reply = await sendMessage(history, text, language);
      setMessages((prev) => [...prev, { role: 'model', parts: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: strings.errorMsg, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pressable
        accessibilityLabel={strings.openLabel}
        onPress={() => setOpen(true)}
        style={styles.fab}
      >
        <Ionicons name="chatbubbles" size={24} color={colors.white} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Umuco</Text>
              <Pressable accessibilityLabel={strings.closeLabel} onPress={() => setOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.messages}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.bubble,
                    item.role === 'user' ? styles.userBubble : styles.modelBubble,
                    item.isError && styles.errorBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      item.role === 'user' && styles.userBubbleText,
                    ]}
                  >
                    {item.parts}
                  </Text>
                </View>
              )}
              ListFooterComponent={
                loading ? (
                  <View style={styles.typing}>
                    <ActivityIndicator color={colors.primary} />
                    <Text style={styles.typingText}>{strings.typingLabel}</Text>
                  </View>
                ) : null
              }
            />

            <View style={styles.composer}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder={strings.placeholder}
                placeholderTextColor={colors.textMuted}
                editable={!loading}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable
                accessibilityLabel={strings.sendLabel}
                onPress={handleSend}
                style={styles.sendBtn}
                disabled={loading}
              >
                <Ionicons name="send" size={18} color={colors.white} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 88,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 50,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(44,26,20,0.35)',
  },
  sheet: {
    height: '78%',
    backgroundColor: colors.bgMain,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.primaryDark },
  messages: { padding: 16, gap: 10 },
  bubble: {
    maxWidth: '85%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  modelBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorBubble: { borderColor: colors.danger },
  bubbleText: { color: colors.textPrimary, lineHeight: 20, fontSize: 14 },
  userBubbleText: { color: colors.white },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  typingText: { color: colors.textMuted, fontSize: 12 },
  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    backgroundColor: colors.bgMain,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
