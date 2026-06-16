import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors shadow-2xs cursor-pointer focus:outline-none"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun size={16} className="text-amber-500 transition-transform hover:rotate-45 duration-300" />
      ) : (
        <Moon size={16} className="text-violet-500 transition-transform hover:-rotate-12 duration-300" />
      )}
    </button>
  )
}
