import React, { createContext, useContext, useState, useEffect } from "react";

// Define the possible theme values
type Theme = "business" | "lofi";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Retrieve theme from localStorage or default to 'corporate'
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme === "business" || savedTheme === "lofi"
      ? savedTheme
      : "lofi";
  });

  useEffect(() => {
    // Save the theme to localStorage and update the `data-theme` attribute
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "lofi" ? "business" : "lofi"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
