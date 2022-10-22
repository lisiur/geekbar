import { Theme } from "../types";
import { changeColor } from "seemly";
import { createHoverColor, createPressedColor } from "../utils";

const colors = {
  backgroundColor: '#000',
  primaryColor: "#63E2B7",
  infoColor: "#4B70FA",
  successColor: "#63E2B7",
  errorColor: "#EB3B61",
  warningColor: "#FAB23E",
  borderColor: "#666",
  textColorDisabled: "#5B5B5B",
  textColor1: "#FFFFFF",
  textColor2: "#D6D6D6",
  textColor3: "#ADADAD",
  placeholderColor: "#5B5B5B", // disabled, placeholder, icon
  placeholderColorDisabled: "#848484",
  tableHeaderColor: "#282828",
  dividerColor: "#5B5B5B",
  hoverColor: "rgba(79, 178, 51, 0.15)",
  closeIconColor: "#D6D6D6",
  modalColor: "#282828",
  clearColor: "#ADADAD",
  inputColorDisabled: "#ebedf0",
  actionColor: "#ebedf0",
  boxShadow2: "0 2px 16px 0 rgba(0,0,0,0.16), 0 0 16px -2px rgba(0,0,0,0.12)",
};

const theme: Theme = {
  color: "dark",
  name: "defaultDark",
  vars: {
    ...colors,
    baseColor: "#fff",
    hoverColor: changeColor(colors.primaryColor, { alpha: 0.1 }),
    primaryColorHover: createHoverColor(colors.primaryColor),
    primaryColorPressed: createPressedColor(colors.primaryColor),
    infoColorHover: createHoverColor(colors.infoColor),
    infoColorPressed: createPressedColor(colors.infoColor),
    successColorHover: createHoverColor(colors.successColor),
    successColorPressed: createPressedColor(colors.successColor),
    errorColorHover: createHoverColor(colors.errorColor),
    errorColorPressed: createPressedColor(colors.errorColor),
    warningColorHover: createHoverColor(colors.warningColor, 0.2),
    warningColorPressed: createPressedColor(colors.warningColor, 0.05),
  },
};

export default theme;
