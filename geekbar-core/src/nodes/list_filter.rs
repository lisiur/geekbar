use super::prelude::*;
use crate::utils;

#[derive(Serialize, Deserialize, Debug)]
pub struct ListFilter {
    pub title: Option<String>,
    pub options: Vec<ListOption>,
    #[serde(default)]
    pub need_args: NeedArgs,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ListOption {
    pub title: String,
    pub value: Value,
    pub description: Option<String>,
    pub mark: Option<ListOptionMark>,
}

impl ListOption {
    pub fn render(&self, params: &Params) -> Self {
        let title = params.render_template(&self.title);
        let value = params.render_value(self.value.clone());
        let description = self
            .description
            .as_ref()
            .map(|desc| params.render_template(desc));
        Self {
            title,
            value,
            description,
            mark: self.mark.clone(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ListOptionMark {
    Hint,
    Error,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum NeedArgs {
    Always,
    Optional,
    Never,
}

impl Default for NeedArgs {
    fn default() -> Self {
        NeedArgs::Never
    }
}

impl NeedArgs {
    pub fn is_always(&self) -> bool {
        matches!(self, NeedArgs::Always)
    }
    pub fn is_optional(&self) -> bool {
        matches!(self, NeedArgs::Optional)
    }
    pub fn is_never(&self) -> bool {
        matches!(self, NeedArgs::Never)
    }
}

#[typetag::serde(name = "ListFilter")]
impl Node for ListFilter {
    fn execute(&self, mut params: Params) -> crate::result::Result<Params> {
        let search = params.get_value().as_str().unwrap_or_default();
        let options = match self.need_args {
            NeedArgs::Never => self
                .options
                .iter()
                .filter(|option| utils::fuzzy_query(&option.title, search))
                .map(|opt| opt.render(&params))
                .collect::<Vec<_>>(),
            NeedArgs::Optional => {
                if search.is_empty() {
                    self.options
                        .iter()
                        .map(|opt| opt.render(&params))
                        .collect::<Vec<_>>()
                } else {
                    self.options
                        .iter()
                        .filter(|option| utils::fuzzy_query(&option.title, search))
                        .map(|opt| opt.render(&params))
                        .collect::<Vec<_>>()
                }
            }
            NeedArgs::Always => {
                if search.is_empty() {
                    vec![ListOption {
                        // TODO: config by user
                        title: "Please input keyword".to_string(),
                        value: Value::Null,
                        description: None,
                        mark: Some(ListOptionMark::Hint),
                    }]
                } else {
                    self.options
                        .iter()
                        .map(|opt| opt.render(&params))
                        .collect::<Vec<_>>()
                }
            }
        };

        let prompt = match self.need_args {
            NeedArgs::Always | NeedArgs::Optional => Prompt::Select {
                text: self.title.clone().unwrap_or_default(),
                options,
                default: Some(0),
            },
            NeedArgs::Never => Prompt::FuzzySelect {
                text: self.title.clone().unwrap_or_default(),
                options,
                default: Some(0),
            },
        };
        params.set_prompt(prompt);
        Ok(params)
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}
