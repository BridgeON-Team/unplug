import { theme } from "@/src/styles/theme";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

const PersonIcon = require("@/assets/images/common/person_icon.svg").default;
const HeartIcon = require("@/assets/images/common/heart_icon.svg").default;
const ChatIcon = require("@/assets/images/common/chat_icon.svg").default;

interface Meeting {
    id: string;
    title: string;
    description: string;
    participants: number;
    likes: number;
    comments: number;
    avatar?: string;
}

const mockMeetingData: Meeting[] = [
    {
        id: "1",
        title: "모임 이름",
        description: "모임 설명글 모임 설명글 모임 설명글 모임 설명글 모임 설명글 모임 설명글 모임 설명글 모임 설명글...",
        participants: 10,
        likes: 10,
        comments: 10,
        avatar: undefined
    }
];

interface AvailableMeetingsSectionProps {
    meetings?: Meeting[];
    isEmpty?: boolean;
}

export default function AvailableMeetingsSection({
    meetings = mockMeetingData,
    isEmpty = false
}: AvailableMeetingsSectionProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>참여 가능한 모임</Text>
                    <IconSymbol name="chevron.right" size={16} color={theme.colors.gray[500]} />
                </View>
            </View>

            <View style={styles.sortTabs}>
                <TouchableOpacity style={[styles.sortTab, styles.activeTab]}>
                    <Text style={[styles.sortTabText, styles.activeTabText]}>최신순</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortTab}>
                    <Text style={styles.sortTabText}>인기순</Text>
                </TouchableOpacity>
            </View>

            {isEmpty ? (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>모임 컴포넌트의 등업</Text>
                </View>
            ) : (
                <View style={styles.meetingsContainer}>
                    {meetings.map((meeting) => (
                        <TouchableOpacity key={meeting.id} style={styles.meetingItem}>
                            <View style={styles.meetingHeader}>
                                <View style={styles.avatarContainer}>
                                    {meeting.avatar ? (
                                        <Image source={{ uri: meeting.avatar }} style={styles.avatar} />
                                    ) : (
                                        <View style={styles.defaultAvatar}>
                                            <Text style={styles.avatarText}>🐶</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.meetingInfo}>
                                    <Text style={styles.meetingTitle}>{meeting.title}</Text>
                                    <Text style={styles.meetingDescription} numberOfLines={2}>
                                        {meeting.description}
                                    </Text>
                                </View>
                                <View style={styles.participantBadge}>
                                    <PersonIcon width={16} height={16} fill={theme.colors.gray[500]} />
                                    <Text style={styles.participantCount}>{meeting.participants}</Text>
                                </View>
                            </View>

                            <View style={styles.meetingFooter}>
                                <View style={styles.actionButtons}>
                                    <View style={styles.actionItem}>
                                        <PersonIcon width={16} height={16} fill={theme.colors.gray[500]} />
                                        <Text style={styles.actionCount}>{meeting.participants}</Text>
                                    </View>
                                    <View style={styles.actionItem}>
                                        <HeartIcon width={16} height={16} fill={theme.colors.gray[500]} />
                                        <Text style={styles.actionCount}>{meeting.likes}</Text>
                                    </View>
                                    <View style={styles.actionItem}>
                                        <ChatIcon width={16} height={16} fill={theme.colors.gray[500]} />
                                        <Text style={styles.actionCount}>{meeting.comments}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
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
    sortTabs: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    sortTab: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: 'transparent',
    },
    activeTab: {
        backgroundColor: theme.colors.gray[100],
    },
    sortTabText: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.gray[500],
    },
    activeTabText: {
        color: theme.colors.text,
        fontWeight: "600",
    },
    emptyStateContainer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    emptyStateText: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.gray[500],
        textAlign: 'center',
    },
    meetingsContainer: {
        gap: theme.spacing.md,
    },
    meetingItem: {
        backgroundColor: theme.colors.gray[100],
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.md,
    },
    meetingHeader: {
        flexDirection: 'row',
        marginBottom: theme.spacing.sm,
    },
    avatarContainer: {
        marginRight: theme.spacing.sm,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    defaultAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.gray[300],
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 20,
    },
    meetingInfo: {
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    meetingTitle: {
        fontSize: theme.typography.body.fontSize,
        fontWeight: "600",
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    meetingDescription: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.gray[500],
        lineHeight: 16,
    },
    participantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    participantCount: {
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text,
        fontWeight: "600",
    },
    meetingFooter: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray[300],
        paddingTop: theme.spacing.sm,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    actionCount: {
        fontSize: theme.typography.caption.fontSize,
        color: theme.colors.text,
        fontWeight: "600",
    },
});