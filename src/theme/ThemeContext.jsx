import React, { createContext, useContext, useState } from "react";
import { createTheme } from "@mui/material/styles";

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
};

const createAppTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#4caf50", // Material Blue
        light: "#4caf50",
        dark: "rgba(56, 142, 60, 0.8)",
        contrastText: "#ffffff",
        smallText: mode === "dark" ? "#b3b3b3" : "#757575", // Lighter text for small text
      },
      secondary: {
        main: "#dc004e", // UK Red
        light: "#ff5983",
        dark: "#9a0036",
        contrastText: "#ffffff",
      },
      background: {
        default: mode === "dark" ? "#121212" : "#ffffff",
        paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
        chip: mode === "dark" ? "#696969" : "#f5f5f5",
      },
      text: {
        primary: mode === "dark" ? "#ffffff" : "#212121",
        secondary: mode === "dark" ? "#b3b3b3" : "#757575",
      },
      info: {
        main: "#0277bd",
        light: "#58a5f0",
        dark: "#004c8c",
      },
      success: {
        main: "#388e3c",
        light: "#66bb6a",
        dark: "#2e7d32",
      },
      warning: {
        main: "#f57c00",
        light: "#ffb74d",
        dark: "#ef6c00",
      },
      error: {
        main: "#d32f2f",
        light: "#ef5350",
        dark: "#c62828",
      },
    },
    typography: {
      fontFamily: "Albert Sans",
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem",
        "@media (max-width:600px)": {
          fontSize: "2rem",
        },
      },
      h2: {
        fontWeight: 700,
        fontSize: "2rem",
        "@media (max-width:600px)": {
          fontSize: "1.75rem",
        },
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.75rem",
        "@media (max-width:600px)": {
          fontSize: "1.5rem",
        },
      },
      h4: {
        fontWeight: 600,
        fontSize: "1.5rem",
        "@media (max-width:600px)": {
          fontSize: "1.25rem",
        },
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.25rem",
        "@media (max-width:600px)": {
          fontSize: "1.1rem",
        },
      },
      h6: {
        fontWeight: 500,
        fontSize: "1rem",
        "@media (max-width:600px)": {
          fontSize: "0.9rem",
        },
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundColor: mode === "dark" ? "#1e1e1e" : "#ffffff",
            boxShadow:
              mode === "dark"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow:
                mode === "dark"
                  ? "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
                  : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundColor: mode === "dark" ? "#141414ff" : "#ffffff",
            boxShadow:
              mode === "dark"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow:
                mode === "dark"
                  ? "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
                  : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            backgroundColor: mode === "dark" ? "#1e1e1e" : "#ffffff",
            backgroundImage: "none",
            boxShadow:
              mode === "dark"
                ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
                : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            fontWeight: 500,
            // Default chip styling
            backgroundColor: mode === "dark" ? "rgb(65, 65, 65)" : "#e3e3e3",
            color: mode === "dark" ? "#b3b3b3" : "#757575",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            "&.MuiChip-outlined": {
              backgroundColor: mode === "dark" ? "rgb(65, 65, 65)" : "#e3e3e3",
              borderColor:
                mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "transparent",
            },
          },
          // Primary color variant
          colorPrimary: {
            backgroundColor:
              mode === "dark" ? "rgba(25, 118, 210, 0.3)" : "#e3f2fd",
            color: mode === "dark" ? "#90caf9" : "#1976d2",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            "&.MuiChip-outlined": {
              backgroundColor:
                mode === "dark" ? "rgba(25, 118, 210, 0.1)" : "transparent",
              borderColor: mode === "dark" ? "#90caf9" : "#1976d2",
              color: mode === "dark" ? "#90caf9" : "#1976d2",
            },
          },
          // Secondary color variant
          colorSecondary: {
            backgroundColor:
              mode === "dark" ? "rgba(220, 0, 78, 0.3)" : "#fce4ec",
            color: mode === "dark" ? "#f48fb1" : "#dc004e",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            "&.MuiChip-outlined": {
              backgroundColor:
                mode === "dark" ? "rgba(220, 0, 78, 0.1)" : "transparent",
              borderColor: mode === "dark" ? "#f48fb1" : "#dc004e",
              color: mode === "dark" ? "#f48fb1" : "#dc004e",
            },
          },
          // Success color variant
          colorSuccess: {
            backgroundColor:
              mode === "dark" ? "rgba(56, 142, 60, 0.3)" : "#e8f5e8",
            color: mode === "dark" ? "#81c784" : "#2e7d32",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            "&.MuiChip-outlined": {
              backgroundColor:
                mode === "dark" ? "rgba(56, 142, 60, 0.1)" : "transparent",
              borderColor: mode === "dark" ? "#81c784" : "#2e7d32",
              color: mode === "dark" ? "#81c784" : "#2e7d32",
            },
          },
          // Error color variant
          colorError: {
            backgroundColor:
              mode === "dark" ? "rgba(211, 47, 47, 0.3)" : "#ffebee",
            color: mode === "dark" ? "#e57373" : "#c62828",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            "&.MuiChip-outlined": {
              backgroundColor:
                mode === "dark" ? "rgba(211, 47, 47, 0.1)" : "transparent",
              borderColor: mode === "dark" ? "#e57373" : "#c62828",
              color: mode === "dark" ? "#e57373" : "#c62828",
            },
          },
          // Warning color variant
          colorWarning: {
            backgroundColor:
              mode === "dark" ? "rgba(245, 124, 0, 0.3)" : "#fff3e0",
            color: mode === "dark" ? "#ffb74d" : "#ef6c00",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            "&.MuiChip-outlined": {
              backgroundColor:
                mode === "dark" ? "rgba(245, 124, 0, 0.1)" : "transparent",
              borderColor: mode === "dark" ? "#ffb74d" : "#ef6c00",
              color: mode === "dark" ? "#ffb74d" : "#ef6c00",
            },
          },
          // Info color variant
          colorInfo: {
            backgroundColor:
              mode === "dark" ? "rgba(2, 119, 189, 0.3)" : "#e3f2fd",
            color: mode === "dark" ? "#64b5f6" : "#0277bd",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            "&.MuiChip-outlined": {
              backgroundColor:
                mode === "dark" ? "rgba(2, 119, 189, 0.1)" : "transparent",
              borderColor: mode === "dark" ? "#64b5f6" : "#0277bd",
              color: mode === "dark" ? "#64b5f6" : "#0277bd",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 500,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          contained: {
            backgroundColor:
              mode === "dark" ? "rgba(56, 142, 60, 0.8)" : "#4caf50",
            color: "#ffffff",
            boxShadow:
              mode === "dark"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              backgroundColor:
                mode === "dark" ? "rgba(56, 142, 60, 1)" : "#45a049",
              boxShadow:
                mode === "dark"
                  ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
                  : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            },
            "&:active": {
              backgroundColor:
                mode === "dark" ? "rgba(40, 100, 40, 1)" : "#3d8b40",
            },
          },
          outlined: {
            borderColor: mode === "dark" ? "#66bb6a" : "#4caf50",
            color: mode === "dark" ? "#66bb6a" : "#2e7d32",
            "&:hover": {
              backgroundColor:
                mode === "dark"
                  ? "rgba(56, 142, 60, 0.1)"
                  : "rgba(76, 175, 80, 0.08)",
              borderColor: mode === "dark" ? "#81c784" : "#45a049",
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === "dark" ? "#424242" : "#616161",
            color: mode === "dark" ? "#ffffff" : "#ffffff",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: "0.75rem",
            borderRadius: 8,
            padding: "8px 12px",
            maxWidth: 300,
            boxShadow:
              mode === "dark"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
          },
          arrow: {
            color: mode === "dark" ? "#424242" : "#616161",
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: 16,
            paddingRight: 16,
            "@media (max-width:600px)": {
              paddingLeft: 8,
              paddingRight: 8,
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          html: {
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          "#root": {
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        },
      },
      MuiBox: {
        styleOverrides: {
          root: {
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            transition:
              "color 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        },
      },
    },
  });

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = createAppTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default createAppTheme;
