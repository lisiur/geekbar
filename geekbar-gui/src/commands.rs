use geekbar_core::executor::Work;
use serde_json::Value;
use tauri::{command, State};

use crate::WorksExecutorState;

#[command]
pub async fn execute(
    executor: State<'_, WorksExecutorState>,
    work: Work,
    value: Option<Value>,
) -> Result<(), String> {
    executor
        .0
        .lock()
        .unwrap()
        .receive_work(work, value)
        .map_err(|e| e.to_string())
}

#[command]
pub async fn trigger(
    executor: State<'_, WorksExecutorState>,
    trigger_id: &str,
    value: Option<Value>,
) -> Result<bool, String> {
    executor
        .0
        .lock()
        .unwrap()
        .trigger(trigger_id, value)
        .map_err(|e| e.to_string())
}
