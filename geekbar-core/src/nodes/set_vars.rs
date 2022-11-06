use std::collections::HashMap;

use super::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct SetVars {
    #[serde(default)]
    vars: HashMap<String, Value>,
}

#[typetag::serde(name = "SetVars")]
impl Node for SetVars {
    fn execute(&self, _params: Params) -> Result<Params> {
        unimplemented!()
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}
