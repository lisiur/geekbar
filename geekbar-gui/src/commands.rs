use geekbar::Work;
use serde_json::Value;
use tauri::{command, State};

use crate::GeekbarState;

#[command]
pub async fn execute(
    executor: State<'_, GeekbarState>,
    work: Work,
    value: Option<Value>,
) -> Result<(), String> {
    executor
        .0
        .lock()
        .unwrap()
        .executor
        .receive_work(work, value)
        .map_err(|e| e.to_string())
}

#[command]
pub async fn trigger(
    executor: State<'_, GeekbarState>,
    trigger_id: &str,
    value: Option<Value>,
) -> Result<bool, String> {
    executor
        .0
        .lock()
        .unwrap()
        .executor
        .trigger(trigger_id, value)
        .map_err(|e| e.to_string())
}
