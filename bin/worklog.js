#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// 简单的彩色输出
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`
};

// 工具配置
const TOOLS = {
  claude: {
    name: 'Claude Code',
    getSkillsDir: (vaultPath) => path.join(os.homedir(), '.claude', 'commands', 'worklog'),
    getFilename: (id) => `${id}.md`,
    formatFrontmatter: (id, desc) => `---
name: worklog:${id}
description: "${desc}"
---`
  },
  codex: {
    name: 'Codex',
    getSkillsDir: (vaultPath) => {
      const codexHome = process.env.CODEX_HOME?.trim() || path.join(os.homedir(), '.codex');
      return path.join(codexHome, 'prompts');
    },
    getFilename: (id) => `worklog-${id}.md`,
    formatFrontmatter: (id, desc) => `---
description: ${desc}
argument-hint: command arguments
---`
  },
  cursor: {
    name: 'Cursor',
    getSkillsDir: (vaultPath) => path.join(vaultPath, '.cursor', 'commands'),
    getFilename: (id) => `worklog-${id}.md`,
    formatFrontmatter: (id, desc) => `---
name: /worklog-${id}
id: worklog-${id}
category: Worklog
description: "${desc}"
---`
  }
};

// 技能列表
const SKILLS = [
  { id: 'log', desc: '写日报' },
  { id: 'project', desc: '同步项目文档' },
  { id: 'note', desc: '快速笔记' },
  { id: 'summarize', desc: '整理本周笔记到资源' }
];

// 解析命令行参数
const args = process.argv.slice(2);
const command = args[0];
const targetPath = args[1];
const force = args.includes('-f') || args.includes('--force');

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提问函数
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

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

${colors.blue('支持的 AI 工具:')}
  Claude Code, Codex, Cursor

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

// 交互式选择工具
async function selectTools() {
  const toolIds = ['claude', 'codex', 'cursor'];

  console.log(colors.blue('\n🤖 选择要安装的 AI 工具\n'));
  console.log(colors.gray('输入 y 确认安装，n 跳过\n'));

  const selected = [];

  for (const toolId of toolIds) {
    const tool = TOOLS[toolId];
    const answer = await question(`  安装 ${tool.name}? (y/n) [y]: `);
    if (answer === '' || answer.toLowerCase() === 'y') {
      selected.push(toolId);
    }
  }

  // 默认至少选一个
  if (selected.length === 0) {
    console.log(colors.yellow('\n  未选择任何工具，默认安装 Claude Code'));
    selected.push('claude');
  }

  return selected;
}

// 安装技能到指定工具
function installSkillsToTools(vaultPath, selectedTools) {
  for (const toolId of selectedTools) {
    const tool = TOOLS[toolId];
    const skillsDir = tool.getSkillsDir(vaultPath);

    // 确保目录存在
    if (!fs.existsSync(skillsDir)) {
      fs.mkdirSync(skillsDir, { recursive: true });
    }

    console.log(colors.blue(`\n📦 安装技能到 ${tool.name}\n`));

    for (const skill of SKILLS) {
      const templatePath = path.join(TEMPLATES_DIR, `${skill.id}.md`);
      let body = fs.readFileSync(templatePath, 'utf-8');
      body = body.replace(/{{VAULT_PATH}}/g, vaultPath);

      const frontmatter = tool.formatFrontmatter(skill.id, skill.desc);
      const filename = tool.getFilename(skill.id);
      const targetPath = path.join(skillsDir, filename);

      fs.writeFileSync(targetPath, `${frontmatter}\n\n${body}`);
      console.log(colors.green(`  ✓ worklog:${skill.id}`));
    }
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

  // 2. 从已安装的技能文件中读取 VAULT_PATH（检查所有工具）
  for (const toolId of ['claude', 'codex', 'cursor']) {
    const tool = TOOLS[toolId];
    const skillsDir = tool.getSkillsDir('');
    const logPath = path.join(skillsDir, tool.getFilename('log'));

    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf-8');
      const match = content.match(/VAULT_PATH\s*=\s*["']([^"']+)["']/);
      if (match) {
        return match[1];
      }
    }
  }

  return null;
}

// 检测已安装的工具
function detectInstalledTools(vaultPath) {
  const installed = [];

  for (const toolId of ['claude', 'codex', 'cursor']) {
    const tool = TOOLS[toolId];
    const skillsDir = tool.getSkillsDir(vaultPath);
    const logPath = path.join(skillsDir, tool.getFilename('log'));

    if (fs.existsSync(logPath)) {
      installed.push(toolId);
    }
  }

  return installed;
}

// init 命令
async function init(vaultPath) {
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

  // 3. 选择工具并安装技能
  const selectedTools = await selectTools();
  installSkillsToTools(vaultPath, selectedTools);

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
    console.log(colors.green(`\n  ✓ 日记/${today}.md`));
  }

  // 5. 完成
  console.log(colors.green('\n✨ 初始化完成！\n'));
  console.log(colors.gray('开始使用：'));
  console.log(colors.cyan('  /worklog:log         写日报'));
  console.log(colors.cyan('  /worklog:note xxx    快速笔记'));
  console.log(colors.cyan('  /worklog:project     同步项目'));
  console.log(colors.cyan('  /worklog:summarize   整理笔记'));
  console.log();

  rl.close();
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

  const installedTools = detectInstalledTools(vaultPath);
  if (installedTools.length === 0) {
    console.log(colors.yellow('未检测到已安装的工具，将安装到 Claude Code'));
    installedTools.push('claude');
  }

  console.log(colors.gray(`检测到已安装的工具: ${installedTools.map(t => TOOLS[t].name).join(', ')}\n`));

  installSkillsToTools(vaultPath, installedTools);
  console.log(colors.green('\n✨ 更新完成！\n'));
}

// 主逻辑
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  showVersion();
  process.exit(0);
}

if (command === 'init') {
  const vaultPath = targetPath ? path.resolve(targetPath) : process.cwd();
  init(vaultPath);
} else if (command === 'update') {
  update();
} else {
  showHelp();
  process.exit(0);
}