import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// ─── Markdown-like renderer for Claude responses ──────────────────────────────
function MessageContent({ text }) {
  // Detect JSON code blocks and render them nicely
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/^```(json|js|javascript)?\n?/, '').replace(/```$/, '').trim();
          return (
            <div key={i} style={{
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(79,142,247,0.3)',
              borderRadius: '10px', padding: '1rem', margin: '0.75rem 0',
              fontFamily: 'monospace', fontSize: '0.75rem', overflowX: 'auto',
              whiteSpace: 'pre-wrap', color: '#a5f3fc', lineHeight: 1.6
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(79,142,247,0.7)', fontWeight: 700, textTransform: 'uppercase' }}>Generated JSON</span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  style={{ fontSize: '0.65rem', background: 'rgba(79,142,247,0.15)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '6px', padding: '0.2rem 0.6rem', cursor: 'pointer' }}
                >
                  Copy
                </button>
              </div>
              {code}
            </div>
          );
        }
        // Render regular text with basic markdown
        return (
          <div key={i} style={{ lineHeight: 1.7, fontSize: '0.88rem' }}>
            {part.split('\n').map((line, j) => {
              if (line.startsWith('### ')) return <h4 key={j} style={{ color: 'var(--accent)', margin: '0.75rem 0 0.25rem', fontSize: '0.9rem' }}>{line.slice(4)}</h4>;
              if (line.startsWith('## ')) return <h3 key={j} style={{ color: 'var(--accent)', margin: '0.75rem 0 0.25rem', fontSize: '1rem' }}>{line.slice(3)}</h3>;
              if (line.startsWith('**') && line.endsWith('**')) return <p key={j} style={{ fontWeight: 700, margin: '0.3rem 0' }}>{line.slice(2, -2)}</p>;
              if (line.startsWith('- ') || line.startsWith('• ')) return <li key={j} style={{ marginLeft: '1rem', margin: '0.2rem 0 0.2rem 1rem', color: 'var(--text2)' }}>{line.slice(2)}</li>;
              if (line.trim() === '') return <br key={j} />;
              return <p key={j} style={{ margin: '0.2rem 0' }}>{line}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.75rem 1rem' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--accent)',
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.25rem' }}>Claude is thinking...</span>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.7);opacity:0.5} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}

// ─── Quick Prompt Chips ───────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '🔧 Generate Role Data', prompt: 'Generate complete role intelligence data for "Prompt Engineer" including all 3 narrative paragraphs and skill sets.' },
  { label: '📊 Show DB Stats', prompt: 'How many roles are in the database and which ones have complete narrative data?' },
  { label: '🤖 Explain AI Exposure', prompt: 'Explain how the AI exposure percentage is used in the platform and what the 3 narrative paragraphs mean.' },
  { label: '📝 Generate Finance Role', prompt: 'Generate complete intelligence data for "Investment Banker" for the Indian finance market.' },
  { label: '🏗️ New Role Template', prompt: 'Give me the complete JSON template I need to fill in for adding a new role to compiled_roles.json.' },
  { label: '🎯 Audit Review', prompt: 'Which roles in the current database are missing narrative data and should be prioritised for content generation?' },
];

// ─── Main Claude Engine Component ─────────────────────────────────────────────
const ClaudeEngine = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Welcome to the **SMAART Claude Engine** — your AI-powered data generation assistant.\n\nI have full awareness of the platform's career intelligence database, role structure, and narrative system. Here's what I can help you with:\n\n- **Generate** complete role profiles (narrative_para1, para2, para3) for any job role\n- **Inspect** existing role data and identify gaps\n- **Create** structured JSON ready to merge into compiled_roles.json\n- **Explain** the platform's career analysis logic and zone matrix\n\nTry one of the quick prompts below, or type your own request.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;
    setInput('');
    setError('');

    const newMessages = [...messages, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }];
    setMessages(newMessages);
    setLoading(true);

    // Build conversation history in Anthropic format (exclude the intro message)
    const conversationHistory = newMessages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await axios.post('http://localhost:5000/api/admin/claude-chat', {
        message: userMessage,
        conversationHistory: conversationHistory.slice(0, -1) // exclude the message we just added (server adds it)
      }, { timeout: 40000 });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toISOString(),
        model: res.data.model
      }]);
    } catch (err) {
      const errMsg = err.response?.data?.details || err.response?.data?.error || err.message;
      setError(`Claude Engine Error: ${errMsg}`);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ **Error**: ${errMsg}\n\nPlease check that your ANTHROPIC_API_KEY is correctly set in backend/.env and the backend server is running.`,
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: '🔄 Conversation cleared. Ready for new requests.',
      timestamp: new Date().toISOString()
    }]);
    setError('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', minHeight: '500px' }}>
      {/* Header info bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.25rem', background: 'rgba(79,142,247,0.06)',
        border: '1px solid rgba(79,142,247,0.2)', borderRadius: '12px', marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text2)' }}>Claude 3.5 Sonnet • SMAART Intelligence Mode</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={clearChat} style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', cursor: 'pointer' }}>
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {QUICK_PROMPTS.map((qp, i) => (
          <button key={i} onClick={() => sendMessage(qp.prompt)} disabled={loading}
            style={{
              fontSize: '0.7rem', padding: '0.35rem 0.85rem', borderRadius: '100px', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.25)',
              color: 'var(--text2)', fontFamily: 'var(--font)', transition: '0.2s',
              opacity: loading ? 0.5 : 1
            }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem',
        padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px',
        border: '1px solid var(--border)', marginBottom: '1rem'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: '0.75rem', alignItems: 'flex-start' }}>
            {/* Avatar */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'user' ? 'linear-gradient(135deg, #4f8ef7, #7c3aed)' : 'linear-gradient(135deg, #0f0f1a, #1a1a3e)',
              border: '2px solid ' + (msg.role === 'user' ? 'var(--accent)' : 'rgba(79,142,247,0.4)'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem'
            }}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '78%', padding: '1rem 1.25rem',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, rgba(79,142,247,0.15), rgba(124,58,237,0.1))'
                : (msg.isError ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)'),
              border: '1px solid ' + (msg.role === 'user' ? 'rgba(79,142,247,0.3)' : (msg.isError ? 'rgba(239,68,68,0.2)' : 'var(--border)')),
              borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
              color: 'var(--text)'
            }}>
              <MessageContent text={msg.content} />
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.5rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.role === 'assistant' && msg.model && <span style={{ marginRight: '0.5rem', color: 'rgba(79,142,247,0.5)' }}>{msg.model}</span>}
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f0f1a, #1a1a3e)', border: '2px solid rgba(79,142,247,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🤖</div>
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '4px 18px 18px 18px' }}>
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Claude to generate role data, inspect the database, or request career intelligence... (Enter to send, Shift+Enter for new line)"
            disabled={loading}
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'none', padding: '0.9rem 1.1rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              borderRadius: '14px', color: 'var(--text)', fontFamily: 'var(--font)',
              fontSize: '0.85rem', lineHeight: 1.5, outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            padding: '0.9rem 1.5rem', borderRadius: '14px', border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            background: loading || !input.trim() ? 'rgba(79,142,247,0.3)' : 'linear-gradient(135deg, var(--accent), #7c3aed)',
            color: '#fff', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font)',
            transition: '0.2s', flexShrink: 0, boxShadow: loading || !input.trim() ? 'none' : '0 4px 20px rgba(79,142,247,0.4)'
          }}
        >
          {loading ? '⏳' : '🚀 Send'}
        </button>
      </div>
    </div>
  );
};

export default ClaudeEngine;
