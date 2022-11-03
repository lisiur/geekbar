use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub workflows: Vec<Uuid>,
}

impl Config {
    pub fn default() -> Self {
        Self { workflows: vec![] }
    }
}
