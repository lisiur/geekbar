use tauri::{AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, Wry};

pub fn init() -> SystemTray {
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show".to_string(), "show"))
        .add_item(CustomMenuItem::new("reload".to_string(), "reload"))
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
            "reload" => app.emit_all("reload", ()).unwrap(),
            "quit" => std::process::exit(0),
            _ => {}
        },
        _ => {}
    }
}
