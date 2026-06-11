import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddTaskModal } from "@/components/AddTaskModal";
import { TaskItem } from "@/components/TaskItem";
import { Task, TaskCategory, useTasks } from "@/context/TasksContext";
import { useColors } from "@/hooks/useColors";

const FILTERS: { id: TaskCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "personal", label: "Personal" },
  { id: "health", label: "Health" },
  { id: "work", label: "Work" },
  { id: "creative", label: "Creative" },
];

const FILTER_COLORS: Record<string, string> = {
  all: "#B4A0D4",
  personal: "#B4A0D4",
  health: "#B8E0D2",
  work: "#B8D4E8",
  creative: "#F9D5C5",
};

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, addTask, toggleTask, deleteTask, completedCount } = useTasks();
  const [filter, setFilter] = useState<TaskCategory | "all">("all");
  const [showModal, setShowModal] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = (Platform.OS === "web" ? 34 : insets.bottom) + 100;

  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.category === filter);
  const totalCount = tasks.length;

  const handleFab = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowModal(true);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <TaskItem
      key={item.id}
      id={item.id}
      title={item.title}
      completed={item.completed}
      category={item.category}
      onToggle={toggleTask}
      onDelete={deleteTask}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 16, borderBottomColor: colors.border },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            My Tasks
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {completedCount} of {totalCount} completed
          </Text>
        </View>
      </View>

      <View style={[styles.filterContainer, { borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => {
            const isActive = filter === f.id;
            const accentColor = FILTER_COLORS[f.id];
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? accentColor
                      : accentColor + "22",
                    borderColor: isActive ? accentColor : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    { color: isActive ? "#fff" : accentColor },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="check-circle" size={40} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
              {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Add something you'd like to accomplish
            </Text>
          </View>
        }
      />

      <Pressable
        onPress={handleFab}
        style={[
          styles.fab,
          { backgroundColor: colors.primary, bottom: bottomPadding - 72 },
        ]}
      >
        <Feather name="plus" size={26} color="#fff" />
      </Pressable>

      <AddTaskModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  filterContainer: {
    borderBottomWidth: 1,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B4A0D4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
});
