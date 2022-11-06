import { event, globalShortcut, window } from "@tauri-apps/api";
const { currentMonitor, PhysicalPosition, LogicalSize, getCurrent } = window;

export interface WindowDescriptor {
  width: number;
  height: number;
}

export async function setWindowSize(
  descriptor: WindowDescriptor
): Promise<void> {
  const appWindow = getCurrent();
  let { width, height } = descriptor;
  await appWindow.setSize(new LogicalSize(width, height));
}

type PositionDescriptor =
  | {
      x: number;
      y: number;
    }
  | "topLeft"
  | "top"
  | "topRight"
  | "left"
  | "center"
  | "right"
  | "bottomLeft"
  | "bottom"
  | "bottomRight";

export async function setWindowPosition(
  descriptor: PositionDescriptor,
  offset?: { offsetX?: number; offsetY?: number }
) {
  const monitor = await currentMonitor();
  if (!monitor) {
    return;
  }
  const { width: monitorWidth, height: monitorHeight } = monitor.size;
  const { x: monitorX, y: monitorY } = monitor.position;
  const appWindow = await getCurrent();
  const { width: windowWidth, height: windowHeight } =
    await appWindow.innerSize();

  let x = 0;
  let y = 0;
  if (typeof descriptor === "object") {
    let px = Math.max(0, descriptor.x);
    let py = Math.max(0, descriptor.y);
    if (px <= 1) {
      x = (monitorWidth - windowWidth) * px;
    } else {
      x = px;
    }
    if (py <= 1) {
      y = (monitorHeight - windowHeight) * py;
    } else {
      y = py;
    }
  } else {
    const leftX = 0;
    const topY = 0;
    const centerX = (monitorWidth - windowWidth) / 2;
    const centerY = (monitorHeight - windowHeight) / 2;
    const rightX = monitorWidth - windowWidth;
    const bottomY = monitorHeight - windowHeight;
    const [px, py] = {
      topLeft: [leftX, topY],
      top: [centerX, topY],
      topRight: [rightX, topY],
      left: [leftX, centerY],
      center: [centerX, centerY],
      right: [rightX, centerY],
      bottomLeft: [leftX, bottomY],
      bottom: [centerX, bottomY],
      bottomRight: [rightX, bottomY],
    }[descriptor];
    x = px;
    y = py;
  }

  x += monitorX;
  y += monitorY;

  let offsetX = offset?.offsetX ?? 0;
  let offsetY = offset?.offsetY ?? 0;
  if (offsetX < 1) {
    offsetX = monitorWidth * offsetX;
  }
  if (offsetY < 1) {
    offsetY = monitorHeight * offsetY;
  }

  x += offsetX;
  y += offsetY;

  await appWindow.setPosition(new PhysicalPosition(x, y));
}

export async function toggleWindowVisible(): Promise<void> {
  const appWindow = getCurrent();
  if (await appWindow.isVisible()) {
    await hideWindow();
  } else {
    await showWindow();
  }
}

export async function hideWindow(): Promise<void> {
  const appWindow = getCurrent();
  await appWindow.hide();
}

export async function showWindow(): Promise<void> {
  const appWindow = getCurrent();
  await appWindow.show();
  await appWindow.setFocus();
}

export async function getCurrentTheme() {
  const appWindow = getCurrent();
  return appWindow.theme();
}

export async function onWindowBlur(fn: () => any) {
  return event.listen("tauri://blur", fn);
}

export async function onWindowFocus(fn: () => any) {
  return event.listen("tauri://focus", fn);
}

export async function onWindowClose(fn: () => any) {
  return event.listen("tauri://close-requested", fn);
}

export async function onWindowCreated(fn: () => any) {
  return event.listen("tauri://window-created", fn);
}

export async function onWindowDestroyed(fn: () => any) {
  return event.listen("tauri://destroyed", fn);
}

export async function onWindowResize(fn: () => any) {
  return event.listen("tauri://resize", fn);
}

export async function onThemeChange(fn: (event: any) => any) {
  return event.listen("tauri://theme-changed", fn);
}

export async function registerToggleWindowShortcut(shortcut: string) {
  if (await globalShortcut.isRegistered(shortcut)) {
    await globalShortcut.unregister(shortcut)
  }
  await globalShortcut.register(shortcut, toggleWindowVisible);
  event.listen("tauri://destroyed", async () => {
    await globalShortcut.unregister(shortcut);
  });
}
