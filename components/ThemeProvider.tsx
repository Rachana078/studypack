'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      themes={['pink', 'light', 'dark']}
      value={{ pink: 'pink', light: 'light', dark: 'dark' }}
      storageKey="studypack-theme"
      enableSystem
      enableColorScheme={false}
    >
      {children}
    </NextThemesProvider>
  )
}
