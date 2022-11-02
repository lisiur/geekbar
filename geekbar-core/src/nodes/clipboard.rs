use super::prelude::*;
use crate::utils;

#[derive(Serialize, Deserialize, Debug)]
pub struct Clipboard {
    pub content: String,
}

#[typetag::serde(name = "Clipboard")]
impl Node for Clipboard {
    fn execute(&self, mut params: Params) -> crate::result::Result<Params> {
        let content = params.render_template(&self.content);
        utils::set_clipboard_content(&content)?;
        params.set_value_str(content);
        Ok(params)
    }

    fn as_any(&self) -> &dyn Any {
        self
    }
}
