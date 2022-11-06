import { lightTheme, darkTheme, ConfigProviderProps } from 'naive-ui';
import { useTheme } from './theme';
import { useLocale } from './locale'
import { computed } from 'vue';
import { onThemeChange } from '../utils/window';

const { theme, themeOverrides, changeTheme } = useTheme()
const { currentNaiveUiDateLang, currentNaiveUiLang } = useLocale()

onThemeChange((arg) => {
    changeTheme(arg.payload)
})

const config = computed<ConfigProviderProps>(() => ({
    theme: theme.value.color === 'light' ? lightTheme : darkTheme,
    themeOverrides: themeOverrides.value,
    locale: currentNaiveUiLang.value,
    dateLocale: currentNaiveUiDateLang.value,
}))

export function useConfigProvider() {
    return {
        config
    }
}