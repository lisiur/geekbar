import { ThemeCommonVars } from "naive-ui";

export type ThemeColor = "light" | "dark";
export interface ThemeVars extends ThemeCommonVars {
  backgroundColor: string
}

export interface Theme {
  color: ThemeColor;
  name: string;
  vars: Partial<ThemeVars>;
}
