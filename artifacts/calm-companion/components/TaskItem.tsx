import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { TaskCategory } from "@/context/TasksContext";
import { useColors } from "@/hooks/useColors";

interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  category: TaskCategory;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  personal: "#B4A0D4",
  work: "#B8D4E8",
  health: "#B8E0D2",
  creative: "#F9D5C5",
};

export function TaskItem({
  id,
  title,
  completed,
  category,
  onToggle,
  onDelete,
}: TaskItemProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(completed ? 0.6 : 1);
  const checkScale = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(completed ? 0.6 : 1, { duration: 200 });
    checkScale.value = withSpring(completed ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
  }, [completed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleToggle = () => {
    scale.value = withSpring(0.96, { damping: 12 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle(id);
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <View
        style={[
          styles.container,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Pressable onPress={handleToggle} style={styles.checkArea}>
          <View
            style={[
              styles.checkbox,
              {
                borderColor: completed
                  ? CATEGORY_COLORS[category]
                  : colors.border,
                backgroundColor: completed
                  ? CATEGORY_COLORS[category]
                  : "transparent",
              },
            ]}
          >
            <Animated.View style={checkAnimStyle}>
              <Feather name="check" size={13} color="#fff" />
            </Animated.View>
          </View>
        </Pressable>

        <Pressable onPress={handleToggle} style={styles.titleArea}>
          <Text
            style={[
              styles.title,
              {
                color: colors.foreground,
                textDecorationLine: completed ? "line-through" : "none",
              },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: CATEGORY_COLORS[category] + "33" },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: CATEGORY_COLORS[category] },
              ]}
            >
              {category}
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={() => onDelete(id)} style={styles.deleteBtn}>
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  checkArea: {
    padding: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  titleArea: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "capitalize",
  },
  deleteBtn: {
    padding: 4,
  },
});
