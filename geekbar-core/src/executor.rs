use std::{
    collections::{HashMap, HashSet, VecDeque},
    path::Path,
    sync::Arc,
};

use crossbeam_channel::{Receiver, Sender};
use serde::{Deserialize, Serialize};
use serde_json::{to_value, Value};
use uuid::Uuid;

use crate::{
    params::Params,
    workflow::{Workflow, WorkflowBuilder},
};

type WorkflowId = Uuid;
type WorkflowPid = Uuid;
type TriggerId = String;
type NodeId = Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkNode {
    workflow_pid: WorkflowPid,
    workflow_id: WorkflowId,
    node_id: NodeId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Work {
    pub work_node: WorkNode,
    pub params: Params,
}

impl Work {
    pub fn workflow_id(&self) -> WorkflowId {
        self.work_node.workflow_id
    }
    pub fn workflow_pid(&self) -> WorkflowPid {
        self.work_node.workflow_pid
    }
    pub fn node_id(&self) -> NodeId {
        self.work_node.node_id
    }
    pub fn resolve_value(&mut self, value: Value) {
        self.params.prompt.take();
        self.params.set_value(value);
    }
}

pub type WorkSender = Sender<Work>;
pub type WorkReceiver = Receiver<Work>;

pub struct Executor {
    workflows_pid: HashMap<WorkflowId, WorkflowPid>,
    active_workflows: HashMap<WorkflowPid, Arc<Workflow>>,
    running_workflows: HashMap<WorkflowPid, usize>,
    removing_workflows: HashSet<WorkflowPid>,
    entries: HashMap<TriggerId, WorkNode>,
    queue: VecDeque<Work>,
    work_sender: WorkSender,
    work_receiver: WorkReceiver,
}

impl Executor {
    pub fn default() -> Self {
        let (work_sender, work_receiver): (WorkSender, WorkReceiver) =
            crossbeam_channel::unbounded();
        Self {
            workflows_pid: HashMap::new(),
            active_workflows: HashMap::new(),
            running_workflows: HashMap::new(),
            removing_workflows: HashSet::new(),
            entries: HashMap::new(),
            queue: VecDeque::new(),
            work_sender,
            work_receiver,
        }
    }

    pub fn receiver(&self) -> &WorkReceiver {
        &self.work_receiver
    }

    pub fn add_workflow(&mut self, workflow: Arc<Workflow>) {
        let workflow_pid = Uuid::new_v4();
        let workflow_id = workflow.id;

        // add workflow
        self.workflows_pid.insert(workflow.id, workflow_pid);
        self.active_workflows.insert(workflow_pid, workflow.clone());
        self.running_workflows.insert(workflow_pid, 0);

        // add triggers
        workflow.get_triggers().iter().for_each(|trigger| {
            self.entries.insert(
                trigger.0.to_string(),
                WorkNode {
                    workflow_id,
                    workflow_pid,
                    node_id: *trigger.1,
                },
            );
        });
    }

    pub fn add_workflows(&mut self, workflows: Vec<Arc<Workflow>>) {
        workflows.into_iter().for_each(|wf| self.add_workflow(wf));
    }

    pub fn remove_workflow(&mut self, workflow_id: WorkflowId) {
        let workflow_pid = self.workflows_pid.get(&workflow_id).unwrap().to_owned();

        let workflow = self.active_workflows.get(&workflow_pid).unwrap();
        self.removing_workflows.insert(workflow_id);

        // remove related entries
        workflow.get_triggers().iter().for_each(|trigger| {
            self.entries.remove(trigger.0);
        });

        // remove workflow pid
        self.workflows_pid.remove(&workflow_id);

        self.try_remove_workflow(workflow_pid);
    }

    pub fn try_remove_workflow(&mut self, workflow_pid: WorkflowPid) {
        if self.running_workflows.get(&workflow_pid).unwrap() == &0 {
            self.active_workflows.remove(&workflow_pid);
            self.removing_workflows.remove(&workflow_pid);
        }
    }

    pub fn has_trigger(&self, trigger_id: &str) -> bool {
        self.entries.contains_key(trigger_id)
    }

    pub fn trigger<T: Serialize>(
        &mut self,
        trigger_id: &str,
        params: Option<T>,
    ) -> crate::result::Result<bool> {
        if let Some(work_node) = self.entries.get(trigger_id) {
            let work = Work {
                work_node: work_node.clone(),
                params: Params::new(match params {
                    Some(params) => to_value(params)?,
                    None => Value::Null,
                }),
            };
            self.queue.push_back(work);
            self.execute_works()?;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    fn execute_works(&mut self) -> crate::result::Result<()> {
        while let Some(work) = self.queue.pop_front() {
            let Work { work_node, params } = work;
            let workflow_pid = &work_node.workflow_pid;
            let node_id = &work_node.node_id;
            let workflow = self.active_workflows.get(workflow_pid).unwrap();
            let node = workflow.get_node(node_id).unwrap();

            let params = node.node.execute(params)?;

            let work = Work { work_node, params };

            self.send_work(work);
        }
        Ok(())
    }

    fn send_work(&mut self, work: Work) {
        let workflow_pid = work.workflow_pid();

        self.work_sender.send(work).unwrap();

        self.increase_workflow(workflow_pid);
    }

    fn increase_workflow(&mut self, workflow_pid: WorkflowPid) {
        self.running_workflows
            .entry(workflow_pid)
            .and_modify(|e| *e += 1);
    }

    fn decrease_workflow(&mut self, workflow_pid: WorkflowPid) {
        self.running_workflows
            .entry(workflow_pid)
            .and_modify(|e| *e -= 1);

        if self.removing_workflows.get(&workflow_pid).is_some() {
            self.try_remove_workflow(workflow_pid);
        }
    }

    pub fn receive_work(
        &mut self,
        mut work: Work,
        value: Option<Value>,
    ) -> crate::result::Result<()> {
        let workflow_pid = work.workflow_pid();
        let node_id = work.node_id();
        let workflow_id = work.workflow_id();

        if let Some(value) = value {
            work.params.set_value(value);
        }
        let params = work.params;

        let workflow = self.active_workflows.get(&workflow_pid).unwrap();
        let next_nodes = workflow.next_nodes(&node_id, &params)?.into_iter();

        for next_node in next_nodes {
            let next_work = Work {
                work_node: WorkNode {
                    workflow_id,
                    workflow_pid,
                    node_id: next_node.id,
                },
                params: params.clone(),
            };
            self.queue.push_back(next_work);
        }

        self.execute_works()?;

        self.decrease_workflow(workflow_pid);

        Ok(())
    }

    pub fn execute_workflow_json<T: Serialize>(
        &mut self,
        json: &str,
        trigger_id: &str,
        params: Option<T>,
    ) -> crate::result::Result<bool> {
        let workflow = WorkflowBuilder::default().json(json).build()?;
        self.add_workflow(Arc::new(workflow));

        self.trigger(trigger_id, params)
    }

    pub fn execute_workflow_file<T: Serialize>(
        &mut self,
        path: impl AsRef<Path>,
        trigger_id: &str,
        params: Option<T>,
    ) -> crate::result::Result<bool> {
        let workflow_json = std::fs::read_to_string(path)?;
        self.execute_workflow_json(&workflow_json, trigger_id, params)
    }
}
