import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatbotAssistant.css';
import ReactMarkdown from 'react-markdown';
import mess from '../asset/image/messenger.png';

interface Message {
    text: string;
    sender: 'user' | 'ai';
    error?: boolean;
}

function ChatbotAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const apiKey = ''; // **QUAN TRỌNG: KHÔNG BAO GIỜ LƯU TRỮ API KEY TRỰC TIẾP TRONG CLIENT-SIDE PRODUCTION CODE!**
    const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = { text: inputText, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${geminiApiUrl}?key=${apiKey}`,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: inputText,
                                },
                            ],
                        },
                    ],
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data && response.data.candidates && response.data.candidates.length > 0) {
                const aiResponse: Message = { text: response.data.candidates[0].content.parts[0].text, sender: 'ai' };
                setMessages((prevMessages) => [...prevMessages, aiResponse]);
            } else {
                const aiError: Message = { text: 'Không nhận được phản hồi từ trợ lý.', sender: 'ai', error: true };
                setMessages((prevMessages) => [...prevMessages, aiError]);
            }
        } catch (error) {
            console.error('Lỗi khi gọi Gemini API:', error);
            const aiError: Message = { text: 'Đã có lỗi xảy ra khi giao tiếp với trợ lý.', sender: 'ai', error: true };
            setMessages((prevMessages) => [...prevMessages, aiError]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chatbot-container">
           

            <button className="chatbot-button" onClick={toggleChat}>
                <img className="chatbot-img" src={mess} alt="mess" />
            </button>


            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        Trợ lý cửa hàng
                        <button className="chatbot-close-button" onClick={toggleChat}>
                            &times;
                        </button>
                    </div>
                    <div className="chatbot-messages" ref={chatContainerRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender} ${msg.error ? 'error' : ''}`}>
                                {msg.sender === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                            </div>
                        ))}
                        {isLoading && <div className="message ai loading">Đang xử lý...</div>}
                    </div>
                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={inputText}
                            onChange={handleInputChange}
                            placeholder="Hỏi tôi về sản phẩm..."
                            onKeyPress={(event) => event.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage} disabled={isLoading}>
                            Gửi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatbotAssistant;