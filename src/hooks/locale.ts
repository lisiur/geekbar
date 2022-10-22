import { zhCN, dateZhCN, enUS, dateEnUS } from "naive-ui";
import { ref, computed } from "vue";
import i18n from '../i18n'

const Lang = {
  zhCN,
  enUS,
};

const DateLang = {
  zhCN: dateZhCN,
  enUS: dateEnUS,
};

export const currentLang = ref<keyof typeof Lang>("zhCN");

export const currentNaiveUiLang = computed(() => {
  return Lang[currentLang.value];
});

export const currentNaiveUiDateLang = computed(() => {
  return DateLang[currentLang.value];
});

export function setLocale(lang: keyof typeof Lang) {
  currentLang.value = lang;
  i18n.global.locale = lang;
}

export function useLocale() {
    return {
        currentNaiveUiLang,
        currentNaiveUiDateLang,
        setLocale,
    }
}