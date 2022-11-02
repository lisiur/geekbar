use std::process::ExitStatus;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("deserialize json error: {}", .0)]
    SerdeJsonError(#[from] serde_json::Error),

    #[error("io error : {}", .0)]
    IOError(#[from] std::io::Error),

    #[error("handlebars render error : {}", .0)]
    RenderError(#[from] handlebars::RenderError),

    #[error("url parse error : {}", .0)]
    UrlError(#[from] url::ParseError),

    #[error("reqwest error : {}", .0)]
    ReqwestError(#[from] reqwest::Error),

    #[error("env var error : {}", .0)]
    VarError(#[from] std::env::VarError),

    #[error("regex error : {}", .0)]
    RegexError(#[from] regex::Error),

    #[error("notify_rust error : {}", .0)]
    NotifyError(#[from] notify_rust::error::Error),

    #[error("receive error : {}", .0)]
    ReceiveError(#[from] std::sync::mpsc::RecvError),

    #[error("command error : [{status}] {message}")]
    Command { status: ExitStatus, message: String },

    #[error("error : {}", .0)]
    Error(String),
}

impl Error {
    pub fn new<T: Into<String>>(msg: T) -> Self {
        Error::Error(msg.into())
    }
}

impl From<Box<dyn std::error::Error>> for Error {
    fn from(err: Box<dyn std::error::Error>) -> Self {
        Error::Error(err.to_string())
    }
}
