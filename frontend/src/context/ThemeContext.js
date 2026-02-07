import React, { createContext, useContext, useState, useMemo } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: '"Roboto", sans-serif, Arial',
        },
        palette: {
          mode,
          primary: {
            light: mode === "light" ? "#5E9EFB" : "#5E9EFB",
            main: mode === "light" ? "#1976D2" : "#3D8BF8",
            dark: mode === "light" ? "#0D47A1" : "#0D47A1",
            contrastText: "#fff",
          },
          secondary: {
            light: mode === "light" ? "#FF8A65" : "#FF8A65",
            main: mode === "light" ? "#FF5722" : "#FF7043",
            dark: mode === "light" ? "#E64A19" : "#E64A19",
            contrastText: "#fff",
          },
          success: {
            main: "#4CAF50",
          },
          error: {
            main: "#F44336",
          },
          warning: {
            main: "#FF9800",
          },
          info: {
            main: "#2196F3",
          },
          ...(mode === "light"
            ? {
                background: {
                  default: "#F5F7FA",
                  paper: "#FFFFFF",
                },
                text: {
                  primary: "#1C2536",
                  secondary: "#5F6B7C",
                },
              }
            : {
                background: {
                  default: "#121212",
                  paper: "#1E1E1E",
                },
                text: {
                  primary: "#E6E8ED",
                  secondary: "#9DA4AE",
                },
              }),
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: "none",
                padding: "8px 24px",
                boxShadow: "none",
                fontWeight: 500,
              },
              containedPrimary: {
                "&:hover": {
                  boxShadow: "0px 2px 4px rgba(33, 150, 243, 0.3)",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiInputBase-root": {
                  borderRadius: 8,
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
