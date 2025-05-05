import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  // Configurable parameters (could also come from props or API)
  const config = {
    title: "Soporte NKZN",
    description: "Expertos en tecnología!",
    greeting: "¡Hola! Soy tu asistente de NKZN. ¿En qué puedo ayudarte hoy?",
    errorMessage: "Disculpa, estoy teniendo dificultades. ¿Podrías intentarlo de nuevo?",
    placeholder: "Escribe tu mensaje aquí...",
    buttonText: "Enviar",
    theme: "default" // Could be used for different styling
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const chatContainerRef = useRef(null);

  // Initialize chat thread
  useEffect(() => {
    const initializeThread = async () => {
      try {
        const response = await fetch('/api/init-thread');
        const data = await response.json();
        setThreadId(data.threadId);
        setMessages([{
          role: 'assistant',
          content: config.greeting
        }]);
      } catch (error) {
        console.error('Error initializing thread:', error);
      }
    };
    
    initializeThread();
  }, []);

  // Auto-scroll to newest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          threadId: threadId 
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: config.errorMessage 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${styles[config.theme]}`}>
      <Head>
        <title>{config.title}</title>
        <meta name="description" content={config.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <h1>{config.title}</h1>
        <p>{config.description}</p>
      </header>
      
      <div className={styles.chatLayout}>
        <div 
          ref={chatContainerRef}
          className={styles.chatContainer}
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`${styles.message} ${
                msg.role === 'user' ? styles.userMessage : styles.assistantMessage
              } ${index === 0 ? styles.firstMessage : ''}`}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className={styles.typingIndicator}>
              <div className={styles.typingDot}></div>
              <div className={styles.typingDot}></div>
              <div className={styles.typingDot}></div>
            </div>
          )}
        </div>

        <div className={styles.inputArea}>
          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={config.placeholder}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {config.buttonText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}