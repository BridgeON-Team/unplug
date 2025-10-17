import { IconSymbol } from "@/components/ui/IconSymbol";
import { theme } from "@/src/styles/theme";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Challenge {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

interface ChallengeListProps {
  challenges: Challenge[];
  onChallengesChange: (challenges: Challenge[]) => void;
}

export default function ChallengeList({
  challenges,
  onChallengesChange,
}: ChallengeListProps) {
  const [newChallenge, setNewChallenge] = useState("");
  const [isAddingChallenge, setIsAddingChallenge] = useState(false);

  const toggleChallenge = (id: string) => {
    const updatedChallenges = challenges.map((challenge) =>
      challenge.id === id
        ? { ...challenge, completed: !challenge.completed }
        : challenge
    );
    onChallengesChange(updatedChallenges);
  };

  const addChallenge = () => {
    if (newChallenge.trim()) {
      const challenge: Challenge = {
        id: Date.now().toString(),
        title: newChallenge.trim(),
        completed: false,
        createdAt: new Date(),
      };
      onChallengesChange([challenge, ...challenges]);
      setNewChallenge("");
      setIsAddingChallenge(false);
    }
  };

  const deleteChallenge = (id: string) => {
    Alert.alert("챌린지 삭제", "이 챌린지를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          onChallengesChange(
            challenges.filter((challenge) => challenge.id !== id)
          );
        },
      },
    ]);
  };

  const completedCount = challenges.filter((c) => c.completed).length;
  const totalCount = challenges.length;
  const completionRate =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 진행률 섹션 */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>오늘의 진행률</Text>
          <Text style={styles.progressPercentage}>{completionRate}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${completionRate}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {completedCount}개 완료 / {totalCount}개 전체
        </Text>
      </View>

      {/* 챌린지 추가 버튼 */}
      {!isAddingChallenge && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingChallenge(true)}
        >
          <IconSymbol name="plus" size={20} color={theme.colors.primary} />
          <Text style={styles.addButtonText}>새 챌린지 추가</Text>
        </TouchableOpacity>
      )}

      {/* 챌린지 입력 폼 */}
      {isAddingChallenge && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="새로운 챌린지를 입력하세요"
            value={newChallenge}
            onChangeText={setNewChallenge}
            autoFocus
            multiline
          />
          <View style={styles.addFormButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsAddingChallenge(false);
                setNewChallenge("");
              }}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={addChallenge}>
              <Text style={styles.saveButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 챌린지 목록 */}
      <View style={styles.challengesList}>
        {challenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeItem}>
            <TouchableOpacity
              style={styles.challengeContent}
              onPress={() => toggleChallenge(challenge.id)}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    challenge.completed && styles.checkboxCompleted,
                  ]}
                >
                  {challenge.completed && (
                    <IconSymbol
                      name="checkmark"
                      size={16}
                      color={theme.colors.white}
                    />
                  )}
                </View>
              </View>
              <Text
                style={[
                  styles.challengeTitle,
                  challenge.completed && styles.challengeTitleCompleted,
                ]}
              >
                {challenge.title}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteChallenge(challenge.id)}
            >
              <IconSymbol
                name="trash"
                size={16}
                color={theme.colors.gray[500]}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {challenges.length === 0 && (
        <View style={styles.emptyState}>
          <IconSymbol
            name="list.bullet"
            size={48}
            color={theme.colors.gray[300]}
          />
          <Text style={styles.emptyStateText}>아직 챌린지가 없습니다</Text>
          <Text style={styles.emptyStateSubtext}>
            새로운 챌린지를 추가해보세요!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  progressSection: {
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  progressTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.text,
  },
  progressPercentage: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 4,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
    gap: theme.spacing.sm,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  addForm: {
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    minHeight: 50,
    textAlignVertical: "top",
  },
  addFormButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.gray[100],
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.gray[700],
  },
  saveButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.white,
  },
  challengesList: {
    paddingBottom: theme.spacing.lg,
  },
  challengeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  challengeContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxContainer: {
    marginRight: theme.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  challengeTitle: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    lineHeight: 22,
  },
  challengeTitleCompleted: {
    textDecorationLine: "line-through",
    color: theme.colors.gray[500],
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    color: theme.colors.gray[500],
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.gray[500],
  },
});
