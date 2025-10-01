// Theme utilities for light/dark mode handling
// Provides persistent storage, system preference detection, and rsuite theme mapping.

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'wowaudit-theme';

export function getStoredTheme(): ThemeMode | null {
    try {
        const v = localStorage.getItem(THEME_KEY);
        if (v === 'light' || v === 'dark') return v;
    } catch { /* ignore */
    }
    return null;
}

export function detectPreferredTheme(): ThemeMode {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
}

export function applyTheme(theme: ThemeMode) {
    if (typeof document !== 'undefined') {
        document.body.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch { /* ignore */
        }
    }
}

export function initTheme(): ThemeMode {
    const stored = getStoredTheme();
    const theme = stored ?? detectPreferredTheme();
    applyTheme(theme);
    return theme;
}

// Map to rsuite provider theme name
export function rsuiteTheme(mode: ThemeMode): 'light' | 'dark' {
    return mode;
}
