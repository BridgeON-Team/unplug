export const theme = {
  colors: {
    primary: "#335FEE",
    error: "#C32323",
    gray: {
      100: "#F5F5F5",
      300: "#D9D9D9",
      500: "#9E9E9E",
      700: "#616161",
      900: "#212121",
    },
    background: "#FFFFFF",
    text: "#212121",
    white: "#FFFFFF",
    black: "#212121",
    secondary: "#34C759",
    success: "#4CD964",
    dark: {
      background: "#212121",
      text: "#F5F5F5",
      icon: "#9E9E9E",
    },
    light: {
      background: "#FFFFFF",
      text: "#212121",
      icon: "#616161",
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: "bold",
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: "bold",
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: "bold",
      lineHeight: 32,
    },
    body: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 22,
    },
    caption: {
      fontSize: 12,
      fontWeight: "300",
      lineHeight: 18,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 5,
    md: 10,
    lg: 15,
  },
} as const;

export type Theme = typeof theme;
