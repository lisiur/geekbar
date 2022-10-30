import { Theme } from "../types";
import { createHoverColor, createPressedColor } from "../utils";

const colors = {
  baseColor: '#fff',
  backgroundColor: '#fff',
  connectionColor: '#999',
  endpointColor: '#999',
  primaryColor: "#095188",
  infoColor: "#335FFF",
  successColor: "#4FB233",
  errorColor: "#D92149",
  warningColor: "#FFAC26",
  borderColor: "#999",
  textColorDisabled: "#D7DAE0",
  textColor1: "#333",
  textColor2: "#333",
  dividerColor: "#ebedf0",
  tableHeaderColor: "#ebedf0",
  inputColorDisabled: "#ebedf0",
  actionColor: "#ebedf0",
  boxShadow2: "0 2px 16px 0 rgba(0,0,0,0.1), 0 0 16px -2px rgba(0,0,0,0.06)",
}

const theme: Theme = {
  color: "light",
  name: "defaultLight",
  vars: {
    ...colors,
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
