use super::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct OpenUrl {
    url: String,
}

#[typetag::serde(name = "OpenUrl")]
impl Node for OpenUrl {
    fn execute(&self, params: Params) -> crate::result::Result<Params> {
        let url = params.render_template(&self.url);
        open::that(&url)?;
        Ok(params)
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}
