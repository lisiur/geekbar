use crate::{executor::Work, ListOption};
use geekbar_dialoguer::{
    theme::ColorfulTheme, Confirm, FuzzySelect, Input, MultiSelect, Password, Select,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;

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

pub fn work_handler(mut work: Work) -> Result<Work, String> {
    if let Some(prompt) = work.params.take_prompt() {
        let theme = ColorfulTheme::default();
        let value = match prompt {
            Prompt::Input { text, default } => {
                let default = default.as_ref().map(ToOwned::to_owned).unwrap_or_default();
                let input = Input::with_theme(&theme)
                    .with_prompt(text)
                    .with_initial_text(&default)
                    .interact_text()
                    .unwrap();
                Value::String(input)
            }
            Prompt::Password { text } => {
                let input = Password::with_theme(&theme)
                    .with_prompt(text)
                    .interact()
                    .unwrap();
                Value::String(input)
            }
            Prompt::Select {
                text,
                options,
                default,
            } => {
                let mut dialoguer = Select::with_theme(&theme);
                dialoguer.with_prompt(text);
                dialoguer.items(
                    &options
                        .iter()
                        .map(|o| match &o.description {
                            Some(desc) => format!("{} - {}", o.title, desc),
                            None => o.title.clone(),
                        })
                        .collect::<Vec<_>>(),
                );
                if let Some(default) = default {
                    dialoguer.default(default);
                }
                let input = dialoguer.interact().unwrap();
                options[input].value.clone()
            }
            Prompt::FuzzySelect {
                text,
                options,
                default,
            } => {
                let mut dialoguer = FuzzySelect::with_theme(&theme);
                dialoguer.with_prompt(text);
                dialoguer.items(
                    &options
                        .iter()
                        .map(|o| match &o.description {
                            Some(desc) => format!("{} - {}", o.title, desc),
                            None => o.title.clone(),
                        })
                        .collect::<Vec<_>>(),
                );
                if let Some(default) = default {
                    dialoguer.default(default);
                }
                let input = dialoguer.interact().unwrap();
                options[input].value.clone()
            }
            Prompt::MultiSelect {
                text,
                options,
                default,
            } => {
                let mut dialoguer = MultiSelect::with_theme(&theme);
                dialoguer.with_prompt(text);
                dialoguer.items(
                    &options
                        .iter()
                        .map(|o| match &o.description {
                            Some(desc) => format!("{} - {}", o.title, desc),
                            None => o.title.clone(),
                        })
                        .collect::<Vec<_>>(),
                );
                if let Some(default) = default {
                    let defaults = options
                        .iter()
                        .enumerate()
                        .map(|(i, _)| default.contains(&i))
                        .collect::<Vec<bool>>();
                    dialoguer.defaults(&defaults);
                }
                let input = dialoguer.interact().unwrap();
                let value = input
                    .into_iter()
                    .map(|i| options[i].value.clone())
                    .collect::<Vec<Value>>();
                Value::Array(value)
            }
            Prompt::Confirm { text, default } => {
                let mut dialoguer = Confirm::with_theme(&theme);
                dialoguer.with_prompt(text);
                if let Some(default) = default {
                    dialoguer.default(default);
                }
                let input = dialoguer.interact().unwrap();
                Value::Bool(input)
            }
        };
        work.resolve_value(value);
    }
    Ok(work)
}
