#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { checkbox } = require('@inquirer/prompts');
const ora = require('ora');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// 简单的彩色输出
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// 工具配置
const TOOLS = {
  claude: {
    name: 'Claude Code',
    getSkillsDir: (vaultPath) => path.join(os.homedir(), '.claude', 'commands', 'worklog'),
    getFilename: (id) => `${id}.md`,
    formatFile: (id, desc, body) => {
      const escapedDesc = desc.includes('"') ? desc.replace(/"/g, '\\"') : desc;
      return `---
name: worklog:${id}
description: "${escapedDesc}"
---

${body}`;
    }
  },
  codex: {
    name: 'Codex',
    getSkillsDir: (vaultPath) => {
      const codexHome = process.env.CODEX_HOME?.trim() || path.join(os.homedir(), '.codex');
      return path.join(codexHome, 'prompts');
    },
    getFilename: (id) => `worklog-${id}.md`,
    formatFile: (id, desc, body) => `---
description: ${desc}
argument-hint: command arguments
---

${body}`
  },
  cursor: {
    name: 'Cursor',
    getSkillsDir: (vaultPath) => path.join(vaultPath, '.cursor', 'commands'),
    getFilename: (id) => `worklog-${id}.md`,
    formatFile: (id, desc, body) => {
      const escapedDesc = desc.includes('"') ? desc.replace(/"/g, '\\"') : desc;
      return `---
name: /worklog-${id}
id: worklog-${id}
category: Worklog
description: "${escapedDesc}"
---

${body}`;
    }
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

// 自定义 spinner 帧 - 模拟 OpenSpec 的效果
const customSpinner = {
  interval: 120,
  frames: [
    ' ░░░░ ',
    ' ▓░░░ ',
    ' ▓▓░░ ',
    ' ▓▓▓░ ',
    ' ▓▓▓▓ ',
    ' ░▓▓▓ ',
    ' ░░▓▓ ',
    ' ░░░▓ ',
  ]
};

// 交互式选择工具（使用 inquirer）
async function selectTools() {
  const toolIds = ['claude', 'codex', 'cursor'];

  const selected = await checkbox({
    message: '选择要安装的 AI 工具',
    choices: toolIds.map(id => ({
      name: TOOLS[id].name,
      value: id,
      checked: id === 'claude' // 默认选中 Claude Code
    })),
    instructions: false,
    required: true
  });

  return selected;
}

// 安装技能到指定工具
async function installSkillsToTools(vaultPath, selectedTools) {
  const spinner = ora({
    text: '正在安装技能...',
    spinner: customSpinner
  }).start();

  for (const toolId of selectedTools) {
    const tool = TOOLS[toolId];
    const skillsDir = tool.getSkillsDir(vaultPath);

    // 确保目录存在
    if (!fs.existsSync(skillsDir)) {
      fs.mkdirSync(skillsDir, { recursive: true });
    }

    spinner.text = `正在安装到 ${tool.name}...`;

    for (const skill of SKILLS) {
      const templatePath = path.join(TEMPLATES_DIR, `${skill.id}.md`);
      let body = fs.readFileSync(templatePath, 'utf-8');
      body = body.replace(/{{VAULT_PATH}}/g, vaultPath);

      const filename = tool.getFilename(skill.id);
      const targetPath = path.join(skillsDir, filename);
      const content = tool.formatFile(skill.id, skill.desc, body);

      fs.writeFileSync(targetPath, content);
    }
  }

  spinner.succeed('技能安装完成');
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

// 显示欢迎信息（带动画）
async function showWelcome() {
  const frames = customSpinner.frames;
  const lines = [
    '                        欢迎使用 worklog',
    '                        极简的个人工作管理知识库',
    '',
    '        ' + colors.cyan('████') + '            此设置将配置:',
    '                          • AI 工具的技能文件',
    '        ' + colors.cyan('████') + '              • /worklog:* 斜杠命令',
    '        ' + colors.cyan('████') + '',
    '        ' + colors.cyan('████') + '            设置后快速开始:',
    '                          • /worklog:log      写日报',
    '        ' + colors.cyan('░░░░') + '              • /worklog:note     快速笔记',
    '                          • /worklog:project  同步项目',
    ''
  ];

  // 清屏并显示欢迎信息
  console.clear();
  console.log(lines.join('\n'));

  // 短暂停顿让用户看到欢迎信息
  await new Promise(resolve => setTimeout(resolve, 800));
}

// 显示完成信息
function showComplete(selectedTools) {
  const toolNames = selectedTools.map(t => TOOLS[t].name).join(', ');

  console.log('');
  console.log(colors.green('  ✨ 设置完成'));
  console.log('');
  console.log(colors.gray(`  已安装：${toolNames}`));
  console.log(colors.gray('  4 个技能文件'));
  console.log('');
  console.log(colors.bold('  开始使用：'));
  console.log(colors.cyan('    /worklog:log         写日报'));
  console.log(colors.cyan('    /worklog:note xxx    快速笔记'));
  console.log(colors.cyan('    /worklog:project     同步项目'));
  console.log(colors.cyan('    /worklog:summarize   整理笔记'));
  console.log('');
  console.log(colors.gray('  重启您的 AI 工具以使斜杠命令生效。'));
  console.log('');
}

// init 命令
async function init(vaultPath) {
  await showWelcome();

  console.log(colors.gray(`  目标路径: ${vaultPath}\n`));

  // 1. 创建目录结构
  const spinner = ora({
    text: '创建目录结构...',
    spinner: customSpinner
  }).start();

  const dirs = ['日记', '项目', '资源', '画布'];
  for (const dir of dirs) {
    const dirPath = path.join(vaultPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  spinner.succeed('目录结构创建完成');

  // 2. 创建 CLAUDE.md
  const claudeMdPath = path.join(vaultPath, 'CLAUDE.md');
  if (!fs.existsSync(claudeMdPath) || force) {
    const claudeMdTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'CLAUDE.md'), 'utf-8');
    fs.writeFileSync(claudeMdPath, claudeMdTemplate);
  }

  // 3. 选择工具并安装技能
  const selectedTools = await selectTools();
  await installSkillsToTools(vaultPath, selectedTools);

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
  showComplete(selectedTools);
}

// update 命令
async function update() {
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

  await installSkillsToTools(vaultPath, installedTools);
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