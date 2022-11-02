use anyhow::anyhow;
use directories::ProjectDirs;
use geekbar_core::workflow::{Workflow, WorkflowConfig};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use uuid::Uuid;

use crate::workflow_meta::WorkflowMeta;

pub struct Store {
    workflows_dir: PathBuf,
    workflows_meta: HashMap<Uuid, WorkflowMeta>,
}

impl Store {
    pub fn new() -> anyhow::Result<Self> {
        let proj_dirs = ProjectDirs::from("top.geekbar", "", "geekbar")
            .ok_or_else(|| anyhow!("Project dir not found"))?;
        let config_dir = proj_dirs.config_dir();
        let workflows_dir = config_dir.join("workflows");
        if !workflows_dir.exists() {
            std::fs::create_dir_all(&workflows_dir)?;
        }

        let mut workflows_meta = HashMap::new();
        load_workflows_from_dir(&workflows_dir)?
            .into_iter()
            .for_each(|workflow_meta| {
                workflows_meta.insert(workflow_meta.workflow_id(), workflow_meta);
            });

        let store = Self {
            workflows_dir,
            workflows_meta,
        };

        Ok(store)
    }

    pub fn add_workflow(&mut self, name: &str) -> anyhow::Result<Uuid> {
        let workflow_config = WorkflowConfig::new_empty(name);
        let workflow_id = workflow_config.id;
        let workflow_json = serde_json::to_string(&workflow_config)?;

        let workflow_dir = self.workflows_dir.join(workflow_id.to_string());
        fs::create_dir(&workflow_dir)?;

        let workflow_file_path = workflow_dir.join("workflow.json");
        fs::write(&workflow_file_path, workflow_json)?;

        let workflow_meta = WorkflowMeta::load_from_path(&workflow_file_path)?;
        self.workflows_meta
            .insert(workflow_meta.workflow_id(), workflow_meta);

        Ok(workflow_id)
    }

    pub fn delete_workflow(&mut self, workflow_id: Uuid) -> anyhow::Result<()> {
        todo!()
    }

    pub fn get_all_workflows(&mut self) -> anyhow::Result<Vec<Arc<Workflow>>> {
        let mut workflows = Vec::new();
        for workflow_meta in self.workflows_meta.values_mut() {
            let workflow = workflow_meta.generate()?;
            workflows.push(workflow);
        }

        Ok(workflows)
    }

    pub fn get_workflow(&mut self, workflow_id: Uuid) -> anyhow::Result<Option<Arc<Workflow>>> {
        let workflow_meta = self.workflows_meta.get_mut(&workflow_id);
        match workflow_meta {
            Some(workflow_meta) => Ok(Some(workflow_meta.generate()?)),
            None => Ok(None),
        }
    }
}

pub fn load_workflows_from_dir(workflows_dir: &Path) -> anyhow::Result<Vec<WorkflowMeta>> {
    let mut vec = Vec::new();
    for entry in fs::read_dir(workflows_dir)? {
        let path = entry?.path();
        vec.push(WorkflowMeta::load_from_path(&path)?)
    }
    Ok(vec)
}
