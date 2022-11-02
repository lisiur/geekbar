#![allow(dead_code)]

use anyhow::anyhow;
use directories::ProjectDirs;
use geekbar_core::workflow::Workflow;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

pub struct WorkflowFactory {
    pub id: String,
    pub path: PathBuf,
    pub timestamp: SystemTime,
    pub content: String,
    pub workflow: Workflow,
}

impl WorkflowFactory {
    pub fn generate(&mut self) -> anyhow::Result<Workflow> {
        let metadata = fs::metadata(&self.path)?;
        let timestamp = metadata.modified()?;
        if timestamp.ne(&self.timestamp) {
            let workflow_json = fs::read_to_string(&self.path)?;
            let workflow = Workflow::from_json(&workflow_json)?;
            self.content = workflow_json;
            self.timestamp = timestamp;
            self.workflow = workflow;
        }
        let workflow = Workflow::from_json(&self.content)?;
        Ok(workflow)
    }
}

pub struct Workflows;

impl Workflows {
    pub fn workflows_dir() -> anyhow::Result<PathBuf> {
        let proj_dirs = ProjectDirs::from("top.geekbar", "", "geekbar")
            .ok_or_else(|| anyhow!("ProjectDirs not found"))?;
        let config_dir = proj_dirs.config_dir();
        let workflows_dir = config_dir.join("workflows");
        if !workflows_dir.exists() {
            std::fs::create_dir_all(&workflows_dir)?;
        }
        Ok(workflows_dir)
    }

    pub fn add_workflow(new_name: &str) -> anyhow::Result<WorkflowFactory> {
        let workflows_dir = Self::workflows_dir()?;
        for entry in fs::read_dir(&workflows_dir)? {
            let path = entry?.path();
            let name = path
                .file_name()
                .ok_or_else(|| anyhow::anyhow!("invalid path"))?
                .to_os_string()
                .into_string()
                .map_err(|_| anyhow::anyhow!("invalid path"))?;
            if name.eq(new_name) {
                return Err(anyhow!("name already exists"));
            }
        }
        let workflow_dir = workflows_dir.join(new_name);
        fs::create_dir(&workflow_dir)?;
        let workflow_file_path = workflow_dir.join("workflow.json");
        let workflow_json = r#"{"title":"", "nodes":[], "edges":[]}"#;
        fs::write(&workflow_file_path, workflow_json)?;
        let workflow_factory = Self::load_workflow_from_path(&workflow_dir)?;
        Ok(workflow_factory)
    }

    pub fn load_workflows() -> anyhow::Result<Vec<WorkflowFactory>> {
        let workflows_dir = Self::workflows_dir()?;
        let workflows = Self::load_workflows_from_dir(&workflows_dir)?;
        Ok(workflows)
    }

    pub fn check_name_exist(name: &str) -> anyhow::Result<bool> {
        let exist_names = Self::load_workflow_names()?;
        Ok(exist_names.iter().any(|v| v == name))
    }

    fn load_workflow_names() -> anyhow::Result<Vec<String>> {
        let workflows_dir = Self::workflows_dir()?;

        let mut vec = Vec::new();
        for entry in fs::read_dir(workflows_dir)? {
            let path = entry?
                .path()
                .file_name()
                .unwrap()
                .to_string_lossy()
                .to_string();
            vec.push(path);
        }
        Ok(vec)
    }

    pub fn load_workflows_from_dir(workflows_dir: &Path) -> anyhow::Result<Vec<WorkflowFactory>> {
        let mut vec = Vec::new();
        for entry in fs::read_dir(workflows_dir)? {
            let path = entry?.path();
            vec.push(Self::load_workflow_from_path(&path)?)
        }
        Ok(vec)
    }

    pub fn load_workflow_from_path(path: impl AsRef<Path>) -> anyhow::Result<WorkflowFactory> {
        let metadata = fs::metadata(path.as_ref())?;
        let path_buf = path.as_ref().to_path_buf();
        let workflow_file_path = path_buf.join("workflow.json");
        if !workflow_file_path.exists() {
            anyhow::bail!("workflow.json not exists")
        }
        let workflow_id = path_buf
            .file_name()
            .ok_or_else(|| anyhow::anyhow!("invalid path"))?
            .to_os_string()
            .into_string()
            .map_err(|_| anyhow::anyhow!("invalid path"))?;
        let workflow_json = fs::read_to_string(&workflow_file_path)?;
        let workflow = Workflow::from_json(&workflow_json).unwrap();
        let workflow_factory = WorkflowFactory {
            id: workflow_id,
            path: workflow_file_path,
            timestamp: metadata.modified()?,
            content: workflow_json,
            workflow,
        };
        Ok(workflow_factory)
    }
}

pub fn load_workflows() -> anyhow::Result<Vec<Workflow>> {
    let workflow_factories = Workflows::load_workflows()?;
    let workflows = workflow_factories
        .into_iter()
        .map(|f| f.workflow)
        .collect::<Vec<_>>();
    Ok(workflows)
}
