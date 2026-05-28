import { useState, useEffect, useCallback } from "react";

// Status Icons - Flat Design
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

// Status Icons - Flat Design
const StatusSuccess = () => (
  <svg className="status-icon success" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="#34C759" strokeWidth="1.5"/>
    <path d="M6 10L9 13L14 7" stroke="#34C759" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StatusError = () => (
  <svg className="status-icon error" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="#FF3B30" strokeWidth="1.5"/>
    <path d="M7 7L13 13M13 7L7 13" stroke="#FF3B30" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const StatusPending = () => (
  <svg className="status-icon pending" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke="#8E8E93" strokeWidth="1.5"/>
    <circle cx="10" cy="10" r="2" fill="#8E8E93"/>
  </svg>
);

const CopyIcon = () => (
  <svg className="copy-icon" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="3" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="6" y="6" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="check-icon" viewBox="0 0 16 16" fill="none">
    <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrophyIcon = () => (
  <svg className="trophy-icon" viewBox="0 0 20 20" fill="none">
    <path d="M5 4H15M5 4C5 4 4 8 7 10M5 4V6M15 4C15 4 16 8 13 10M15 4V6M7 10V15L10 17L13 15V10M7 10H13" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RocketIcon = () => (
  <svg className="rocket-icon" viewBox="0 0 20 20" fill="none">
    <path d="M10 2C10 2 14 6 14 11C14 13 13 15 13 15L10 12L7 15C7 15 6 13 6 11C6 6 10 2 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="9" r="1.5" fill="currentColor"/>
    <path d="M7 15L6 18L10 16L14 18L13 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface DnsServer {
  name: string;
  address: string;
  location: string;
  provider: string;
}

interface DnsResult {
  server: DnsServer;
  latency_ms: number | null;
  success: boolean;
  error: string | null;
}

function App() {
  const [results, setResults] = useState<DnsResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sortBy, setSortBy] = useState<"latency" | "provider" | "location">("latency");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [hasTested, setHasTested] = useState(false);

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const fetchDnsList = useCallback(async () => {
    try {
      const list: DnsServer[] = await invoke("get_dns_list");
      setResults(
        list.map((server) => ({
          server,
          latency_ms: null,
          success: false,
          error: null,
        }))
      );
    } catch (e) {
      console.error("Failed to fetch DNS list:", e);
    }
  }, []);

  useEffect(() => {
    fetchDnsList();
  }, [fetchDnsList]);

  // 模拟进度动画 - 10秒左右完成，带随机波动
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTesting) {
      setProgress(0);
      const baseIncrement = 0.9; // 基础增量

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          // 基础增量 + 随机波动 (-0.3 到 +0.6)
          const randomFactor = (Math.random() - 0.3) * 0.9;
          const actualIncrement = Math.max(0.3, baseIncrement + randomFactor);
          return Math.min(prev + actualIncrement, 90);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTesting]);

  const testAll = async () => {
    setIsTesting(true);
    try {
      const testResults: DnsResult[] = await invoke("test_all_dns");
      setResults(testResults);
      setHasTested(true);
    } catch (e) {
      console.error("Test failed:", e);
    }
    setIsTesting(false);
    setProgress(100);
  };

  const getLatencyColor = (latency: number | null) => {
    if (latency === null) return "gray";
    if (latency < 50) return "#4caf50";
    if (latency < 100) return "#8bc34a";
    if (latency < 200) return "#ff9800";
    return "#f44336";
  };

  const getLatencyText = (latency: number | null) => {
    if (latency === null) return "未测试";
    return `${latency}ms`;
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "latency":
        if (a.latency_ms === null) return 1;
        if (b.latency_ms === null) return -1;
        return a.latency_ms - b.latency_ms;
      case "provider":
        return a.server.provider.localeCompare(b.server.provider);
      case "location":
        return a.server.location.localeCompare(b.server.location);
      default:
        return 0;
    }
  });

  const fastest = results
    .filter((r) => r.latency_ms !== null)
    .sort((a, b) => (a.latency_ms || Infinity) - (b.latency_ms || Infinity))[0];

  return (
    <main className="container">
      <div className="content">
        <header className="header">
          <h1>🌐 BestDNS - DNS 测速工具</h1>
          <p>测试常见 DNS 服务器的响应速度，选择最快的 DNS</p>
        </header>

        <div className="controls">
          <button
            className="test-btn"
            onClick={testAll}
            disabled={isTesting}
          >
            {isTesting ? "测试中..." : <><RocketIcon /> 开始测速</>}
          </button>

          <div className="sort-control">
            <label>排序:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="latency">按延迟</option>
              <option value="provider">按提供商</option>
              <option value="location">按地区</option>
            </select>
          </div>
        </div>

        {isTesting && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        {hasTested && fastest && (
          <div className="fastest-banner">
            <TrophyIcon /> <span>最快:</span> <strong>{fastest.server.name}</strong>
            <span className="fastest-address-group">
              <span className="address-text">{fastest.server.address}</span>
              <button
                className={`copy-btn-inline ${copiedAddress === fastest.server.address ? "copied" : ""}`}
                onClick={() => copyToClipboard(fastest.server.address)}
                title="复制地址"
              >
                {copiedAddress === fastest.server.address ? <><CheckIcon /> 已复制</> : <><CopyIcon /> 复制</>}
              </button>
            </span>
            <span style={{ color: getLatencyColor(fastest.latency_ms) }}>
              {getLatencyText(fastest.latency_ms)}
            </span>
          </div>
        )}

        {!hasTested && (
          <div className="empty-state">
            <p>点击上方按钮开始 DNS 测速</p>
          </div>
        )}

        <div className="dns-list">
          <div className="dns-header">
            <span>状态</span>
            <span>DNS 服务器</span>
            <span>地址</span>
            <span>提供商</span>
            <span>地区</span>
            <span>延迟</span>
          </div>

          {sortedResults.map((result, index) => (
            <div
              key={result.server.address}
              className={`dns-item ${result.success ? "success" : ""} ${
                fastest?.server.address === result.server.address ? "fastest" : ""
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="status">
                {result.success ? <StatusSuccess /> : result.error ? <StatusError /> : <StatusPending />}
              </span>
              <span className="name">{result.server.name}</span>
              <span className="address-cell">
                <span className="address-text">{result.server.address}</span>
                <button
                  className={`copy-btn ${copiedAddress === result.server.address ? "copied" : ""}`}
                  onClick={() => copyToClipboard(result.server.address)}
                  title="复制地址"
                >
                  {copiedAddress === result.server.address ? <CheckIcon /> : <CopyIcon />}
                </button>
              </span>
              <span className="provider">{result.server.provider}</span>
              <span className="location">{result.server.location}</span>
              <span
                className="latency"
                style={{ color: getLatencyColor(result.latency_ms) }}
              >
                {result.error ? (
                  <span className="error" title={result.error}>
                    超时
                  </span>
                ) : (
                  getLatencyText(result.latency_ms)
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="legend">
          <h3>延迟说明</h3>
          <div className="legend-items">
            <span className="legend-item">
              <span className="dot" style={{ background: "#4caf50" }} />
              &lt; 50ms 优秀
            </span>
            <span className="legend-item">
              <span className="dot" style={{ background: "#8bc34a" }} />
              50-100ms 良好
            </span>
            <span className="legend-item">
              <span className="dot" style={{ background: "#ff9800" }} />
              100-200ms 一般
            </span>
            <span className="legend-item">
              <span className="dot" style={{ background: "#f44336" }} />
              &gt; 200ms 较慢
            </span>
          </div>
        </div>

        <footer className="footer">
          <p>测试域名: www.baidu.com | 超时时间: 3秒</p>
        </footer>
      </div>
    </main>
  );
}

export default App;
