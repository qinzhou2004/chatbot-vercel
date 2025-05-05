import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import config from '../../config.json'; // 加载动态配置

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const chatContainerRef = useRef(null);

  // 初始化对话线程（使用配置的欢迎语）
  useEffect(() => {
    const initializeThread = async () => {
      try {
        const response = await fetch('/api/init-thread');
        const data = await response.json();
        setThreadId(data.threadId);
        setMessages([{
          role: 'assistant',
          content: config.welcomeMessage
        }]);
      } catch (error) {
        console.error('初始化失败:', error);
      }
    };
    initializeThread();
  }, []);

  // 消息自动滚动
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
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
        body: JSON.stringify({ message: input, threadId })
      });
      const data = await response.json();
      if (data.reply) setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: config.errorMessage || '出错了，请稍后再试' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{config.title}</title>
        <meta name="description" content={config.subtitle} />
      </Head>

      <header 
        className={styles.header}
        style={{ background: `linear-gradient(to right, ${config.primaryColor}, ${config.secondaryColor || '#2e9bdb'})` }}
      >
        <h1>{config.title}</h1>
        <p>{config.subtitle}</p>
      </header>

      <div className={styles.chatLayout}>
        <div ref={chatContainerRef} className={styles.chatContainer}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && <div className={styles.typingIndicator}>...</div>}
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={config.inputPlaceholder || "输入消息..."}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {config.sendButtonText || "发送"}
          </button>
        </form>
      </div>
    </div>
  );
}