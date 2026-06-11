import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TaskCategory } from "@/context/TasksContext";
import { useColors } from "@/hooks/useColors";

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, category: TaskCategory) => void;
}

const CATEGORIES: { id: TaskCategory; label: string; color: string }[] = [
  { id: "personal", label: "Personal", color: "#B4A0D4" },
  { id: "health", label: "Health", color: "#B8E0D2" },
  { id: "work", label: "Work", color: "#B8D4E8" },
  { id: "creative", label: "Creative", color: "#F9D5C5" },
];

export function AddTaskModal({ visible, onClose, onAdd }: AddTaskModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("personal");
  const inputRef = useRef<TextInput>(null);

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), category);
    setTitle("");
    setCategory("personal");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          <View style={styles.handle} />

          <Text style={[styles.heading, { color: colors.foreground }]}>
            New Task
          </Text>

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
            placeholder="What would you like to accomplish?"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            maxLength={80}
            multiline={false}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Category
          </Text>
          <View style={styles.categories}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: isSelected
                        ? cat.color
                        : cat.color + "22",
                      borderColor: isSelected ? cat.color : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catLabel,
                      { color: isSelected ? "#fff" : cat.color },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={handleAdd}
            style={[
              styles.addBtn,
              {
                backgroundColor: title.trim()
                  ? colors.primary
                  : colors.muted,
              },
            ]}
          >
            <Feather
              name="check"
              size={18}
              color={title.trim() ? "#fff" : colors.mutedForeground}
            />
            <Text
              style={[
                styles.addBtnText,
                {
                  color: title.trim() ? "#fff" : colors.mutedForeground,
                },
              ]}
            >
              Add Task
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 16,
    gap: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D0C8DC",
    alignSelf: "center",
    marginBottom: 8,
  },
  heading: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: -8,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  catLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
    marginTop: 4,
  },
  addBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
