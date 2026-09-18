import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Read from localStorage on first load; default to 'dark' for first-time visitors
  const [mode, setMode] = useState(
    () => localStorage.getItem("themeMode") ?? "dark"
  );

  // Persist theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
          h1: {
            fontFamily: '"DM Sans", "Roboto", sans-serif',
            fontWeight: 700,
            letterSpacing: "-0.02em",
          },
          h2: {
            fontFamily: '"DM Sans", "Roboto", sans-serif',
            fontWeight: 700,
            letterSpacing: "-0.02em",
          },
          h3: {
            fontFamily: '"DM Sans", "Roboto", sans-serif',
            fontWeight: 700,
            letterSpacing: "-0.02em",
          },
          h4: {
            fontFamily: '"DM Sans", "Roboto", sans-serif',
            fontWeight: 700,
            letterSpacing: "-0.01em",
          },
          h5: {
            fontFamily: '"DM Sans", "Roboto", sans-serif',
            fontWeight: 600,
          },
          h6: {
            fontFamily: '"DM Sans", "Roboto", sans-serif',
            fontWeight: 600,
          },
          subtitle1: { fontWeight: 600 },
          button: { fontWeight: 600, letterSpacing: "0.02em" },
        },
        palette: {
          mode,
          primary: {
            light: mode === "light" ? "#5eead4" : "#5eead4",
            main: mode === "light" ? "#0d9488" : "#2dd4bf",
            dark: mode === "light" ? "#0f766e" : "#0f766e",
            contrastText: "#fff",
          },
          secondary: {
            light: mode === "light" ? "#3b5f8a" : "#64748b",
            main: mode === "light" ? "#1e3a5f" : "#94a3b8",
            dark: mode === "light" ? "#0f172a" : "#cbd5e1",
            contrastText: "#fff",
          },
          success: {
            main: mode === "light" ? "#059669" : "#34d399",
          },
          error: {
            main: mode === "light" ? "#dc2626" : "#f87171",
          },
          warning: {
            main: mode === "light" ? "#d97706" : "#fbbf24",
          },
          info: {
            main: mode === "light" ? "#0369a1" : "#38bdf8",
          },
          ...(mode === "light"
            ? {
                background: {
                  default: "#f0f4f8",
                  paper: "#ffffff",
                },
                text: {
                  primary: "#0f172a",
                  secondary: "#475569",
                },
              }
            : {
                background: {
                  default: "#0c0f14",
                  paper: "#151a22",
                },
                text: {
                  primary: "#e8edf4",
                  secondary: "#94a3b8",
                },
              }),
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
                WebkitBoxShadow:
                  mode === 'light'
                    ? '0 0 0 100px #ffffff inset !important'
                    : '0 0 0 100px #151a22 inset !important',
                WebkitTextFillColor:
                  mode === 'light' ? '#0f172a !important' : '#e8edf4 !important',
                caretColor: mode === 'light' ? '#0f172a' : '#e8edf4',
                transition: 'background-color 5000s ease-in-out 0s',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                textTransform: "none",
                padding: "10px 22px",
                boxShadow: "none",
                fontWeight: 600,
              },
              containedPrimary: {
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(13, 148, 136, 0.28)",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiInputBase-root": {
                  borderRadius: 10,
                },
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              outlined: {
                '&.MuiInputLabel-shrink, &:has(+ .MuiInputBase-root input:-webkit-autofill), &:has(+ .MuiInputBase-root input:autofill)': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                  backgroundColor: mode === 'light' ? '#ffffff' : '#151a22',
                  padding: '0 4px',
                  borderRadius: '4px',
                  zIndex: 2,
                },
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'light' ? '#0d9488' : '#2dd4bf',
                  borderWidth: '1.5px',
                },
                '&.Mui-focused': {
                  boxShadow:
                    mode === 'light'
                      ? '0 0 0 3px rgba(13, 148, 136, 0.16)'
                      : '0 0 0 3px rgba(45, 212, 191, 0.2)',
                },
                '&:has(input:-webkit-autofill) .MuiOutlinedInput-notchedOutline legend, &:has(input:autofill) .MuiOutlinedInput-notchedOutline legend': {
                  maxWidth: '100%',
                },
              },
              input: {
                '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
                  WebkitBoxShadow:
                    mode === 'light'
                      ? '0 0 0 100px #ffffff inset !important'
                      : '0 0 0 100px #151a22 inset !important',
                  WebkitTextFillColor:
                    mode === 'light' ? '#0f172a !important' : '#e8edf4 !important',
                  caretColor: mode === 'light' ? '#0f172a' : '#e8edf4',
                  borderRadius: 'inherit',
                  transition: 'background-color 5000s ease-in-out 0s',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 14,
                boxShadow:
                  mode === "light"
                    ? "0 4px 24px rgba(15, 23, 42, 0.06)"
                    : "0 4px 24px rgba(0, 0, 0, 0.35)",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
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
