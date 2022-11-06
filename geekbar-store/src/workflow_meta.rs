use std::{
    path::{Path, PathBuf},
    sync::Arc,
    time::SystemTime,
};

use geekbar_core::workflow::{Workflow, WorkflowConfig};
use std::fs;
use uuid::Uuid;

pub struct WorkflowMeta {
    path: PathBuf,
    timestamp: SystemTime,
    workflow_json: String,
    workflow: Arc<Workflow>,
}

impl WorkflowMeta {
    pub fn spawn(&mut self) -> anyhow::Result<Arc<Workflow>> {
        let metadata = fs::metadata(&self.path)?;
        let timestamp = metadata.modified()?;
        if timestamp.ne(&self.timestamp) {
            let workflow_json = fs::read_to_string(&self.path)?;
            let workflow = Workflow::from_json(&workflow_json)?;
            self.timestamp = timestamp;
            self.workflow = Arc::new(workflow);
            self.workflow_json = workflow_json;
        }
        Ok(self.workflow.clone())
    }

    pub fn workflow_id(&self) -> Uuid {
        self.workflow.id
    }

    pub fn load_from_path(path: impl AsRef<Path>) -> anyhow::Result<Self> {
        let metadata = fs::metadata(path.as_ref())?;
        let workflow_file_path = path.as_ref().to_path_buf();
        if !workflow_file_path.exists() {
            tracing::error!(?workflow_file_path, "workflow.json not exists",);
            anyhow::bail!("workflow.json not exists")
        }

        let workflow_json = fs::read_to_string(&workflow_file_path)?;

        let workflow = Workflow::from_json(&workflow_json)?;

        let workflow_meta = WorkflowMeta {
            path: workflow_file_path,
            timestamp: metadata.modified()?,
            workflow_json,
            workflow: Arc::new(workflow),
        };
        Ok(workflow_meta)
    }

    pub fn get_workflow_json(&self) -> &str {
        &self.workflow_json
    }
}
