#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod system_tray;
mod utils;

use geekbar::Geekbar;
use std::{
    sync::{Arc, Mutex},
    thread,
};
use tauri::Manager;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt};

pub struct GeekbarState(Arc<Mutex<Geekbar>>);

fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry().with(fmt::layer()).init();

    let geekbar = Geekbar::init()?;
    let receiver = geekbar.receiver();
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            thread::spawn(move || {
                while let Ok(work) = receiver.recv() {
                    app_handle.emit_all("work", work).unwrap();
                }
            });

            let app_handle = app.handle();
            app.listen_global("hide_splashscreen", move |_event| {
                utils::hide_splashscreen(&app_handle);
            });

            let app_handle = app.handle();
            app.listen_global("show_window", move |event| {
                let window_label = event.payload().unwrap();
                tracing::info!(window_label, "show_window");
                utils::show_window(&app_handle, window_label);
            });

            Ok(())
        })
        .manage(GeekbarState(Arc::new(Mutex::new(geekbar))))
        .invoke_handler(tauri::generate_handler![
            commands::trigger,
            commands::execute,
            commands::fetch_all_workflows,
            commands::create_workflow,
            commands::delete_workflow,
            commands::move_workflow,
            commands::save_workflow,
        ])
        .system_tray(system_tray::init())
        .on_system_tray_event(system_tray::event_handler)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
