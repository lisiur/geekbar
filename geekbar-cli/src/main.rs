use dialoguer::{theme::ColorfulTheme, Confirm, FuzzySelect, Input, MultiSelect, Password, Select};
use geekbar_core::{
    executor::{Executor, Work},
    prompt::Prompt,
    workflow::WorkflowBuilder,
};
use serde_json::Value;
use std::{
    sync::{Arc, Mutex},
    thread,
};

fn main() -> anyhow::Result<()> {
    let works_executor = Arc::new(Mutex::new(Executor::default()));

    let receiver = works_executor.lock().unwrap().receiver().clone();
    let executor = works_executor.clone();
    let handle = thread::spawn(move || {
        while let Ok(work) = receiver.recv() {
            let work = work_handler(work).unwrap();
            executor.lock().unwrap().receive_work(work, None).unwrap();
        }
    });

    let workflow = WorkflowBuilder::default()
        .json(include_str!("workflow.json"))
        .build()?;

    works_executor
        .lock()
        .unwrap()
        .add_workflow(Arc::new(workflow));

    let args = std::env::args().collect::<Vec<String>>();
    let keyword = args.get(1).expect("please input keyword");
    let params = args.get(2);

    works_executor.lock().unwrap().trigger(keyword, params)?;

    handle.join().unwrap();

    Ok(())
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
