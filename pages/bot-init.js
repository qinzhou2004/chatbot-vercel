import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/BotInit.module.css';

export default function BotInitializer() {
  const [config, setConfig] = useState({
    repoName: '',
    pageTitle: 'Mi Chatbot Personalizado',
    mainHeading: 'Soporte NKZN',
    subHeading: 'Expertos en tecnología!',
    inputPlaceholder: 'Escribe tu mensaje aquí...',
    submitButtonText: 'Enviar',
    welcomeMessage: '¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?',
    errorMessage: 'Disculpa, estoy teniendo problemas. ¿Podrías intentarlo de nuevo?',
    cssConfig: {
      primaryColor: '#0070f3',
      secondaryColor: '#00dddd',
      messageRadius: '18px',
      inputRadius: '20px',
      showTypingIndicator: true,
    },
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleCssChange = (e) => {
    setConfig({
      ...config,
      cssConfig: {
        ...config.cssConfig,
        [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      setProgress('Creando repositorio en GitHub...');
      const res = await fetch('/api/create-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        setProgress(`✅ ¡Éxito! Repositorio creado: ${data.repoUrl}`);
      } else {
        setProgress(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setProgress(`❌ Error grave: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Configura tu Chatbot</title>
      </Head>

      <h1>⚙️ Configura tu Chatbot</h1>

      <form onSubmit={handleSubmit}>
        {/* Configuración básica */}
        <div className={styles.section}>
          <h2>Información Básica</h2>
          <div className={styles.formGroup}>
            <label>Nombre del Repositorio GitHub *</label>
            <input
              type="text"
              name="repoName"
              value={config.repoName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Título de la Página</label>
            <input
              type="text"
              name="pageTitle"
              value={config.pageTitle}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Configuración CSS */}
        <div className={styles.section}>
          <h2>Estilos del Chatbot</h2>
          <div className={styles.formGroup}>
            <label>Color Principal</label>
            <input
              type="color"
              name="primaryColor"
              value={config.cssConfig.primaryColor}
              onChange={handleCssChange}
            />
            <span>{config.cssConfig.primaryColor}</span>
          </div>

          <div className={styles.formGroup}>
            <label>Radio de Borde (Mensajes)</label>
            <input
              type="range"
              name="messageRadius"
              min="0"
              max="30"
              value={parseInt(config.cssConfig.messageRadius)}
              onChange={(e) =>
                handleCssChange({
                  target: { name: 'messageRadius', value: `${e.target.value}px` },
                })
              }
            />
            <span>{config.cssConfig.messageRadius}</span>
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                name="showTypingIndicator"
                checked={config.cssConfig.showTypingIndicator}
                onChange={handleCssChange}
              />
              Mostrar Indicador de "Escribiendo"
            </label>
          </div>
        </div>

        <button type="submit" disabled={isGenerating}>
          {isGenerating ? 'Generando...' : 'Crear Chatbot'}
        </button>
      </form>

      {progress && <div className={styles.progress}>{progress}</div>}
    </div>
  );
}