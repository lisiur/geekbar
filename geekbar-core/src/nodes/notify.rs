use super::prelude::*;
use crate::utils;

#[derive(Serialize, Deserialize, Debug)]
pub struct Notify {
    #[serde(default)]
    summary: String,
    #[serde(default)]
    body: String,
}

#[typetag::serde(name = "Notify")]
impl Node for Notify {
    fn execute(&self, params: Params) -> crate::result::Result<Params> {
        let summary = params.render_template(&self.summary);
        let body = params.render_template(&self.body);
        utils::notify(&summary, &body)?;
        Ok(params)
    }

    fn as_any(&self) -> &dyn Any {
        self
    }
}
