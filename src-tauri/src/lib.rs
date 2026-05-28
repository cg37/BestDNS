use hickory_resolver::config::{ResolverConfig, ResolverOpts};
use hickory_resolver::TokioAsyncResolver;
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::str::FromStr;
use std::time::{Duration, Instant};
use tokio::time::timeout;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DnsServer {
    pub name: String,
    pub address: String,
    pub location: String,
    pub provider: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DnsResult {
    pub server: DnsServer,
    pub latency_ms: Option<u32>,
    pub success: bool,
    pub error: Option<String>,
}

fn get_common_dns_servers() -> Vec<DnsServer> {
    vec![
        DnsServer {
            name: "Google DNS Primary".to_string(),
            address: "8.8.8.8".to_string(),
            location: "Global".to_string(),
            provider: "Google".to_string(),
        },
        DnsServer {
            name: "Google DNS Secondary".to_string(),
            address: "8.8.4.4".to_string(),
            location: "Global".to_string(),
            provider: "Google".to_string(),
        },
        DnsServer {
            name: "Cloudflare Primary".to_string(),
            address: "1.1.1.1".to_string(),
            location: "Global".to_string(),
            provider: "Cloudflare".to_string(),
        },
        DnsServer {
            name: "Cloudflare Secondary".to_string(),
            address: "1.0.0.1".to_string(),
            location: "Global".to_string(),
            provider: "Cloudflare".to_string(),
        },
        DnsServer {
            name: "OpenDNS Primary".to_string(),
            address: "208.67.222.222".to_string(),
            location: "Global".to_string(),
            provider: "OpenDNS".to_string(),
        },
        DnsServer {
            name: "OpenDNS Secondary".to_string(),
            address: "208.67.220.220".to_string(),
            location: "Global".to_string(),
            provider: "OpenDNS".to_string(),
        },
        DnsServer {
            name: "Quad9".to_string(),
            address: "9.9.9.9".to_string(),
            location: "Global".to_string(),
            provider: "Quad9".to_string(),
        },
        DnsServer {
            name: "AliDNS".to_string(),
            address: "223.5.5.5".to_string(),
            location: "China".to_string(),
            provider: "Alibaba".to_string(),
        },
        DnsServer {
            name: "AliDNS Secondary".to_string(),
            address: "223.6.6.6".to_string(),
            location: "China".to_string(),
            provider: "Alibaba".to_string(),
        },
        DnsServer {
            name: "DNSPod".to_string(),
            address: "119.29.29.29".to_string(),
            location: "China".to_string(),
            provider: "Tencent".to_string(),
        },
        DnsServer {
            name: "114 DNS".to_string(),
            address: "114.114.114.114".to_string(),
            location: "China".to_string(),
            provider: "114DNS".to_string(),
        },
        DnsServer {
            name: "Baidu DNS".to_string(),
            address: "180.76.76.76".to_string(),
            location: "China".to_string(),
            provider: "Baidu".to_string(),
        },
    ]
}

async fn test_dns_server(server: &DnsServer) -> DnsResult {
    let socket_addr = match SocketAddr::from_str(&format!("{}:53", server.address)) {
        Ok(addr) => addr,
        Err(e) => {
            return DnsResult {
                server: server.clone(),
                latency_ms: None,
                success: false,
                error: Some(format!("Invalid address: {}", e)),
            };
        }
    };

    let mut config = ResolverConfig::new();
    config.add_name_server(hickory_resolver::config::NameServerConfig {
        socket_addr,
        protocol: hickory_resolver::config::Protocol::Udp,
        tls_dns_name: None,
        trust_negative_responses: false,
        bind_addr: None,
    });

    let mut opts = ResolverOpts::default();
    opts.timeout = Duration::from_secs(3);
    opts.attempts = 1;

    let resolver = TokioAsyncResolver::tokio(config, opts);

    let start = Instant::now();
    let test_domain = "www.baidu.com";

    match timeout(Duration::from_secs(3), resolver.lookup_ip(test_domain)).await {
        Ok(Ok(_)) => {
            let elapsed = start.elapsed();
            DnsResult {
                server: server.clone(),
                latency_ms: Some(elapsed.as_millis() as u32),
                success: true,
                error: None,
            }
        }
        Ok(Err(e)) => DnsResult {
            server: server.clone(),
            latency_ms: None,
            success: false,
            error: Some(format!("DNS query failed: {}", e)),
        },
        Err(_) => DnsResult {
            server: server.clone(),
            latency_ms: None,
            success: false,
            error: Some("Timeout".to_string()),
        },
    }
}

#[tauri::command]
async fn get_dns_list() -> Result<Vec<DnsServer>, String> {
    Ok(get_common_dns_servers())
}

#[tauri::command]
async fn test_all_dns() -> Result<Vec<DnsResult>, String> {
    let servers = get_common_dns_servers();
    let mut results = Vec::new();

    for server in servers {
        let result = test_dns_server(&server).await;
        results.push(result);
    }

    Ok(results)
}

#[tauri::command]
async fn test_single_dns(address: String) -> Result<DnsResult, String> {
    let server = DnsServer {
        name: format!("Custom ({}", address),
        address,
        location: "Unknown".to_string(),
        provider: "Custom".to_string(),
    };
    Ok(test_dns_server(&server).await)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_dns_list, test_all_dns, test_single_dns])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
