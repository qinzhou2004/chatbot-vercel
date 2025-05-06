import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
  // Check for POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { repoName, ...botConfig } = req.body;
  
  // Validate required environment variables
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_ACCOUNT) {
    return res.status(500).json({ 
      success: false, 
      message: 'GitHub credentials not configured' 
    });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    // 1. Create repository from template
    const { data: repo } = await octokit.repos.createUsingTemplate({
      template_owner: process.env.GITHUB_ACCOUNT,
      template_repo: 'chatbot-vercel-admin',
      name: repoName,
      private: false,
    });

    // 2. Generate config file content
    const configContent = `// Configuración generada automáticamente
module.exports = ${JSON.stringify(botConfig, null, 2)}`;

    // 3. Generate dynamic CSS
    const cssContent = `/* CSS generado automáticamente */
:root {
  --color-primary: ${botConfig.cssConfig.primaryColor};
  --color-secondary: ${botConfig.cssConfig.secondaryColor};
  --message-radius: ${botConfig.cssConfig.messageRadius};
}

.header {
  background: linear-gradient(to right, var(--color-secondary), var(--color-primary));
}

.userMessage {
  background: var(--color-primary);
  border-radius: var(--message-radius);
}
${botConfig.cssConfig.showTypingIndicator ? '.typingIndicator { display: flex; }' : '.typingIndicator { display: none; }'}`;

    // 4. Upload files to the new repository
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_ACCOUNT,  // Fixed typo: was ACCOUNT
      repo: repoName,  // Fixed: was hardcoded 'reponame'
      path: 'config/bot-config.js',
      message: 'Añadir configuración del bot',
      content: Buffer.from(configContent).toString('base64'),
      branch: 'main'  // Added branch specification
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_ACCOUNT,
      repo: repoName,
      path: 'styles/dynamic-styles.css',
      message: 'Añadir estilos personalizados',
      content: Buffer.from(cssContent).toString('base64'),
      branch: 'main'  // Added branch specification
    });

    res.status(200).json({ success: true, repoUrl: repo.html_url });
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: error.response?.data 
    });
  }
}