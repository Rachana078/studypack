'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="pink"
      themes={['pink', 'light', 'dark']}
      value={{ pink: 'pink', light: 'light', dark: 'dark' }}
      storageKey="studypack-theme"
      enableColorScheme={false}
    >
      {children}
    </NextThemesProvider>
  )
}
