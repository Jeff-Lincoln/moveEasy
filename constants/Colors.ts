// constants/Colors.ts

const tintColorLight = "#3D38ED"; // Your primary brand color
const tintColorDark = "#C9C8FA"; // Your muted primary for dark mode

export default {
  light: {
    // Brand Colors
    primary: "#3D38ED", // Your original primary
    primaryMuted: "#C9C8FA", // Your original primaryMuted
    secondary: "#4f46e5", // Complementary to your primary

    // Backgrounds
    background: "#F5F5F5", // Your original background
    secondaryBackground: "#f8fafc", // Slightly darker background for cards/sections

    // Text Colors
    text: "#141518", // Your original dark color
    secondaryText: "#626D77", // Your original gray

    // UI Elements
    border: "#D8DCE2", // Your original lightGray
    tint: tintColorLight,
    tabIconDefault: "#626D77", // Using your gray
    tabIconSelected: tintColorLight,

    // Status Colors
    success: "#16a34a", // Green-600
    error: "#dc2626", // Red-600
    warning: "#ea580c", // Orange-600
    info: "#0284c7", // Sky-600

    // Base Colors
    white: "#ffffff",
    black: "#141518", // Your original dark
  },
  dark: {
    // Brand Colors (adjusted for dark mode)
    primary: "#C9C8FA", // Using your primaryMuted for better dark mode contrast
    primaryMuted: "#3D38ED", // Reversed for dark mode
    secondary: "#818cf8", // Lighter secondary for dark mode

    // Backgrounds
    background: "#141518", // Your original dark color
    secondaryBackground: "#1e293b", // Slightly lighter dark background

    // Text Colors
    text: "#F5F5F5", // Your original background color
    secondaryText: "#D8DCE2", // Your original lightGray

    // UI Elements
    border: "#626D77", // Your original gray
    tint: tintColorDark,
    tabIconDefault: "#D8DCE2", // Using your lightGray
    tabIconSelected: tintColorDark,

    // Status Colors
    success: "#22c55e", // Lighter green for dark mode
    error: "#ef4444", // Lighter red for dark mode
    warning: "#f97316", // Lighter orange for dark mode
    info: "#0ea5e9", // Lighter blue for dark mode

    // Base Colors
    white: "#ffffff",
    black: "#141518", // Your original dark
  },

  // Shared/Static Colors
  transparent: "transparent",
  current: "currentColor",
  white: "#ffffff",
  black: "#141518", // Your original dark

  // Original Static Colors (for backward compatibility)
  primary: "#3D38ED",
  primaryMuted: "#C9C8FA",
  background: "#F5F5F5",
  dark: "#141518",
  gray: "#626D77",
  lightGray: "#D8DCE2",
};
