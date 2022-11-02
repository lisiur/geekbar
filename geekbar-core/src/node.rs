use std::any::Any;
use std::fmt::Debug;

use crate::params::Params;

#[typetag::serde(tag = "type", content = "config")]
pub trait Node: Debug + Send + Sync {
    fn execute(&self, params: Params) -> crate::result::Result<Params>;
    fn as_any(&self) -> &dyn Any;
}
