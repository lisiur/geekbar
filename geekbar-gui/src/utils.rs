use tauri::{AppHandle, Manager, WindowBuilder, WindowUrl, Wry};

pub fn show_window(app: &AppHandle<Wry>, label: &str) {
    if let Some(window) = app.get_window(label) {
        window.show().unwrap();
    }
}

pub fn hide_window(app: &AppHandle<Wry>, label: &str) {
    if let Some(window) = app.get_window(label) {
        window.hide().unwrap();
    }
}

pub fn show_setting_window(app: &AppHandle<Wry>) {
    if let Some(window) = app.get_window("setting") {
        window.show().unwrap();
    } else {
        let window_width = 1280.0;
        let window_height = 680.0;
        WindowBuilder::new(
            app,
            "setting".to_string(),
            WindowUrl::App("index.html/#/setting".into()),
        )
        .title("Setting")
        .decorations(true)
        .skip_taskbar(false)
        .always_on_top(false)
        .visible(false)
        .resizable(false)
        .inner_size(window_width, window_height)
        .build()
        .unwrap();
    }
}

pub fn show_splashscreen(app: &AppHandle<Wry>) {
    if let Some(window) = app.get_window("splashscreen") {
        window.show().unwrap();
    } else {
        let window_width = 400.0;
        let window_height = 200.0;
        WindowBuilder::new(
            app,
            "splashscreen".to_string(),
            WindowUrl::App("splashscreen.html".into()),
        )
        .title("Setting")
        .decorations(false)
        .skip_taskbar(true)
        .always_on_top(false)
        .visible(true)
        .resizable(false)
        .inner_size(window_width, window_height)
        .build()
        .unwrap();
    }
}

pub fn hide_splashscreen(app: &AppHandle<Wry>) {
    hide_window(app, "splashscreen")
}
