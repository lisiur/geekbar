use super::prelude::*;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
pub enum Trigger {
    Keyword {
        #[serde(default)]
        keyword: String,
        #[serde(default)]
        title: String,
    },
    Shortcut {
        #[serde(default)]
        keys: Vec<String>,
        #[serde(default)]
        title: String,
    },
}

#[typetag::serde(name = "Trigger")]
impl Node for Trigger {
    fn execute(&self, params: Params) -> Result<Params> {
        Ok(params)
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}

impl Trigger {
    pub fn id(&self) -> String {
        match self {
            Trigger::Keyword { keyword, .. } => keyword.clone(),
            Trigger::Shortcut { keys, .. } => {
                let mut keys = keys.clone();
                keys.sort_unstable_by(|a, b| {
                    // Sort by length from long to short first.
                    // To make sure that the modifier keys are at the beginning.
                    let length_test = b.len().cmp(&a.len());
                    // If same length, sort in alphabetical order.
                    if length_test == std::cmp::Ordering::Equal {
                        return a.cmp(b);
                    }
                    length_test
                });
                keys.join("+")
            }
        }
    }
    pub fn title(&self) -> &str {
        match self {
            Trigger::Keyword { title, .. } => title,
            Trigger::Shortcut { title, .. } => title,
        }
    }
}
