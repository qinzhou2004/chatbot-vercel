import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { repoName, ...botConfig } = req.body;
  
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
      template_repo: 'chatbot-vercel',
      name: repoName,
      private: false,
    });

    // 2. Generate config file content for template/bot-config.js
    const configContent = `// Configuración generada automáticamente
module.exports = ${JSON.stringify(botConfig, null, 2)}`;

    // 3. Generate dynamic CSS
    const cssContent = `/* CSS generado automáticamente */
:root {
  --color-primary: ${botConfig.cssConfig.primaryColor};
  --color-secondary: ${botConfig.cssConfig.secondaryColor};
  --message-radius: ${botConfig.cssConfig.messageRadius};
  --input-radius: ${botConfig.cssConfig.inputRadius};
  --chat-width: ${botConfig.cssConfig.chatWidth};
  --chat-height: ${botConfig.cssConfig.chatHeight};
  --font-family: ${botConfig.cssConfig.fontFamily};
  --font-size: ${botConfig.cssConfig.fontSize};
}

${botConfig.cssConfig.darkMode ? `
  body {
    background-color: #1a1a1a;
    color: #ffffff;
  }
` : ''}

.header {
  background: linear-gradient(to right, var(--color-secondary), var(--color-primary));
}

.userMessage {
  background: var(--color-primary);
  border-radius: var(--message-radius);
}

.assistantMessage {
  border-radius: var(--message-radius);
}

.chatContainer {
  width: var(--chat-width);
  height: var(--chat-height);
  font-family: var(--font-family);
  font-size: var(--font-size);
}

.inputField {
  border-radius: var(--input-radius);
}

${botConfig.cssConfig.showTypingIndicator ? '.typingIndicator { display: flex; }' : '.typingIndicator { display: none; }'}`;

    // Helper function to create or update a file
    const createOrUpdateFile = async (path, content, message) => {
      try {
        // Try to get the file first to see if it exists
        const { data } = await octokit.repos.getContent({
          owner: process.env.GITHUB_ACCOUNT,
          repo: repoName,
          path,
          branch: 'main'
        });
        
        // File exists, update it with the current SHA
        return octokit.repos.createOrUpdateFileContents({
          owner: process.env.GITHUB_ACCOUNT,
          repo: repoName,
          path,
          message,
          content: Buffer.from(content).toString('base64'),
          sha: data.sha, // Include the current SHA
          branch: 'main'
        });
      } catch (error) {
        if (error.status === 404) {
          // File doesn't exist, create it
          return octokit.repos.createOrUpdateFileContents({
            owner: process.env.GITHUB_ACCOUNT,
            repo: repoName,
            path,
            message,
            content: Buffer.from(content).toString('base64'),
            branch: 'main'
          });
        }
        throw error;
      }
    };

    // 4. Upload files to the new repository
    await createOrUpdateFile(
      'template/bot-config.js',
      configContent,
      'Añadir configuración del bot'
    );

    await createOrUpdateFile(
      'styles/dynamic-styles.css',
      cssContent,
      'Añadir estilos personalizados'
    );

    // 5. Upload additional configuration files if needed
    if (botConfig.initialSuggestions && botConfig.initialSuggestions.length > 0) {
      const suggestionsContent = `export default ${JSON.stringify(botConfig.initialSuggestions, null, 2)}`;
      
      await createOrUpdateFile(
        'config/suggestions.js',
        suggestionsContent,
        'Añadir sugerencias iniciales'
      );
    }

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