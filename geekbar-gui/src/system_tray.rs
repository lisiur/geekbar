use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, WindowBuilder,
    WindowUrl, Wry,
};

pub fn init() -> SystemTray {
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show".to_string(), "show"))
        .add_item(CustomMenuItem::new("setting".to_string(), "setting"))
        .add_item(CustomMenuItem::new("quit".to_string(), "quit"));
    SystemTray::new().with_menu(tray_menu)
}

pub fn event_handler(app: &AppHandle<Wry>, event: SystemTrayEvent) {
    let show_setting_window = || {
        if let Some(window) = app.get_window("setting") {
            window.show().unwrap();
        } else {
            let window_width = 480.0;
            let window_height = 680.0;
            WindowBuilder::new(
                app,
                "setting".to_string(),
                WindowUrl::App("index.html/#/setting".into()),
            )
            .title("Setting")
            .decorations(true)
            .skip_taskbar(true)
            .always_on_top(true)
            .visible(true)
            .resizable(true)
            .inner_size(window_width, window_height)
            .transparent(false)
            .build()
            .unwrap();
        }
    };
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            app.emit_all("show", ()).unwrap();
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "show" => app.emit_all("show", ()).unwrap(),
            "setting" => show_setting_window(),
            "quit" => std::process::exit(0),
            _ => {}
        },
        _ => {}
    }
}
