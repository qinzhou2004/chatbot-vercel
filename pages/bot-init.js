import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/BotInit.module.css';

export default function BotInitializer() {
  const [activeTab, setActiveTab] = useState('basic');
  const [config, setConfig] = useState({
    repoName: '',
    pageTitle: 'Mi Chatbot Personalizado',
    mainHeading: 'Soporte NKZN',
    subHeading: 'Expertos en tecnología!',
    inputPlaceholder: 'Escribe tu mensaje aquí...',
    submitButtonText: 'Enviar',
    welcomeMessage: '¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?',
    errorMessage: 'Disculpa, estoy teniendo problemas. ¿Podrías intentarlo de nuevo?',
    initialSuggestions: ['Pregunta frecuente 1', 'Pregunta frecuente 2', 'Cómo contactar soporte'],
    showBranding: true,
    enableVoiceInput: false,
    responseDelay: 1000,
    cssConfig: {
      primaryColor: '#0070f3',
      secondaryColor: '#00dddd',
      messageRadius: '18px',
      inputRadius: '20px',
      showTypingIndicator: true,
      chatWidth: '400px',
      chatHeight: '600px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      darkMode: false,
    }
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

  const handleArrayChange = (field, index, value) => {
    const newArray = [...config[field]];
    newArray[index] = value;
    setConfig({ ...config, [field]: newArray });
  };

  const addSuggestion = () => {
    setConfig({
      ...config,
      initialSuggestions: [...config.initialSuggestions, '']
    });
  };

  const removeSuggestion = (index) => {
    const newSuggestions = [...config.initialSuggestions];
    newSuggestions.splice(index, 1);
    setConfig({ ...config, initialSuggestions: newSuggestions });
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

      <h1>⚙️ Configuración Avanzada del Chatbot</h1>
      
      <div className={styles.tabs}>
        <button 
          className={activeTab === 'basic' ? styles.activeTab : ''}
          onClick={() => setActiveTab('basic')}
        >
          Información Básica
        </button>
        <button 
          className={activeTab === 'style' ? styles.activeTab : ''}
          onClick={() => setActiveTab('style')}
        >
          Estilos
        </button>
        <button 
          className={activeTab === 'behavior' ? styles.activeTab : ''}
          onClick={() => setActiveTab('behavior')}
        >
          Comportamiento
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'basic' && (
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
                placeholder="bot-mi-empresa"
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

            <div className={styles.formGroup}>
              <label>Encabezado Principal</label>
              <input
                type="text"
                name="mainHeading"
                value={config.mainHeading}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Subtítulo</label>
              <input
                type="text"
                name="subHeading"
                value={config.subHeading}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className={styles.section}>
            <h2>Estilos del Chatbot</h2>
            
            <div className={styles.formGroup}>
              <label>Color Principal</label>
              <div className={styles.colorPicker}>
                <input
                  type="color"
                  name="primaryColor"
                  value={config.cssConfig.primaryColor}
                  onChange={handleCssChange}
                />
                <span>{config.cssConfig.primaryColor}</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Color Secundario</label>
              <div className={styles.colorPicker}>
                <input
                  type="color"
                  name="secondaryColor"
                  value={config.cssConfig.secondaryColor}
                  onChange={handleCssChange}
                />
                <span>{config.cssConfig.secondaryColor}</span>
              </div>
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
              <label>Radio de Borde (Input)</label>
              <input
                type="range"
                name="inputRadius"
                min="0"
                max="30"
                value={parseInt(config.cssConfig.inputRadius)}
                onChange={(e) =>
                  handleCssChange({
                    target: { name: 'inputRadius', value: `${e.target.value}px` },
                  })
                }
              />
              <span>{config.cssConfig.inputRadius}</span>
            </div>

            <div className={styles.formGroup}>
              <label>Ancho del Chat</label>
              <input
                type="text"
                name="chatWidth"
                value={config.cssConfig.chatWidth}
                onChange={handleCssChange}
                placeholder="400px"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Altura del Chat</label>
              <input
                type="text"
                name="chatHeight"
                value={config.cssConfig.chatHeight}
                onChange={handleCssChange}
                placeholder="600px"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Fuente</label>
              <select
                name="fontFamily"
                value={config.cssConfig.fontFamily}
                onChange={handleCssChange}
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Helvetica Neue', sans-serif">Helvetica</option>
                <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Segoe UI</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Tamaño de Fuente</label>
              <select
                name="fontSize"
                value={config.cssConfig.fontSize}
                onChange={handleCssChange}
              >
                <option value="12px">Pequeño (12px)</option>
                <option value="14px">Mediano (14px)</option>
                <option value="16px">Grande (16px)</option>
                <option value="18px">Extra Grande (18px)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name="darkMode"
                  checked={config.cssConfig.darkMode}
                  onChange={handleCssChange}
                />
                Modo Oscuro
              </label>
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
        )}

        {activeTab === 'behavior' && (
          <div className={styles.section}>
            <h2>Comportamiento del Chatbot</h2>
            
            <div className={styles.formGroup}>
              <label>Mensaje de Bienvenida</label>
              <textarea
                name="welcomeMessage"
                value={config.welcomeMessage}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Mensaje de Error</label>
              <textarea
                name="errorMessage"
                value={config.errorMessage}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Placeholder del Input</label>
              <input
                type="text"
                name="inputPlaceholder"
                value={config.inputPlaceholder}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Texto del Botón de Envío</label>
              <input
                type="text"
                name="submitButtonText"
                value={config.submitButtonText}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Sugerencias Iniciales</label>
              {config.initialSuggestions.map((suggestion, index) => (
                <div key={index} className={styles.suggestionItem}>
                  <input
                    type="text"
                    value={suggestion}
                    onChange={(e) => handleArrayChange('initialSuggestions', index, e.target.value)}
                    placeholder={`Sugerencia ${index + 1}`}
                  />
                  <button 
                    type="button" 
                    onClick={() => removeSuggestion(index)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={addSuggestion}
                className={styles.addButton}
              >
                + Añadir Sugerencia
              </button>
            </div>

            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name="showBranding"
                  checked={config.showBranding}
                  onChange={(e) => setConfig({...config, showBranding: e.target.checked})}
                />
                Mostrar Branding
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name="enableVoiceInput"
                  checked={config.enableVoiceInput}
                  onChange={(e) => setConfig({...config, enableVoiceInput: e.target.checked})}
                />
                Habilitar Entrada por Voz
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>Retraso de Respuesta (ms)</label>
              <input
                type="number"
                name="responseDelay"
                min="0"
                max="5000"
                step="100"
                value={config.responseDelay}
                onChange={(e) => setConfig({...config, responseDelay: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        )}

        <button type="submit" disabled={isGenerating} className={styles.submitButton}>
          {isGenerating ? 'Generando...' : 'Crear Chatbot'}
        </button>
      </form>

      {progress && <div className={styles.progress}>{progress}</div>}
    </div>
  );
}