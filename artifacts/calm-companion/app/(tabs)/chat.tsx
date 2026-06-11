import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { fetch } from "expo/fetch";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatBubble, Message, TypingIndicator } from "@/components/ChatBubble";
import { useColors } from "@/hooks/useColors";

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I'm Luna — your calm companion. I'm here to listen, encourage, and help you navigate your goals with gentleness. What's on your mind today?",
  timestamp: new Date(),
};

const SUGGESTIONS = [
  "I'm feeling overwhelmed",
  "Help me plan my week",
  "I need some motivation",
  "How do I build better habits?",
];

async function getOrCreateConversation(): Promise<number> {
  const listRes = await fetch(`${BASE_URL}/api/anthropic/conversations`);
  const list = (await listRes.json()) as { id: number }[];
  if (list.length > 0) return list[0].id;

  const createRes = await fetch(`${BASE_URL}/api/anthropic/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Luna Chat" }),
  });
  const conv = (await createRes.json()) as { id: number };
  return conv.id;
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const inputRef = useRef<TextInput>(null);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    getOrCreateConversation()
      .then(setConversationId)
      .catch(() => {});
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [userMsg, ...prev]);
      setInputText("");
      setShowSuggestions(false);
      setIsTyping(true);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const msgId = generateId();
      let fullContent = "";

      try {
        const convId =
          conversationId ?? (await getOrCreateConversation());
        if (!conversationId) setConversationId(convId);

        const response = await fetch(
          `${BASE_URL}/api/anthropic/conversations/${convId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: trimmed }),
          },
        );

        if (!response.body) throw new Error("No response body");

        const assistantMsg: Message = {
          id: msgId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        };
        setMessages((prev) => [assistantMsg, ...prev]);
        setIsTyping(false);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                const captured = fullContent;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === msgId ? { ...m, content: captured } : m,
                  ),
                );
              }
            } catch {}
          }
        }
      } catch {
        setIsTyping(false);
        const errorMsg: Message = {
          id: msgId,
          role: "assistant",
          content:
            "I'm having a quiet moment — please try again in a second.",
          timestamp: new Date(),
        };
        setMessages((prev) => [errorMsg, ...prev]);
      }

      inputRef.current?.focus();
    },
    [isTyping, conversationId],
  );

  const handleSuggestion = (suggestion: string) => sendMessage(suggestion);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <LinearGradient
        colors={["#F5EEFF", colors.background]}
        style={[styles.headerGradient, { paddingTop: topPadding + 12 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View
          style={[
            styles.avatarLarge,
            { backgroundColor: colors.primary + "33" },
          ]}
        >
          <Text style={[styles.avatarLargeText, { color: colors.primary }]}>
            L
          </Text>
        </View>
        <View>
          <Text style={[styles.chatName, { color: colors.foreground }]}>
            Luna
          </Text>
          <Text style={[styles.chatStatus, { color: colors.mutedForeground }]}>
            Your calm companion
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={isTyping ? [{ id: "__typing__" } as any, ...messages] : messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.id === "__typing__") {
            return (
              <View style={{ marginTop: 8 }}>
                <TypingIndicator />
              </View>
            );
          }
          return <ChatBubble message={item} />;
        }}
        inverted
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 16, paddingTop: 8 },
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          showSuggestions ? (
            <View style={styles.suggestionsContainer}>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => handleSuggestion(s)}
                  style={[
                    styles.suggestionChip,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      { color: colors.foreground },
                    ]}
                  >
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null
        }
      />

      <View
        style={[
          styles.inputArea,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPadding + 100,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
          placeholder="Share what's on your mind..."
          placeholderTextColor={colors.mutedForeground}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          returnKeyType="default"
        />
        <Pressable
          onPress={() => sendMessage(inputText)}
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                inputText.trim() && !isTyping ? colors.primary : colors.muted,
            },
          ]}
        >
          <Feather
            name="send"
            size={18}
            color={
              inputText.trim() && !isTyping ? "#fff" : colors.mutedForeground
            }
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  avatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLargeText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  chatName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  chatStatus: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  suggestionChip: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
