const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// 配置参数
const PROJECTS_DIR = path.join(__dirname, '../projects');
const TEMPLATE_DIR = path.join(__dirname, '../template');

async function generateProject(projectName, options) {
  // 1. 准备目录
  const projectDir = path.join(PROJECTS_DIR, projectName);
  if (fs.existsSync(projectDir)) {
    throw new Error(`项目 ${projectName} 已存在`);
  }
  fs.mkdirSync(projectDir, { recursive: true });

  // 2. 复制模板文件
  const copyRecursive = (src, dest) => {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      fs.statSync(srcPath).isDirectory()
        ? copyRecursive(srcPath, destPath)
        : fs.copyFileSync(srcPath, destPath);
    });
  };
  copyRecursive(TEMPLATE_DIR, projectDir);

  // 3. 生成动态配置
  const config = {
    title: options.title || "我的聊天助手",
    subtitle: options.subtitle || "专业客服支持",
    primaryColor: options.color || "#00dddd",
    welcomeMessage: options.welcome || "您好！请问有什么可以帮您？",
    errorMessage: options.errorMsg || "服务暂时不可用，请稍后再试",
    inputPlaceholder: options.placeholder || "请输入您的问题...",
    sendButtonText: options.buttonText || "发送"
  };
  fs.writeFileSync(
    path.join(projectDir, 'config.json'),
    JSON.stringify(config, null, 2)
  );

  // 4. 初始化Git仓库（可选）
  if (options.initGit) {
    await exec(`cd ${projectDir} && git init`);
  }

  // 5. 安装依赖（可选）
  if (options.installDeps) {
    await exec(`cd ${projectDir} && npm install`);
  }

  console.log(`✅ 项目生成成功: ${projectDir}`);
}

// 命令行参数解析
const args = process.argv.slice(2);
const options = {};
args.forEach(arg => {
  const [key, value] = arg.replace(/^--/, '').split('=');
  options[key] = value || true;
});

// 执行生成
generateProject(options.name || `project-${Date.now()}`, options)
  .catch(err => {
    console.error('❌ 生成失败:', err.message);
    process.exit(1);
  });