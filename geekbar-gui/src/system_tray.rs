use tauri::{AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, Wry};

use crate::utils::show_setting_window;

pub fn init() -> SystemTray {
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show".to_string(), "show"))
        .add_item(CustomMenuItem::new("setting".to_string(), "setting"))
        .add_item(CustomMenuItem::new("quit".to_string(), "quit"));
    SystemTray::new().with_menu(tray_menu)
}

pub fn event_handler(app: &AppHandle<Wry>, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            app.emit_all("show", ()).unwrap();
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "show" => app.emit_all("show", ()).unwrap(),
            "setting" => show_setting_window(app),
            "quit" => std::process::exit(0),
            _ => {}
        },
        _ => {}
    }
}
