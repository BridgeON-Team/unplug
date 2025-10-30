export const theme = {
  colors: {
    primary: "#335FEE",
    error: "#C32323",
    gray: {
      100: "#F5F5F5",
      200: "#E6E6E6",
      300: "#D9D9D9",
      500: "#9E9E9E",
      700: "#616161",
      900: "#212121",
    },
    background: "#FFFFFF",
    text: "#212121",
    textSecondary: "#9E9E9E",
    white: "#FFFFFF",
    black: "#212121",
    secondary: "#34C759",
    success: "#4CD964",
    surface: "#F8F9FA",
    border: "#E6E6E6",
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
      fontSize: 28,
      fontWeight: "bold",
      lineHeight: 34,
    },
    h2: {
      fontSize: 24,
      fontWeight: "bold",
      lineHeight: 30,
    },
    h3: {
      fontSize: 20,
      fontWeight: "bold",
      lineHeight: 26,
    },
    h4: {
      fontSize: 18,
      fontWeight: "600",
      lineHeight: 24,
    },
    body: {
      fontSize: 15,
      fontWeight: "400",
      lineHeight: 21,
    },
    caption: {
      fontSize: 12,
      fontWeight: "300",
      lineHeight: 16,
    },
    button: {
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 18,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
  },
  borderRadius: {
    sm: 5,
    md: 10,
    lg: 15,
  },
} as const;

export type Theme = typeof theme;
