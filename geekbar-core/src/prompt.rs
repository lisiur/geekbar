use crate::ListOption;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "config")]
pub enum Prompt {
    Input {
        text: String,
        default: Option<String>,
    },
    Password {
        text: String,
    },
    Select {
        text: String,
        options: Vec<ListOption>,
        default: Option<usize>,
    },
    FuzzySelect {
        text: String,
        options: Vec<ListOption>,
        default: Option<usize>,
    },
    MultiSelect {
        text: String,
        options: Vec<ListOption>,
        default: Option<Vec<usize>>,
    },
    Confirm {
        text: String,
        default: Option<bool>,
    },
}
