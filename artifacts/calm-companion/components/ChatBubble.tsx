import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const colors = useColors();
  const isUser = message.role === "user";

  const timeStr = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View
          style={[styles.avatar, { backgroundColor: colors.primary + "33" }]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>L</Text>
        </View>
      )}
      <View style={styles.bubbleCol}>
        <View
          style={[
            styles.bubble,
            isUser
              ? {
                  backgroundColor: colors.primary,
                  borderBottomRightRadius: 4,
                }
              : {
                  backgroundColor: colors.card,
                  borderBottomLeftRadius: 4,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
          ]}
        >
          <Text
            style={[
              styles.text,
              { color: isUser ? "#fff" : colors.foreground },
            ]}
          >
            {message.content}
          </Text>
        </View>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {timeStr}
        </Text>
      </View>
    </View>
  );
}

export function TypingIndicator() {
  const colors = useColors();

  return (
    <View style={[styles.row, styles.rowAssistant]}>
      <View
        style={[styles.avatar, { backgroundColor: colors.primary + "33" }]}
      >
        <Text style={[styles.avatarText, { color: colors.primary }]}>L</Text>
      </View>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderBottomLeftRadius: 4,
          },
        ]}
      >
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
          <View style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
          <View style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
    paddingHorizontal: 16,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowAssistant: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  bubbleCol: {
    maxWidth: "75%",
    gap: 4,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    alignSelf: "flex-end",
    paddingHorizontal: 4,
  },
  dots: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    opacity: 0.5,
  },
});
