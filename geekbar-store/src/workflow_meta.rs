use std::{
    path::{Path, PathBuf},
    sync::Arc,
    time::SystemTime,
};

use geekbar_core::workflow::Workflow;
use std::fs;
use uuid::Uuid;

pub struct WorkflowMeta {
    path: PathBuf,
    timestamp: SystemTime,
    workflow: Arc<Workflow>,
}

impl WorkflowMeta {
    pub fn generate(&mut self) -> anyhow::Result<Arc<Workflow>> {
        let metadata = fs::metadata(&self.path)?;
        let timestamp = metadata.modified()?;
        if timestamp.ne(&self.timestamp) {
            let workflow_json = fs::read_to_string(&self.path)?;
            let workflow = Workflow::from_json(&workflow_json)?;
            self.timestamp = timestamp;
            self.workflow = Arc::new(workflow);
        }
        Ok(self.workflow.clone())
    }

    pub fn workflow_id(&self) -> Uuid {
        self.workflow.id
    }

    pub fn load_from_path(path: impl AsRef<Path>) -> anyhow::Result<Self> {
        let metadata = fs::metadata(path.as_ref())?;
        let path_buf = path.as_ref().to_path_buf();
        let workflow_file_path = path_buf.join("workflow.json");
        if !workflow_file_path.exists() {
            anyhow::bail!("workflow.json not exists")
        }

        let workflow_json = fs::read_to_string(&workflow_file_path)?;

        let workflow = Workflow::from_json(&workflow_json)?;

        let workflow_meta = WorkflowMeta {
            path: workflow_file_path,
            timestamp: metadata.modified()?,
            workflow: Arc::new(workflow),
        };
        Ok(workflow_meta)
    }
}
