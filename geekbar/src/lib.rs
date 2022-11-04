use std::sync::Arc;

pub use geekbar_core::executor::{Executor, Work, WorkReceiver};
pub use geekbar_core::workflow::Workflow;
use geekbar_core::workflow::WorkflowConfig;
use geekbar_store::Store;
use uuid::Uuid;

pub struct Geekbar {
    store: Store,
    pub executor: Executor,
}

impl Geekbar {
    pub fn init() -> anyhow::Result<Self> {
        let mut executor = Executor::default();
        let mut store = Store::init()?;

        let workflows = store.fetch_all_workflows()?;
        executor.add_workflows(workflows);

        let geekbar = Geekbar { store, executor };

        Ok(geekbar)
    }

    pub fn receiver(&self) -> WorkReceiver {
        self.executor.receiver().clone()
    }

    pub fn fetch_all_workflows(&mut self) -> anyhow::Result<Vec<Arc<Workflow>>> {
        let workflows = self.store.fetch_all_workflows()?;

        Ok(workflows)
    }

    pub fn fetch_all_workflows_json(&mut self) -> anyhow::Result<Vec<String>> {
        let workflows = self.store.fetch_all_workflows_json()?;

        Ok(workflows)
    }

    pub fn get_workflow_json(&mut self, workflow_id: Uuid) -> &str {
        self.store.get_workflow_json(workflow_id)
    }

    pub fn create_workflow(&mut self, name: &str) -> anyhow::Result<Uuid> {
        let workflow_id = self.store.create_workflow(name)?;
        let workflow = self.store.spawn_workflow(workflow_id)?;
        self.executor.add_workflow(workflow);

        Ok(workflow_id)
    }

    pub fn delete_workflow(&mut self, workflow_id: Uuid) -> anyhow::Result<()> {
        self.executor.remove_workflow(workflow_id);
        self.store.delete_workflow(workflow_id)
    }

    pub fn save_workflow_json(&mut self, workflow_json: &str) -> anyhow::Result<()> {
        let workflow_config: WorkflowConfig = serde_json::from_str(workflow_json)?;
        self.save_workflow(workflow_config)
    }

    pub fn save_workflow(&mut self, workflow_config: WorkflowConfig) -> anyhow::Result<()> {
        let workflow_id = self.store.save_workflow(workflow_config)?;
        self.executor.remove_workflow(workflow_id);

        let workflow = self.store.spawn_workflow(workflow_id)?;
        self.executor.add_workflow(workflow);

        Ok(())
    }

    pub fn move_workflow(&mut self, from: usize, to: usize) -> anyhow::Result<()> {
        self.store.move_workflow(from, to)
    }
}
