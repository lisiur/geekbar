#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod system_tray;
mod workflow;
mod workflows;

use geekbar_core::executor::Executor;
use std::{
    sync::{Arc, Mutex},
    thread,
};
use tauri::Manager;
use workflow::load_workflows;

pub struct WorksExecutorState(Arc<Mutex<Executor>>);

fn main() -> anyhow::Result<()> {
    let mut works_executor = Executor::default();
    works_executor.add_workflows(load_workflows()?);
    let receiver = works_executor.receiver().clone();
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
        .manage(WorksExecutorState(Arc::new(Mutex::new(works_executor))))
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
