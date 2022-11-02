pub fn set_clipboard_content(content: &str) -> crate::result::Result<()> {
    use clipboard::{ClipboardContext, ClipboardProvider};
    let mut ctx: ClipboardContext = ClipboardProvider::new()?;
    ctx.set_contents(content.to_string()).map_err(Into::into)
}

pub fn get_clipboard_contents() -> crate::result::Result<String> {
    use clipboard::{ClipboardContext, ClipboardProvider};
    let mut ctx: ClipboardContext = ClipboardProvider::new()?;
    ctx.get_contents().map_err(Into::into)
}

pub fn generate_uuid() -> String {
    uuid::Uuid::new_v4().to_string()
}

pub fn md5(input: &str) -> String {
    use crypto::digest::Digest;
    use crypto::md5::Md5;
    let mut hasher = Md5::new();
    hasher.input_str(input);
    hasher.result_str()
}

pub fn sha256(input: &str) -> String {
    use crypto::digest::Digest;
    use crypto::sha2::Sha256;
    let mut hasher = Sha256::new();
    hasher.input_str(input);
    hasher.result_str()
}

/// 执行 javascript 脚本
pub fn execute_nodejs(script: &str) -> crate::result::Result<String> {
    use directories::BaseDirs;
    use std::fs;
    if let Some(dir) = BaseDirs::new() {
        let cache_dir = dir.cache_dir();
        let dir = cache_dir.join("workflow");
        fs::create_dir_all(&dir)?;
        let timestamp = chrono::Local::now().timestamp_nanos().to_string();
        let temp_path = dir.join(format!("{}.js", timestamp));
        fs::write(&temp_path, script)?;
        let temp_path_str = temp_path.to_str().unwrap_or_default();
        let output = execute("node", &[temp_path_str])?;
        Ok(output)
    } else {
        Err(crate::error::Error::new("base dirs not found"))
    }
}

pub fn execute(cmd: &str, args: &[&str]) -> crate::result::Result<String> {
    use std::process::Command;
    let mut command = Command::new(cmd);
    command.args(args);
    let output = command.output()?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(output.stdout.as_ref()).to_string())
    } else {
        Err(crate::error::Error::Command {
            status: output.status,
            message: String::from_utf8_lossy(output.stderr.as_ref()).to_string(),
        })
    }
}

/// 模拟键盘输出
pub fn input(s: &str) {
    use enigo::KeyboardControllable;
    enigo::Enigo::new().key_sequence(s);
}

/// 转换成汉语拼音
pub fn zh_to_pinyin(zh: &str) -> String {
    use pinyin::ToPinyin;
    let mut s = String::new();
    for pinyin in zh.to_pinyin().flatten() {
        s.push_str(pinyin.plain());
    }
    s
}

/// 判断是否包含字串
pub fn includes_str(origin: &str, target: &str) -> bool {
    let origin_chars: Vec<_> = origin.chars().collect();
    let target_chars: Vec<_> = target.chars().collect();
    let origin_len = origin_chars.len();
    let target_len = target_chars.len();
    let mut origin_i: usize = 0;
    let mut target_i: usize = 0;
    while target_i < target_len {
        while origin_i < origin_len && origin_chars[origin_i] != target_chars[target_i] {
            origin_i += 1;
        }
        if origin_i > origin_len {
            return false;
        }
        target_i += 1;
        origin_i += 1;
    }
    origin_i <= origin_len
}

/// 模糊查询（支持拼音）
pub fn fuzzy_query(origin: &str, target: &str) -> bool {
    let origin = origin.to_lowercase();
    let target = target.to_lowercase();
    includes_str(&origin, &target) || includes_str(&zh_to_pinyin(&origin), &target)
}

/// 通知
pub fn notify(summary: &str, body: &str) -> crate::Result<()> {
    use notify_rust::Notification;
    Notification::new().summary(summary).body(body).show()?;
    Ok(())
}
