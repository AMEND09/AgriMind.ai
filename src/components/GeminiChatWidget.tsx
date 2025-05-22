import React, { useState, useRef, useEffect } from 'react';
import { ApiService } from '../services/DataStorage';
import './GeminiChatWidget.css'; // We'll create this CSS file next

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

const GeminiChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Initial greeting from bot when chat opens for the first time
      setMessages([{ id: Date.now().toString(), sender: 'bot', text: "Hi there! How can I help you with your farm data today?" }]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: inputValue.trim() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await ApiService.chatWithGemini(userMessage.text);
      const botMessage: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: response.reply };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Sorry, I couldn't connect to the assistant. Please try again later."
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!ApiService.isLoggedIn()) {
    return null; // Don't show the widget if user is not logged in
  }

  return (
    <>
      <button onClick={toggleChat} className="chat-sticky-button">
        💬 Ask AI
      </button>
      {isOpen && (
        <div className="chat-widget-container">
          <div className="chat-widget-header">
            <h3>AgriMind Assistant</h3>
            <button onClick={toggleChat} className="chat-close-button">✕</button>
          </div>
          <div className="chat-widget-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="chat-widget-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask about your data..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default GeminiChatWidget;
