import { createI18n } from "vue-i18n";
import messages from "./locales";

export default createI18n({
  locale: "zhCN",
  fallbackLocale: "enUS",
  globalInjection: true,
  allowComposition: true,
  messages,
});
