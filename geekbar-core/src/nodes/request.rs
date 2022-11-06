use reqwest::{header::HeaderMap, Method, Url};
use std::collections::HashMap;

use super::prelude::*;

const fn _default_timeout() -> u64 {
    60
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Request {
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub method: RequestMethod,
    #[serde(default)]
    pub content_type: RequestContentType,
    #[serde(default)]
    pub body: Value,
    #[serde(default)]
    pub headers: HashMap<String, String>,
    #[serde(default = "_default_timeout")]
    pub timeout: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum RequestMethod {
    Get,
    Post,
    Put,
    Delete,
    Patch,
}

impl Default for RequestMethod {
    fn default() -> Self {
        Self::Get
    }
}

impl Default for RequestContentType {
    fn default() -> Self {
        Self::Json
    }
}

impl From<RequestMethod> for Method {
    fn from(method: RequestMethod) -> Self {
        match method {
            RequestMethod::Get => Method::GET,
            RequestMethod::Post => Method::POST,
            RequestMethod::Put => Method::PUT,
            RequestMethod::Delete => Method::DELETE,
            RequestMethod::Patch => Method::PATCH,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum RequestContentType {
    Form,
    Json,
}

#[typetag::serde(name = "Request")]
impl Node for Request {
    fn execute(&self, mut params: Params) -> Result<Params> {
        let url = params.render_template(&self.url);
        let body = params.render_value(self.body.clone());
        let headers = self
            .headers
            .iter()
            .map(|(k, v)| (k.clone(), params.render_template(v)))
            .collect::<HashMap<String, String>>();
        let headers: HeaderMap = (&headers).try_into().unwrap_or_default();

        let url = Url::parse(&url)?;
        let client = reqwest::blocking::Client::new();
        let res = client
            .request(self.method.clone().into(), url)
            .headers(headers)
            .body(body.to_string())
            .send()?
            .json::<Value>()?;

        params.set_value(res);
        Ok(params)
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}
