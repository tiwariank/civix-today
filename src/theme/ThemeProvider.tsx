import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DarkTheme as NavigationDark, DefaultTheme as NavigationLight, Theme as NavTheme } from '@react-navigation/native';
import { ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const THEME_KEY = 'app.theme';


type ThemeName = 'light' | 'dark';
type statusBarStyleType = 'dark-content' | 'light-content';


type ThemeContextType = {
    themeName: ThemeName;
    toggleTheme: () => Promise<void>;
    setTheme: (t: ThemeName) => Promise<void>;
    theme: {
        colors: {
            background: string;
            card: string;
            text: string;
            primary: string;
            muted: string;
        };
        statusBarStyle: statusBarStyleType;
        navigationTheme: NavTheme;
    };
};


const ThemeContext = createContext<ThemeContextType | undefined>(undefined);


const LightColors = {
    background: '#f7f8fb',
    card: '#ffffff',
    text: '#111827',
    primary: '#0f62fe',
    muted: '#6b7280',
};


const DarkColors = {
    background: '#0f1724',
    card: '#0b1220',
    text: '#e6eef8',
    primary: '#4f8cff',
    muted: '#9ca3af',
};


export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [themeName, setThemeName] = useState<ThemeName>('light');
    const [loaded, setLoaded] = useState(false);


    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(THEME_KEY);
                if (raw === 'dark' || raw === 'light') setThemeName(raw);
            } catch (e) {
                // ignore
            } finally {
                setLoaded(true);
            }
        })();
    }, []);


    const setTheme = async (t: ThemeName) => {
        try {
            await AsyncStorage.setItem(THEME_KEY, t);
        } catch (e) {
            console.warn('Failed saving theme', e);
        }
        setThemeName(t);
    };


    const toggleTheme = async () => {
        await setTheme(themeName === 'dark' ? 'light' : 'dark');
    };


    // const theme = useMemo(() => {
    //     const isDark = themeName === 'dark';
    //     const colors = isDark ? DarkColors : LightColors;


    // };

    const theme = useMemo(() => {
        const isDark = themeName === 'dark';
        const colors = isDark ? DarkColors : LightColors;
        const statusBarStyle: 'dark-content' | 'light-content' = isDark ? 'light-content' : 'dark-content';

        //statusBarStyle: isDark ? ('light-content' as 'light-content') : ('dark-content' as 'dark-content'),

        const navigationTheme = isDark
            ? {
                ...NavigationDark,
                colors: {
                    ...NavigationDark.colors,
                    background: colors.background,
                    card: colors.card,
                    text: colors.text,
                    primary: colors.primary,
                },
            }
            : {
                ...NavigationLight,
                colors: {
                    ...NavigationLight.colors,
                    background: colors.background,
                    card: colors.card,
                    text: colors.text,
                    primary: colors.primary,
                },
            };


        return {
            colors,
            statusBarStyle: statusBarStyle,
            navigationTheme,
        };
    }, [themeName]);

    if (!loaded) return null;

    return (
        <ThemeContext.Provider value={{ themeName, toggleTheme, setTheme, theme }}>{children}</ThemeContext.Provider>
    );

};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};