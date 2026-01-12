"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
  const context = React.useContext(
    // @ts-expect-error - ThemeContext is internal to next-themes
    NextThemesProvider.ThemeContext || {},
  )
  if (!context || !context.theme) {
    return { theme: "dark", setTheme: () => {} }
  }
  return context
}
