use anyhow::anyhow;
use directories::ProjectDirs;
use geekbar_core::workflow::{Workflow, WorkflowConfig};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::{fs, vec};
use uuid::Uuid;

use crate::config::Config;
use crate::workflow_meta::WorkflowMeta;

pub struct Store {
    workflows_dir: PathBuf,
    workflows_meta: HashMap<Uuid, WorkflowMeta>,
    config_path: PathBuf,
    config: Config,
}

impl Store {
    pub fn init() -> anyhow::Result<Self> {
        let proj_dirs = ProjectDirs::from("top.geekbar", "", "geekbar")
            .ok_or_else(|| anyhow!("Project dir not found"))?;
        let config_dir = proj_dirs.config_dir();

        let workflows_dir = config_dir.join("workflows");
        if !workflows_dir.exists() {
            std::fs::create_dir_all(&workflows_dir)?;
        }

        let mut workflows_meta = HashMap::new();

        let mut workflow_ids = vec![];
        for workflow_meta in Self::load_workflows_from_dir(&workflows_dir)? {
            workflow_ids.push(workflow_meta.workflow_id());
            workflows_meta.insert(workflow_meta.workflow_id(), workflow_meta);
        }

        let config_path = config_dir.join("config.json");
        let config = if !config_path.exists() {
            let mut config = Config::default();
            config.workflows = workflow_ids;
            let config_json = serde_json::to_string(&config)?;
            std::fs::write(&config_path, config_json)?;
            config
        } else {
            let config_json = std::fs::read_to_string(&config_path)?;
            let config: Config = serde_json::from_str(&config_json)?;
            config
        };

        let store = Self {
            workflows_dir,
            workflows_meta,
            config_path,
            config,
        };

        Ok(store)
    }

    pub fn create_workflow(&mut self, name: &str) -> anyhow::Result<Uuid> {
        let workflow_config = WorkflowConfig::new_empty(name);

        self.save_workflow(workflow_config)
    }

    pub fn save_workflow(&mut self, workflow_config: WorkflowConfig) -> anyhow::Result<Uuid> {
        let workflow_file_path = self.save_workflow_file(&workflow_config)?;

        let workflow_meta = WorkflowMeta::load_from_path(&workflow_file_path)?;

        self.workflows_meta
            .insert(workflow_meta.workflow_id(), workflow_meta);

        Ok(workflow_config.id)
    }

    pub fn delete_workflow(&mut self, workflow_id: Uuid) -> anyhow::Result<()> {
        let workflow_dir_path = self.workflow_dir_path(workflow_id);

        self.workflows_meta.remove(&workflow_id);

        fs::remove_dir_all(&workflow_dir_path)?;

        Ok(())
    }

    pub fn fetch_all_workflows(&mut self) -> anyhow::Result<Vec<Arc<Workflow>>> {
        let mut workflows = Vec::new();
        for workflow_meta in self.workflows_meta.values_mut() {
            let workflow = workflow_meta.generate()?;
            workflows.push(workflow);
        }

        workflows.sort_by(|a, b| {
            let a = self
                .config
                .workflows
                .iter()
                .position(|w| w.eq(&a.id))
                .unwrap();
            let b = self
                .config
                .workflows
                .iter()
                .position(|w| w.eq(&b.id))
                .unwrap();

            a.cmp(&b)
        });

        Ok(workflows)
    }

    pub fn get_workflow(&mut self, workflow_id: Uuid) -> anyhow::Result<Option<Arc<Workflow>>> {
        let workflow_meta = self.workflows_meta.get_mut(&workflow_id);
        match workflow_meta {
            Some(workflow_meta) => Ok(Some(workflow_meta.generate()?)),
            None => Ok(None),
        }
    }

    pub fn move_workflow(&mut self, from: usize, to: usize) -> anyhow::Result<()> {
        let from_id = self.config.workflows.remove(from);
        self.config.workflows.insert(to, from_id);
        std::fs::write(&self.config_path, serde_json::to_string(&self.config)?)?;

        Ok(())
    }

    fn load_workflows_from_dir(workflows_dir: &Path) -> anyhow::Result<Vec<WorkflowMeta>> {
        let mut vec = Vec::new();
        for entry in fs::read_dir(workflows_dir)? {
            let path = entry?.path();
            vec.push(WorkflowMeta::load_from_path(&path)?)
        }
        Ok(vec)
    }

    fn workflow_dir_path(&self, workflow_id: Uuid) -> PathBuf {
        self.workflows_dir.join(workflow_id.to_string())
    }

    fn workflow_file_path(&self, workflow_id: Uuid) -> PathBuf {
        let workflow_dir = self.workflow_dir_path(workflow_id);
        workflow_dir.join("workflow.json")
    }

    fn save_workflow_file(&self, workflow_config: &WorkflowConfig) -> anyhow::Result<PathBuf> {
        let workflow_id = workflow_config.id;
        let workflow_json = serde_json::to_string(&workflow_config)?;

        let workflow_dir = self.workflow_dir_path(workflow_id);
        fs::create_dir_all(&workflow_dir)?;

        let workflow_file_path = self.workflow_file_path(workflow_id);
        fs::write(&workflow_file_path, workflow_json)?;

        Ok(workflow_file_path)
    }
}
