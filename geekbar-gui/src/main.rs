#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod system_tray;

use geekbar::Geekbar;
use std::{
    sync::{Arc, Mutex},
    thread,
};
use tauri::Manager;

pub struct GeekbarState(Arc<Mutex<Geekbar>>);

fn main() -> anyhow::Result<()> {
    let geekbar = Geekbar::init()?;
    let receiver = geekbar.receiver();
    tauri::Builder::default()
        .setup(|app| {
            let app = app.handle();
            thread::spawn(move || {
                while let Ok(work) = receiver.recv() {
                    app.emit_all("work", work).unwrap();
                }
            });
            Ok(())
        })
        .manage(GeekbarState(Arc::new(Mutex::new(geekbar))))
        .invoke_handler(tauri::generate_handler![
            commands::trigger,
            commands::execute,
        ])
        .system_tray(system_tray::init())
        .on_system_tray_event(system_tray::event_handler)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
