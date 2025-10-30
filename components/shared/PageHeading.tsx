import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/src/styles/theme";
import { moderateScale } from "@/src/styles/responsive";

interface PageHeadingProps {
  title: string;
  subtitle?: string;
}

export default function PageHeading({ title, subtitle }: PageHeadingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: moderateScale(theme.spacing.md),
    marginBottom: moderateScale(theme.spacing.sm),
  },
  title: {
    fontSize: moderateScale(theme.typography.h1.fontSize),
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: moderateScale(theme.spacing.xs),
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.gray[500],
  },
});
