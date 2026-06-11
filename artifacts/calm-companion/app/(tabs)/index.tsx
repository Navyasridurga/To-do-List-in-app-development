import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTasks } from "@/context/TasksContext";
import { useColors } from "@/hooks/useColors";

const MOODS = [
  { label: "Radiant", color: "#F4B8C1" },
  { label: "Good", color: "#B8E0D2" },
  { label: "Calm", color: "#B4A0D4" },
  { label: "Tired", color: "#B8D4E8" },
  { label: "Low", color: "#F9D5C5" },
];

const AFFIRMATIONS = [
  "You are doing better than you think.",
  "Every small step forward matters.",
  "You deserve rest as much as progress.",
  "Your goals are worth pursuing, one day at a time.",
  "Be gentle with yourself today.",
  "You are enough, exactly as you are.",
  "Growth happens in moments of quiet intention.",
  "Today is a new chance to bloom.",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayAffirmation(): string {
  const day = new Date().getDay();
  return AFFIRMATIONS[day % AFFIRMATIONS.length];
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tasks, completedCount, toggleTask } = useTasks();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const previewTasks = tasks.slice(0, 3);
  const totalCount = tasks.length;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPadding + 16,
          paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#F0E8FF", "#FAF7FF", "#FAF7FF"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
      />

      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.foreground }]}>
            {getGreeting()} ✦
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {formatDate()}
          </Text>
        </View>
      </View>

      <LinearGradient
        colors={["#C9B8E8", "#B4A0D4"]}
        style={[styles.affirmationCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.affirmationQuote}>"</Text>
        <Text style={styles.affirmationText}>{getTodayAffirmation()}</Text>
        <Text style={styles.affirmationLabel}>Daily Affirmation</Text>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          How are you feeling?
        </Text>
        <View style={styles.moodRow}>
          {MOODS.map((mood, i) => {
            const isSelected = selectedMood === i;
            return (
              <Pressable
                key={i}
                onPress={() => setSelectedMood(i)}
                style={styles.moodItem}
              >
                <View
                  style={[
                    styles.moodCircle,
                    {
                      backgroundColor: mood.color,
                      borderWidth: isSelected ? 2.5 : 0,
                      borderColor: isSelected ? mood.color + "88" : "transparent",
                      transform: [{ scale: isSelected ? 1.12 : 1 }],
                      shadowColor: isSelected ? mood.color : "transparent",
                      shadowOpacity: isSelected ? 0.4 : 0,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: isSelected ? 4 : 0,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.moodLabel,
                    {
                      color: isSelected ? mood.color : colors.mutedForeground,
                      fontFamily: isSelected
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                    },
                  ]}
                >
                  {mood.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Today's Focus
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/tasks")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See all
            </Text>
          </Pressable>
        </View>

        {totalCount > 0 && (
          <View style={styles.progressRow}>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colors.muted },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width:
                      totalCount > 0
                        ? `${(completedCount / totalCount) * 100}%`
                        : "0%",
                  },
                ]}
              />
            </View>
            <Text
              style={[styles.progressLabel, { color: colors.mutedForeground }]}
            >
              {completedCount}/{totalCount}
            </Text>
          </View>
        )}

        {previewTasks.length === 0 ? (
          <View
            style={[styles.emptyTasks, { backgroundColor: colors.card }]}
          >
            <Feather name="check-circle" size={24} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No tasks yet. Add something to focus on.
            </Text>
          </View>
        ) : (
          previewTasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => toggleTask(task.id)}
              style={[
                styles.miniTask,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: task.completed ? 0.6 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.miniCheck,
                  {
                    backgroundColor: task.completed
                      ? colors.primary
                      : "transparent",
                    borderColor: task.completed ? colors.primary : colors.border,
                  },
                ]}
              >
                {task.completed && (
                  <Feather name="check" size={11} color="#fff" />
                )}
              </View>
              <Text
                style={[
                  styles.miniTitle,
                  {
                    color: colors.foreground,
                    textDecorationLine: task.completed ? "line-through" : "none",
                  },
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
            </Pressable>
          ))
        )}

        <Pressable
          onPress={() => router.push("/(tabs)/tasks")}
          style={[styles.addTaskBtn, { borderColor: colors.border }]}
        >
          <Feather name="plus" size={16} color={colors.primary} />
          <Text style={[styles.addTaskText, { color: colors.primary }]}>
            Add a task
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push("/(tabs)/chat")}
        style={styles.chatPrompt}
      >
        <LinearGradient
          colors={["#FCE8E6", "#F9D5C5"]}
          style={styles.chatPromptInner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View>
            <Text style={[styles.chatPromptTitle, { color: "#3D3448" }]}>
              Need to talk it through?
            </Text>
            <Text style={[styles.chatPromptSub, { color: "#9B8EA8" }]}>
              Your calm companion is here
            </Text>
          </View>
          <View
            style={[
              styles.chatIcon,
              { backgroundColor: "rgba(180,160,212,0.25)" },
            ]}
          >
            <Feather name="message-circle" size={22} color="#B4A0D4" />
          </View>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  affirmationCard: {
    borderRadius: 20,
    padding: 24,
    gap: 6,
  },
  affirmationQuote: {
    fontSize: 36,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
    marginBottom: -4,
  },
  affirmationText: {
    fontSize: 17,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    lineHeight: 26,
  },
  affirmationLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    gap: 12,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodItem: {
    alignItems: "center",
    gap: 6,
  },
  moodCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  moodLabel: {
    fontSize: 11,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    width: 36,
    textAlign: "right",
  },
  emptyTasks: {
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  miniTask: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  miniCheck: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  miniTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  addTaskBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingVertical: 12,
  },
  addTaskText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  chatPrompt: {
    borderRadius: 20,
    overflow: "hidden",
  },
  chatPromptInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  chatPromptTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  chatPromptSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  chatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
