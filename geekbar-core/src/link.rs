use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
pub struct Link {
    pub from: Uuid,
    pub to: Uuid,
    pub condition: Option<Condition>,
    pub modifiers: Option<Vec<Modifier>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum Modifier {
    Ctrl,
    Alt,
    Shift,
    Meta,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
pub enum Condition {
    And(AndCondition),
    Or(OrCondition),
    Value(ValueCondition),
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AndCondition {
    #[allow(dead_code)]
    conditions: Vec<Condition>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct OrCondition {
    #[allow(dead_code)]
    conditions: Vec<Condition>,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum ValueCondition {
    Eq(serde_json::Value),
    Gt(serde_json::Value),
    Ge(serde_json::Value),
    Lt(serde_json::Value),
    Le(serde_json::Value),
    Match(serde_json::Value),
    Between(serde_json::Value),
    In(serde_json::Value),
    Includes(serde_json::Value),
    NonNull,
    Nullable,
}
