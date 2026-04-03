#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { checkbox } from '@inquirer/prompts';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ASCII动画帧
const ANIMATION_FRAMES = [
  // Frame 1: 空白
  [
    '        ',
    '        ',
    '        ',
    '        ',
    '        ',
    '        ',
    '        ',
    '        ',
    '        ',
    '        ',
  ],
  // Frame 2: 中心块出现 (dim)
  [
    '        ',
    '        ',
    '        ',
    '        ',
    '        ',
    '    ░░  ',
    '    ░░  ',
    '    ░░  ',
    '        ',
    '        ',
  ],
  // Frame 3: 中心块变实
  [
    '        ',
    '        ',
    '        ',
    '        ',
    '        ',
    '    ██  ',
    '    ██  ',
    '    ██  ',
    '        ',
    '        ',
  ],
  // Frame 4: 上下点出现
  [
    '        ',
    '        ',
    '        ',
    '    ░░  ',
    '        ',
    '    ██  ',
    '    ██  ',
    '    ██  ',
    '        ',
    '    ░░  ',
  ],
  // Frame 5: 内环形成
  [
    '        ',
    '        ',
    '        ',
    '    ██  ',
    '  ░░  ░░',
    '    ██  ',
    '    ██  ',
    '    ██  ',
    '  ░░  ░░',
    '    ██  ',
  ],
  // Frame 6: 外环出现
  [
    '        ',
    '        ',
    '        ',
    '    ██  ',
    '  ██  ██',
    ' ░░██  ░░',
    ' ░░██  ░░',
    ' ░░██  ░░',
    '  ██  ██',
    '    ██  ',
  ],
  // Frame 7: 完整logo
  [
    '        ',
    '        ',
    '        ',
    '    ██  ',
    '  ██  ██',
    ' ████  ██',
    ' ████  ██',
    ' ████  ██',
    '  ██  ██',
    '    ██  ',
  ],
];

const FRAME_INTERVAL = 120;
const ART_COLUMN_WIDTH = 20;

// 简单的彩色输出
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  dim: (text) => `\x1b[2m${text}\x1b[0m`
};

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

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
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
  console.log(pkg.version);
}

// 交互式选择工具
async function selectTools() {
  const toolIds = ['claude', 'codex', 'cursor'];

  const selected = await checkbox({
    message: '选择要安装的 AI 工具',
    choices: toolIds.map(id => ({
      name: TOOLS[id].name,
      value: id,
      checked: id === 'claude'
    })),
    instructions: false,
    required: true
  });

  return selected;
}

// 安装技能到指定工具
async function installSkillsToTools(vaultPath, selectedTools) {
  const spinner = ora('正在安装技能...').start();

  for (const toolId of selectedTools) {
    const tool = TOOLS[toolId];
    const skillsDir = tool.getSkillsDir(vaultPath);

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
  let currentDir = process.cwd();
  const dirs = ['日记', '项目', '资源', '画布'];

  while (currentDir !== path.dirname(currentDir)) {
    const hasWorklog = dirs.every(dir => fs.existsSync(path.join(currentDir, dir)));
    if (hasWorklog) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

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

// 获取欢迎文本（右侧列）
function getWelcomeText() {
  return [
    colors.white(colors.bold('欢迎使用 worklog')),
    colors.dim('极简的个人工作管理知识库'),
    '',
    colors.white('此设置将配置:'),
    colors.dim('  • AI 工具的技能文件'),
    colors.dim('  • /worklog:* 斜杠命令'),
    '',
    colors.white('设置后快速开始:'),
    `  ${colors.cyan('/worklog:log')}         ${colors.dim('写日报')}`,
    `  ${colors.cyan('/worklog:note xxx')}    ${colors.dim('快速笔记')}`,
    `  ${colors.cyan('/worklog:project')}     ${colors.dim('同步项目')}`,
    `  ${colors.cyan('/worklog:summarize')}   ${colors.dim('整理笔记')}`,
    '',
    colors.cyan('按 Enter 选择工具...'),
  ];
}

// 渲染单帧（左右并排布局）
function renderFrame(artLines, textLines) {
  const maxLines = Math.max(artLines.length, textLines.length);
  const lines = [];

  for (let i = 0; i < maxLines; i++) {
    const artLine = artLines[i] || '';
    const textLine = textLines[i] || '';
    const paddedArt = artLine.padEnd(ART_COLUMN_WIDTH);
    const coloredArt = colors.cyan(paddedArt);
    lines.push(`\x1b[2K${coloredArt}${textLine}`);
  }

  return lines.join('\n');
}

// 等待Enter键
function waitForEnter() {
  return new Promise((resolve) => {
    const { stdin } = process;
    if (!stdin.isTTY) {
      resolve();
      return;
    }

    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();

    const onData = (data) => {
      const char = data.toString();
      if (char === '\r' || char === '\n' || char === '\u0003') {
        stdin.removeListener('data', onData);
        stdin.setRawMode(wasRaw);
        stdin.pause();

        if (char === '\u0003') {
          process.stdout.write('\n');
          process.exit(0);
        }
        resolve();
      }
    };

    stdin.on('data', onData);
  });
}

// 显示欢迎信息（动画）
async function showWelcome() {
  const textLines = getWelcomeText();
  const frameHeight = Math.max(ANIMATION_FRAMES[0].length, textLines.length) + 1;
  const totalHeight = frameHeight + 1;

  process.stdout.write('\n');

  let frameIndex = 0;
  let isFirstRender = true;

  const interval = setInterval(() => {
    const frame = ANIMATION_FRAMES[frameIndex];

    if (!isFirstRender) {
      process.stdout.write(`\x1b[${frameHeight}A`);
    }
    isFirstRender = false;

    process.stdout.write(renderFrame(frame, textLines) + '\n\n');
    frameIndex = (frameIndex + 1) % ANIMATION_FRAMES.length;
  }, FRAME_INTERVAL);

  await waitForEnter();

  clearInterval(interval);

  // 清除欢迎屏幕
  process.stdout.write(`\x1b[${totalHeight}A`);
  for (let i = 0; i < totalHeight; i++) {
    process.stdout.write('\x1b[2K\n');
  }
  process.stdout.write(`\x1b[${totalHeight}A`);
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

  const spinner = ora('创建目录结构...').start();

  const dirs = ['日记', '项目', '资源', '画布'];
  for (const dir of dirs) {
    const dirPath = path.join(vaultPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  spinner.succeed('目录结构创建完成');

  const claudeMdPath = path.join(vaultPath, 'CLAUDE.md');
  if (!fs.existsSync(claudeMdPath) || force) {
    const claudeMdTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'CLAUDE.md'), 'utf-8');
    fs.writeFileSync(claudeMdPath, claudeMdTemplate);
  }

  const selectedTools = await selectTools();
  await installSkillsToTools(vaultPath, selectedTools);

  const today = new Date().toISOString().split('T')[0];
  const diaryPath = path.join(vaultPath, '日记', `${today}.md`);
  if (!fs.existsSync(diaryPath)) {
    const diaryTemplate = `---
title: ${today}
date: ${today}
tags:
  - diary
aliases:
  - 今天
---

# ${today}

> [!todo] 今天要做的
> - [ ]

> [!tip]+ 工作记录

> [!note]- 笔记

> [!warning] 明天继续
`;
    fs.writeFileSync(diaryPath, diaryTemplate);
    console.log(colors.green(`  ✓ 日记/${today}.md`));
  }

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