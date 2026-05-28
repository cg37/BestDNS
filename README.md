# BestDNS

<p align="center">
  <img src="src-tauri/icons/128x128.png" alt="BestDNS Logo" width="128">
</p>

<p align="center">
  <strong>快速测试 DNS 服务器响应速度，一键选择最优 DNS</strong>
</p>

<p align="center">
  <a href="https://github.com/cg37/BestDNS/releases">
    <img src="https://img.shields.io/github/v/release/cg37/BestDNS?style=flat-square" alt="Release">
  </a>
  <a href="https://github.com/cg37/BestDNS/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/cg37/BestDNS/release.yml?style=flat-square" alt="CI">
  </a>
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-blue?style=flat-square" alt="Platform">
</p>

---

## ✨ 功能特性

- 🚀 **一键测速** - 同时测试 12 个主流 DNS 服务器
- 📊 **直观展示** - 彩色延迟标识，快速识别最优 DNS
- 📋 **一键复制** - 快速复制最优 DNS 地址到剪贴板
- 🔄 **实时排序** - 支持按延迟、提供商、地区排序
- 🎨 **现代化 UI** - 使用 Mantine 组件库，简洁美观
- 💻 **跨平台** - 支持 Windows 和 macOS (Intel & Apple Silicon)

## 🖼️ 截图

<p align="center">
  <img src="screenshots/app.png" alt="BestDNS Screenshot" width="800">
</p>

## 📥 下载安装

### macOS

- **Apple Silicon (M1/M2/M3)**: 下载 `BestDNS_x.x.x_aarch64.dmg`
- **Intel Mac**: 下载 `BestDNS_x.x.x_x86_64.dmg`

### Windows

- 下载 `BestDNS_x.x.x_x64-setup.exe` 或 `.msi` 安装包

> 最新版本请前往 [Releases](https://github.com/cg37/BestDNS/releases) 页面下载

## 🏗️ 技术栈

- **前端**: React + TypeScript + Vite
- **桌面框架**: Tauri v2
- **UI 组件库**: Mantine v7
- **图标**: Tabler Icons
- **后端**: Rust
- **DNS 解析**: hickory-resolver

## 🛠️ 开发环境

### 前置要求

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/)
- [pnpm](https://pnpm.io/) 8+

### 本地开发

```bash
# 克隆项目
git clone https://github.com/cg37/BestDNS.git
cd BestDNS

# 安装依赖
pnpm install

# 启动开发服务器
pnpm tauri dev

# 构建生产版本
pnpm tauri build
```

## 📋 支持的 DNS 服务器

| 名称 | 地址 | 地区 | 提供商 |
|------|------|------|--------|
| Google DNS Primary | 8.8.8.8 | Global | Google |
| Google DNS Secondary | 8.8.4.4 | Global | Google |
| Cloudflare Primary | 1.1.1.1 | Global | Cloudflare |
| Cloudflare Secondary | 1.0.0.1 | Global | Cloudflare |
| OpenDNS Primary | 208.67.222.222 | Global | OpenDNS |
| OpenDNS Secondary | 208.67.220.220 | Global | OpenDNS |
| Quad9 | 9.9.9.9 | Global | Quad9 |
| AliDNS | 223.5.5.5 | China | Alibaba |
| AliDNS Secondary | 223.6.6.6 | China | Alibaba |
| DNSPod | 119.29.29.29 | China | Tencent |
| 114 DNS | 114.114.114.114 | China | 114DNS |
| Baidu DNS | 180.76.76.76 | China | Baidu |

## 🚀 发布流程

项目使用 GitHub Actions 自动构建和发布。

### 创建新版本

```bash
# 发布新版本 (自动更新 package.json, tauri.conf.json, Cargo.toml)
pnpm release 1.0.0

# 推送触发 GitHub Actions 构建
git push origin master --tags
```

GitHub Actions 会自动为 Windows 和 macOS 构建安装包，并发布到 Release 页面。

## 📄 许可证

[MIT](LICENSE)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/cg37">cg37</a>
</p>
