import React, { useEffect, useRef, useState } from 'react';
import "./style.css";

export const ScannerChat = ({ messages }) => {
    const [latestMessages, setLatestMessages] = useState([]);
    const chatEndRef = useRef(null);
    const lastMsgRef = useRef(null);
    const lastTypingRef = useRef(false);

    const lastMsg = messages.at(-1);
    const hasTypingDots = lastMsg?.msg?.toLowerCase().includes("ready for scan");

    useEffect(() => {
        if (!lastMsg) return;

        const msgChanged = lastMsg.msg !== lastMsgRef.current;
        const typingChanged = hasTypingDots !== lastTypingRef.current;

        if (msgChanged || typingChanged) {
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 0);

            lastMsgRef.current = lastMsg.msg;
            lastTypingRef.current = hasTypingDots;

            if (msgChanged) {
                setLatestMessages((prev) => [...prev, lastMsg].slice(-30));
            }
        }
    }, [messages, hasTypingDots]);

    return (
        <div className="scanner-chat">
            {latestMessages.map((message, index) => (
                <div
                    key={index}
                    className={`chat-message ${message.is_system ? 'system' : 'user'} 
                        ${message.warning ? 'warning' : ''} 
                        ${message.garbage ? 'trash' : ''} 
                        ${message.duplicate_reported ? 'duplicate' : ''}`}
                >
                    <span className="chat-line">
                        {message.msg}
                        {message.duplicate_reported && (
                            <img alt="duplicate" src="/duplicate.svg" className="chat-icon" />
                        )}
                        {message.garbage && (
                            <img alt="trash" src="/junk.svg" className="chat-icon" />
                        )}
                        {message.wash && (
                            <img alt="wash" src="/status_wash.svg" className="chat-icon" />
                        )}
                    </span>
                </div>
            ))}

            {hasTypingDots && (
                <div className="chat-message user">
                    <span className="typing-dots">
                        <span></span><span></span><span></span>
                    </span>
                </div>
            )}

            <div ref={chatEndRef} />
        </div>
    );
};
