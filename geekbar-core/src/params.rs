use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

use crate::prompt::Prompt;

pub type Context = HashMap<String, Value>;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Params {
    inner: Value,
    pub context: Context,
    pub prompt: Option<Prompt>,
}

impl Default for Params {
    fn default() -> Self {
        Self {
            context: Default::default(),
            inner: Value::Null,
            prompt: None,
        }
    }
}

impl Params {
    pub fn new(value: Value) -> Params {
        Params {
            context: Context::new(),
            inner: value,
            prompt: None,
        }
    }

    pub fn set_var(&mut self, key: &str, value: Value) {
        self.context.insert(key.to_string(), value);
    }

    pub fn get_var(&self, key: &str) -> Option<&Value> {
        self.context.get(key)
    }

    pub fn get_vars(&self) -> &HashMap<String, Value> {
        &self.context
    }

    pub fn get_value(&self) -> &Value {
        &self.inner
    }

    pub fn get_value_mut(&mut self) -> &mut Value {
        &mut self.inner
    }

    pub fn set_value(&mut self, value: Value) {
        self.inner = value;
    }

    pub fn set_value_str(&mut self, str: impl Into<String>) {
        self.inner = Value::String(str.into());
    }

    pub fn set_prompt(&mut self, prompt: Prompt) {
        self.prompt = Some(prompt);
    }

    pub fn take_prompt(&mut self) -> Option<Prompt> {
        self.prompt.take()
    }

    pub fn render_value(&self, value: Value) -> Value {
        match value {
            Value::String(s) => Value::String(self.render_template(&s)),
            Value::Object(o) => o
                .into_iter()
                .map(|(key, val)| (key, self.render_value(val)))
                .collect(),
            Value::Array(a) => a.into_iter().map(|val| self.render_value(val)).collect(),
            Value::Bool(..) | Value::Number(..) | Value::Null => value,
        }
    }

    pub fn render_template(&self, template: &str) -> String {
        crate::utils::render_template(template, self)
    }
}
