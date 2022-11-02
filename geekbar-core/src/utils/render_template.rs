use chrono::Local;
use chrono::{Datelike, Duration};
use handlebars::{no_escape, Context, Handlebars, Helper, HelperResult, Output, RenderContext};
use std::ops::{Add, Sub};

use crate::params::Params;

/// 渲染模板
pub fn render_template(template: &str, data: &Params) -> String {
    let vars = data.get_vars();
    let query = data.get_value();

    let mut reg = Handlebars::new();
    reg.register_escape_fn(no_escape);

    register_helper(&mut reg, "query", || {
        query.as_str().map(|s| s.to_string()).unwrap_or_default()
    });

    register_helper(&mut reg, "date", || {
        Local::now().format("%Y-%m-%d").to_string()
    });
    register_helper(&mut reg, "year", || Local::now().format("%Y").to_string());
    register_helper(&mut reg, "month", || Local::now().format("%m").to_string());
    register_helper(&mut reg, "day", || Local::now().format("%d").to_string());
    register_helper(&mut reg, "weekday", || {
        Local::now().format("%u").to_string()
    });
    register_helper(&mut reg, "weekstart", || {
        let now = Local::now();
        now.sub(Duration::days(
            now.weekday().number_from_monday() as i64 - 1,
        ))
        .format("%Y-%m-%d")
        .to_string()
    });
    register_helper(&mut reg, "weekend", || {
        let now = Local::now();
        now.add(Duration::days(
            7 - now.weekday().number_from_monday() as i64,
        ))
        .format("%Y-%m-%d")
        .to_string()
    });
    register_helper(&mut reg, "time", || {
        Local::now().format("%H-%M-%S").to_string()
    });
    register_helper(&mut reg, "hour", || Local::now().format("%H").to_string());
    register_helper(&mut reg, "minute", || Local::now().format("%M").to_string());
    register_helper(&mut reg, "second", || Local::now().format("%S").to_string());
    register_helper(&mut reg, "timestamp", || {
        Local::now().format("%s").to_string()
    });
    register_helper(&mut reg, "clipboard", || {
        crate::utils::get_clipboard_contents().unwrap_or_default()
    });
    register_helper(&mut reg, "uuid", crate::utils::generate_uuid);
    log::debug!("render_template template: {}", template);
    reg.render_template(template, vars).unwrap_or_default()
}

fn register_helper<'a>(
    reg: &mut Handlebars<'a>,
    key: &str,
    value: impl (Fn() -> String) + Send + Sync + 'a,
) {
    reg.register_helper(
        key,
        Box::new(
            move |_h: &Helper,
                  _r: &Handlebars,
                  _: &Context,
                  _rc: &mut RenderContext,
                  out: &mut dyn Output|
                  -> HelperResult {
                out.write(&value())?;
                Ok(())
            },
        ),
    );
}
