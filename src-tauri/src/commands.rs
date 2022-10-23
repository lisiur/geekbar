use geekbar_core::work::WorkParams;
use serde_json::Value;
use tauri::{command, State};

use crate::{workflow::load_workflows, WorksExecutorState};

#[command]
pub async fn reload(executor: State<'_, WorksExecutorState>) -> Result<bool, String> {
    let mut works_executor = executor.0.lock().unwrap();

    let success = works_executor.clear().map_err(|e| e.to_string())?;

    if success {
        let workflows = load_workflows().map_err(|e| e.to_string())?;
        works_executor.add_workflows(workflows);
        Ok(true)
    } else {
        Ok(false)
    }
}

#[command]
pub async fn execute(
    executor: State<'_, WorksExecutorState>,
    work_params: WorkParams,
    value: Option<Value>,
) -> Result<(), String> {
    executor
        .0
        .lock()
        .unwrap()
        .send_params(work_params, value)
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
