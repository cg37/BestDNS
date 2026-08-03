use std::process::Command;
use std::io;

/// 获取 macOS 的网络接口信息（调用 ifconfig）
pub fn get_network_interfaces() -> Result<String, io::Error> {
    let output = Command::new("ifconfig")
        .output()?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(io::Error::new(
            io::ErrorKind::Other,
            format!("ifconfig failed: {}", String::from_utf8_lossy(&output.stderr))
        ))
    }
}
