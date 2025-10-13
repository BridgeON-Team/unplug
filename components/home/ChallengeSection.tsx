import { IconSymbol } from "@/components/ui/IconSymbol";
import { theme } from "@/src/styles/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PersonIcon = require("@/assets/images/common/person_icon.svg").default;

interface Challenge {
    id: string;
    title: string;
    participants: number;
}

interface ChallengeSectionProps {
    challenges?: Challenge[];
}

export default function ChallengeSection({
    challenges = [
        { id: "1", title: "스마트폰 2시간동안 그만 보기", participants: 10 }
    ]
}: ChallengeSectionProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>도전 가능한 챌린지</Text>
                    <IconSymbol name="chevron.right" size={16} color={theme.colors.gray[500]} />
                </View>
            </View>

            <View style={styles.challengesContainer}>
                {challenges.map((challenge) => (
                    <TouchableOpacity key={challenge.id} style={styles.challengeItem}>
                        <View style={styles.challengeContent}>
                            <Text style={styles.challengeTitle}>{challenge.title}</Text>
                            <View style={styles.participantInfo}>
                                <PersonIcon width={16} height={16} fill={theme.colors.gray[500]} />
                                <Text style={styles.participantCount}>{challenge.participants}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* 빈 챌린지 슬롯 */}
                <View style={styles.emptyChallengeSlot} />
                <View style={styles.emptyChallengeSlot} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.md,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        marginBottom: theme.spacing.md,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    title: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: "600",
        color: theme.colors.text,
    },
    challengesContainer: {
        gap: theme.spacing.sm,
    },
    challengeItem: {
        backgroundColor: theme.colors.gray[100],
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.md,
        minHeight: 60,
    },
    challengeContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    challengeTitle: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    participantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    participantCount: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
        fontWeight: "600",
    },
    emptyChallengeSlot: {
        backgroundColor: theme.colors.gray[100],
        borderRadius: theme.borderRadius.sm,
        height: 60,
        opacity: 0.5,
    },
});