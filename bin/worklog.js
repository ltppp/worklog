#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const CLAUDE_COMMANDS_DIR = path.join(os.homedir(), '.claude', 'commands', 'worklog');

// 简单的彩色输出
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// 解析命令行参数
const args = process.argv.slice(2);
const command = args[0];
const targetPath = args[1];
const force = args.includes('-f') || args.includes('--force');

// 帮助信息
function showHelp() {
  console.log(`
${colors.cyan('worklog')} - 极简的个人工作管理知识库

${colors.blue('用法:')}
  worklog init [path]    初始化知识库
  worklog update         更新已安装的技能
  worklog --help         显示帮助
  worklog --version      显示版本

${colors.blue('示例:')}
  worklog init ~/projects/my-worklog
  worklog init .         在当前目录初始化
  worklog update         更新技能

${colors.blue('命令:')}
  /worklog:log           写日报
  /worklog:note xxx      快速笔记
  /worklog:project       同步项目
  /worklog:summarize     整理笔记
`);
}

// 版本信息
function showVersion() {
  const pkg = require('../package.json');
  console.log(pkg.version);
}

// 安装技能
function installSkills(vaultPath) {
  // 确保目录存在
  if (!fs.existsSync(CLAUDE_COMMANDS_DIR)) {
    fs.mkdirSync(CLAUDE_COMMANDS_DIR, { recursive: true });
  }

  const skills = ['log', 'project', 'note', 'summarize'];

  for (const skill of skills) {
    const templatePath = path.join(TEMPLATES_DIR, `${skill}.md`);
    const targetPath = path.join(CLAUDE_COMMANDS_DIR, `${skill}.md`);

    let content = fs.readFileSync(templatePath, 'utf-8');
    // 替换 VAULT_PATH 占位符
    content = content.replace(/{{VAULT_PATH}}/g, vaultPath);

    fs.writeFileSync(targetPath, content);
    console.log(colors.green(`  ✓ worklog:${skill}`));
  }
}

// 查找知识库路径
function findVaultPath() {
  // 1. 检查当前目录是否有 worklog 结构
  let currentDir = process.cwd();
  const dirs = ['日记', '项目', '资源', '画布'];

  while (currentDir !== path.dirname(currentDir)) {
    const hasWorklog = dirs.every(dir => fs.existsSync(path.join(currentDir, dir)));
    if (hasWorklog) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  // 2. 从已安装的技能文件中读取 VAULT_PATH
  const logPath = path.join(CLAUDE_COMMANDS_DIR, 'log.md');
  if (fs.existsSync(logPath)) {
    const content = fs.readFileSync(logPath, 'utf-8');
    const match = content.match(/VAULT_PATH\s*=\s*["']([^"']+)["']/);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// init 命令
function init(vaultPath) {
  console.log(colors.blue('\n📁 初始化 worklog 知识库\n'));
  console.log(colors.gray(`目标路径: ${vaultPath}\n`));

  // 1. 创建目录结构
  const dirs = ['日记', '项目', '资源', '画布'];
  for (const dir of dirs) {
    const dirPath = path.join(vaultPath, dir);
    if (fs.existsSync(dirPath) && !force) {
      console.log(colors.gray(`  ○ ${dir}/ (已存在)`));
    } else {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      console.log(colors.green(`  ✓ ${dir}/`));
    }
  }

  // 2. 创建 CLAUDE.md
  const claudeMdPath = path.join(vaultPath, 'CLAUDE.md');
  if (fs.existsSync(claudeMdPath) && !force) {
    console.log(colors.gray(`  ○ CLAUDE.md (已存在)`));
  } else {
    const claudeMdTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'CLAUDE.md'), 'utf-8');
    fs.writeFileSync(claudeMdPath, claudeMdTemplate);
    console.log(colors.green(`  ✓ CLAUDE.md`));
  }

  // 3. 安装技能
  console.log(colors.blue('\n📦 安装技能到 Claude Code\n'));
  installSkills(vaultPath);

  // 4. 创建今日日记
  const today = new Date().toISOString().split('T')[0];
  const diaryPath = path.join(vaultPath, '日记', `${today}.md`);
  if (!fs.existsSync(diaryPath)) {
    const diaryTemplate = `# ${today}

## 今天要做的
- [ ]

## 工作记录

## 笔记

## 明天继续
`;
    fs.writeFileSync(diaryPath, diaryTemplate);
    console.log(colors.green(`  ✓ 日记/${today}.md`));
  }

  // 5. 完成
  console.log(colors.green('\n✨ 初始化完成！\n'));
  console.log(colors.gray('开始使用：'));
  console.log(colors.cyan('  /worklog:log         写日报'));
  console.log(colors.cyan('  /worklog:note xxx    快速笔记'));
  console.log(colors.cyan('  /worklog:project     同步项目'));
  console.log(colors.cyan('  /worklog:summarize   整理笔记'));
  console.log();
}

// update 命令
function update() {
  console.log(colors.blue('\n📦 更新 worklog 技能\n'));

  const vaultPath = findVaultPath();
  if (!vaultPath) {
    console.log(colors.red('错误: 未找到 worklog 知识库'));
    console.log(colors.gray('请在知识库目录运行此命令，或先运行 worklog init'));
    process.exit(1);
  }

  installSkills(vaultPath);
  console.log(colors.green('\n✨ 更新完成！\n'));
}

// 主逻辑
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
} else if (args.includes('--version') || args.includes('-v')) {
  showVersion();
} else if (command === 'init') {
  const vaultPath = targetPath ? path.resolve(targetPath) : process.cwd();
  init(vaultPath);
} else if (command === 'update') {
  update();
} else {
  showHelp();
}