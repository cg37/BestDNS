#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const version = process.argv[2];

if (!version) {
  console.error('❌ 请提供版本号');
  console.error('用法: node scripts/release.js <version>');
  console.error('示例: node scripts/release.js 1.2.3');
  process.exit(1);
}

// 验证版本号格式 (semver)
const semverRegex = /^\d+\.\d+\.\d+$/;
if (!semverRegex.test(version)) {
  console.error('❌ 版本号格式不正确，请使用语义化版本格式：x.x.x');
  console.error('示例: 1.0.0, 1.2.3, 2.0.0');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');

// 文件路径
const packageJsonPath = path.join(rootDir, 'package.json');
const tauriConfPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
const cargoTomlPath = path.join(rootDir, 'src-tauri', 'Cargo.toml');

try {
  // 1. 更新 package.json
  console.log(`📦 更新 package.json -> ${version}`);
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  pkg.version = version;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');

  // 2. 更新 tauri.conf.json
  console.log(`📦 更新 tauri.conf.json -> ${version}`);
  const tauri = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
  tauri.version = version;
  fs.writeFileSync(tauriConfPath, JSON.stringify(tauri, null, 2) + '\n');

  // 3. 更新 Cargo.toml
  console.log(`📦 更新 Cargo.toml -> ${version}`);
  let cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
  cargoToml = cargoToml.replace(
    /^version = ".*"$/m,
    `version = "${version}"`
  );
  fs.writeFileSync(cargoTomlPath, cargoToml);

  // 4. Git 操作
  console.log('📝 提交更改...');
  execSync('git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml', {
    cwd: rootDir,
    stdio: 'inherit'
  });

  console.log('💾 创建 commit...');
  execSync(`git commit -m "chore: release v${version}"`, {
    cwd: rootDir,
    stdio: 'inherit'
  });

  console.log('🏷️  创建 tag...');
  execSync(`git tag v${version}`, {
    cwd: rootDir,
    stdio: 'inherit'
  });

  console.log('');
  console.log('✅ 发布成功！');
  console.log(`版本: v${version}`);
  console.log('');
  console.log('推送命令:');
  console.log(`  git push origin main`);
  console.log(`  git push origin v${version}`);
  console.log('');
  console.log('或合并为一条:');
  console.log(`  git push origin main --tags`);

} catch (error) {
  console.error('❌ 发布失败:', error.message);
  process.exit(1);
}
