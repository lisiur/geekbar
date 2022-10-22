import { lightTheme, darkTheme, ConfigProviderProps } from 'naive-ui';
import { useTheme } from './theme';
import { useLocale } from './locale'
import { computed } from 'vue';

const { theme, themeOverrides } = useTheme()
const { currentNaiveUiDateLang, currentNaiveUiLang } = useLocale()

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