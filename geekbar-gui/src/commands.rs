use geekbar::Work;
use serde_json::Value;
use tauri::{command, State};
use uuid::Uuid;

use crate::GeekbarState;

#[command]
pub async fn execute(
    geekbar: State<'_, GeekbarState>,
    work: Work,
    value: Option<Value>,
) -> Result<(), String> {
    geekbar
        .0
        .lock()
        .unwrap()
        .executor
        .receive_work(work, value)
        .map_err(|e| e.to_string())
}

#[command]
pub async fn trigger(
    geekbar: State<'_, GeekbarState>,
    trigger_id: &str,
    value: Option<Value>,
) -> Result<bool, String> {
    geekbar
        .0
        .lock()
        .unwrap()
        .executor
        .trigger(trigger_id, value)
        .map_err(|e| e.to_string())
}

#[command]
pub async fn fetch_all_workflows(geekbar: State<'_, GeekbarState>) -> Result<Vec<String>, String> {
    geekbar
        .0
        .lock()
        .unwrap()
        .fetch_all_workflows_json()
        .map_err(|e| e.to_string())
}

#[command]
pub async fn create_workflow(
    geekbar: State<'_, GeekbarState>,
    workflow_name: String,
) -> Result<Uuid, String> {
    geekbar
        .0
        .lock()
        .unwrap()
        .create_workflow(&workflow_name)
        .map_err(|e| e.to_string())
}

#[command]
pub async fn save_workflow(
    geekbar: State<'_, GeekbarState>,
    workflow_json: String,
) -> Result<(), String> {
    geekbar
        .0
        .lock()
        .unwrap()
        .save_workflow_json(&workflow_json)
        .map_err(|e| e.to_string())
}

#[command]
pub async fn delete_workflow(
    geekbar: State<'_, GeekbarState>,
    workflow_id: Uuid,
) -> Result<(), String> {
    geekbar
        .0
        .lock()
        .unwrap()
        .delete_workflow(workflow_id)
        .map_err(|e| e.to_string())
}

#[command]
pub async fn move_workflow(
    geekbar: State<'_, GeekbarState>,
    from: usize,
    to: usize,
) -> Result<(), String> {
    geekbar
        .0
        .lock()
        .unwrap()
        .move_workflow(from, to)
        .map_err(|e| e.to_string())
}
