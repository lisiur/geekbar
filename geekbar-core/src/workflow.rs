use std::collections::HashMap;
use std::path::Path;

use crate::link::Link;
use crate::node::Node;
use crate::nodes::trigger::Trigger;
use crate::params::Params;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub struct Workflow {
    // workflow id
    pub id: Uuid,
    // workflow title
    pub title: String,
    // key is node_id, value is node
    nodes: HashMap<Uuid, WorkflowNode>,
    // key is node_id, value is links that from this node
    links: HashMap<Uuid, Vec<Link>>,
    // key is trigger id, value is node id
    entries: HashMap<String, Uuid>,
    // triggers
    triggers: Vec<Trigger>,
}

#[derive(Serialize, Deserialize)]
pub struct WorkflowConfig {
    pub id: Uuid,
    title: String,
    nodes: Vec<WorkflowNode>,
    links: Vec<Link>,
}

impl WorkflowConfig {
    pub fn new_empty(name: &str) -> Self {
        Self {
            id: Uuid::new_v4(),
            title: name.to_string(),
            nodes: Vec::new(),
            links: Vec::new(),
        }
    }
}

impl Workflow {
    pub fn from_json(json: &str) -> crate::result::Result<Self> {
        WorkflowBuilder::default().json(json).build()
    }

    pub fn from_config(workflow_config: WorkflowConfig) -> crate::result::Result<Self> {
        let mut nodes = HashMap::new();
        let mut links = HashMap::<Uuid, Vec<Link>>::new();
        let mut entries = HashMap::<String, Uuid>::new();
        let mut triggers = Vec::new();

        for node in workflow_config.nodes {
            if node.node.typetag_name().eq("Trigger") {
                let trigger = node
                    .node
                    .as_any()
                    .downcast_ref::<Trigger>()
                    .expect("node is not a Trigger");
                triggers.push(trigger.to_owned());
                entries.insert(trigger.id(), node.id);
            }
            nodes.insert(node.id, node);
        }
        for link in workflow_config.links {
            links.entry(link.from).or_default().push(link);
        }
        Ok(Workflow {
            id: workflow_config.id,
            title: workflow_config.title,
            nodes,
            links,
            entries,
            triggers,
        })
    }

    pub fn has_trigger(&self, trigger_id: &str) -> bool {
        self.entries.contains_key(trigger_id)
    }

    pub fn get_triggers(&self) -> &HashMap<String, Uuid> {
        &self.entries
    }

    pub fn get_keywords(&self) -> Vec<&Trigger> {
        self.triggers
            .iter()
            .filter(|o| matches!(**o, Trigger::Keyword { .. }))
            .collect()
    }

    pub fn get_node(&self, node_id: &Uuid) -> Option<&WorkflowNode> {
        self.nodes.get(node_id)
    }

    pub fn next_nodes(
        &self,
        id: &Uuid,
        _params: &Params,
    ) -> crate::result::Result<Vec<&WorkflowNode>> {
        let links = self.links.get(id);
        match links {
            Some(links) => {
                let mut nodes = Vec::new();
                for link in links {
                    // TODO: link condition filter
                    let next_node = self.nodes.get(&link.to).unwrap();
                    nodes.push(next_node);
                }
                Ok(nodes)
            }
            None => Ok(Vec::new()),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct WorkflowNode {
    pub id: Uuid,
    #[serde(flatten)]
    pub node: Box<dyn Node>,
}

pub struct WorkflowBuilder {
    _json: Option<String>,
}

impl WorkflowBuilder {
    pub fn default() -> Self {
        Self { _json: None }
    }

    pub fn json<T: Into<String>>(mut self, json: T) -> Self {
        self._json = Some(json.into());
        self
    }

    pub fn file(mut self, path: impl AsRef<Path>) -> crate::result::Result<Self> {
        let json = std::fs::read_to_string(path)?;
        self._json = Some(json);
        Ok(self)
    }

    pub fn build(self) -> crate::result::Result<Workflow> {
        let json_config = self._json.expect("json config is required");
        let workflow_config: WorkflowConfig = serde_json::from_str(&json_config)?;

        Workflow::from_config(workflow_config)
    }
}
