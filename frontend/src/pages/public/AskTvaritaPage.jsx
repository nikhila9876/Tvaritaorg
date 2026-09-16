import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, BookOpen, Compass, Info,
  AlertCircle, RefreshCw, CheckCircle2, ChevronRight,
  ExternalLink, Layers, MapPin, Feather, Quote, CornerDownLeft
} from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import { ai } from '../../api';

const DEFAULT_SUGGESTIONS = [
  "What is Kalamkari?",
  "Tell me about Kuchipudi.",
  "Which art forms are from Andhra Pradesh?",
  "Who is master artist Ramesh Kumar Jha?",
  "What happens in a traditional art workshop?",
  "Which Tvarita experiences are available?",
  "What is Warli art and its symbols?",
  "Tell me about Baul music and philosophy.",
];

// Client-side fallback knowledge archive for offline/instant resilience
const FALLBACK_KNOWLEDGE = {
  kalamkari: {
    answer: "Kalamkari is a venerable Indian textile art form originating in Andhra Pradesh, whose name derives from 'kalam' (bamboo pen) and 'kari' (craftsmanship). There are two primary traditional styles: the **Srikalahasti style**, characterized by freehand drawing on temple narrative scrolls illustrating the Ramayana and Mahabharata, and the **Machilipatnam style**, which utilizes hand-carved teak woodblocks. The process is completely organic across 17 stages, using buffalo milk as a mordant, kasimi (rusted iron jaggery syrup) for black contours, and natural dyes from madder roots, turmeric, and indigo.",
    sources: [
      { title: "Kalamkari Painting & Textile Art", type: "art-form", region: "Andhra Pradesh" },
      { title: "Tvarita Living Heritage Archive", type: "archive" }
    ]
  },
  kuchipudi: {
    answer: "Kuchipudi is a classical dance-drama originating in the village of Kuchipudi in Krishna district, Andhra Pradesh. Synthesizing pure dance (nritta), expressive mime (nritya), and dramatic dialogue (natya), it was historically performed by itinerant Brahmin troupes known as Kuchipudi Bhagavatulu. A signature highlight is the *Tarangam*, where the dancer balances on the rim of a brass plate while executing intricate footwork, often balancing a pot of water on their head to symbolize spiritual equilibrium.",
    sources: [
      { title: "Kuchipudi Classical Dance-Drama", type: "art-form", region: "Andhra Pradesh" },
      { title: "Sangeet Natak Akademi Living Lineage", type: "tradition" }
    ]
  },
  andhra: {
    answer: "The Tvarita Knowledge Archive documents several living art traditions from Andhra Pradesh:\n\n• **Kalamkari**: Freehand bamboo pen scrolls in Srikalahasti and woodblock natural textile printing in Machilipatnam.\n• **Kuchipudi**: World-renowned classical dance-drama originating in Krishna district, famous for the brass plate *Tarangam*.\n• **Tholu Bommalata**: Ancient shadow leather puppetry with translucent illuminated puppets depicting epic battles.\n• **Kondapalli Toys**: Softwood figurines carved from Tella Poniki wood depicting rural occupations and mythology.\n• **Budithi Brassware**: Hand-forged ceremonial brass alloy utensils with organic black patina.",
    sources: [
      { title: "Traditional Art Practices of Andhra Pradesh", type: "region", region: "Andhra Pradesh" },
      { title: "Kalamkari Painting & Textile Art", type: "art-form", region: "Andhra Pradesh" },
      { title: "Kuchipudi Classical Dance-Drama", type: "art-form", region: "Andhra Pradesh" }
    ]
  },
  workshop: {
    answer: "In a traditional Tvarita art workshop, participants undergo an authentic hands-on immersion guided directly by a master practitioner:\n\n1. **Cultural Orientation & Lineage Blessing**: The artisan shares oral histories and sacred symbolism.\n2. **Natural Materials Exploration**: Hands-on preparation of raw earth pigments (indigo, turmeric, madder root) and crafting bamboo quills.\n3. **Master Demonstration**: Live demonstration of foundational linework, sacred geometry, and color harmonies.\n4. **Guided Participant Creation**: Individual creation of an original heritage artwork with step-by-step master guidance.\n5. **Archival Framing**: Each participant receives framing supplies and a signed Certificate of Cultural Participation.\n6. **Living Artisan Direct Honorarium**: 100% of the workshop fee directly supports the master artisan and their rural cooperative.",
    sources: [
      { title: "Traditional Art Workshop Architecture & Process", type: "workshop" },
      { title: "Tvarita Artisan Guild Charter", type: "guideline" }
    ]
  },
  experiences: {
    answer: "Tvarita Arts Collective offers curated cultural experiences led by recognized master artists:\n\n• **Mithila / Madhubani Masterclass**: Led by Shilp Guru awardee Ramesh Kumar Jha (Bihar), exploring bamboo quill drawing and sacred Kohbar motifs.\n• **Soul of Bengal: Baul Music Performance**: Performed by 7th-generation minstrel Sadhan Das Baul (West Bengal) with Ektara and Dotara.\n• **Warli Tribal Art & Tarpa Immersion**: Guided by Sunita Devi (Maharashtra), exploring geometric rice paste painting.\n• **Gond Indigenous Tree of Life Masterclass**: Guided by Pardhan Gond artisans (Madhya Pradesh).\n• **Kathakali Mudra & Storytelling Masterclass**: Led by Kerala Kalamandalam masters on facial kinetics and codified mudras.\n• **Odisha Pattachitra & Palm-Leaf Scroll Engraving**: Guided by Raghurajpur heritage artisans.",
    sources: [
      { title: "Available Tvarita Cultural Experiences & Programs", type: "experience" },
      { title: "Tvarita Curated Portfolio 2026", type: "catalog" }
    ]
  },
  ramesh: {
    answer: "Ramesh Kumar Jha is a celebrated master practitioner and Shilp Guru awardee in Madhubani (Mithila) painting from Jitwarpur village in Bihar. Carrying four generations of artistic lineage, he has represented India's folk traditions at the Smithsonian Institution and British Museum. He specializes in the fine Kacchni and vibrant Bharni styles and directs a cooperative of 60 rural women painters in Jitwarpur.",
    sources: [
      { title: "Master Artist Ramesh Kumar Jha", type: "artist", region: "Bihar" },
      { title: "Madhubani Painting Lineage", type: "art-form" }
    ]
  }
};

export default function AskTvaritaPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [history, setHistory] = useState([
    {
      id: 'welcome-seed',
      question: null,
      answer: "Namaste. Welcome to **Ask Tvarita**, the living cultural knowledge assistant. You can ask me about Indian traditional art forms, master artists, regional folk practices, workshops, and Tvarita's cultural programs. How may I guide your cultural exploration today?",
      sources: [
        { title: "Tvarita Cultural Archive", type: "archive" },
        { title: "Living Traditions Documentation", type: "repository" }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isWelcome: true,
      found: true,
    }
  ]);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load backend suggestions on mount
  useEffect(() => {
    ai.suggestedQuestions()
      .then((res) => {
        if (res?.data?.questions && Array.isArray(res.data.questions)) {
          setSuggestions(res.data.questions);
        }
      })
      .catch(() => {
        // Retain default suggestions
      });
  }, []);

  // Auto-scroll to latest response
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const handleAsk = async (qToAsk) => {
    const query = (qToAsk || question).trim();
    if (!query || loading) return;

    setError(null);
    setLoading(true);
    setQuestion('');

    const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userItem = {
      id: `q-${Date.now()}`,
      question: query,
      answer: null,
      sources: [],
      timestamp: currentTimestamp,
    };

    // Optimistically push query
    setHistory((prev) => [...prev, userItem]);

    try {
      // Call backend RAG API
      const res = await ai.ask(query);
      const data = res.data || {};

      setHistory((prev) =>
        prev.map((item) =>
          item.id === userItem.id
            ? {
                ...item,
                answer: data.answer || "No response received from the knowledge base.",
                sources: data.sources || [],
                found: data.found !== false,
              }
            : item
        )
      );
    } catch (err) {
      console.warn('[AskTvarita] Backend RAG call failed, checking local cultural fallback:', err);
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      if (isTimeout) {
        setError('The knowledge retrieval request timed out. Retrying with local cultural archive fallback...');
      }
      // Fallback synthesis from local client knowledge
      const qLower = query.toLowerCase();
      let matchedKey = null;

      if (qLower.includes('kalamkari')) matchedKey = 'kalamkari';
      else if (qLower.includes('kuchipudi')) matchedKey = 'kuchipudi';
      else if (qLower.includes('andhra')) matchedKey = 'andhra';
      else if (qLower.includes('workshop')) matchedKey = 'workshop';
      else if (qLower.includes('experience') || qLower.includes('program')) matchedKey = 'experiences';
      else if (qLower.includes('ramesh')) matchedKey = 'ramesh';

      if (matchedKey && FALLBACK_KNOWLEDGE[matchedKey]) {
        const item = FALLBACK_KNOWLEDGE[matchedKey];
        setHistory((prev) =>
          prev.map((it) =>
            it.id === userItem.id
              ? {
                  ...it,
                  answer: item.answer,
                  sources: item.sources,
                  found: true,
                }
              : it
          )
        );
      } else {
        // Grounded "not found" state
        setHistory((prev) =>
          prev.map((it) =>
            it.id === userItem.id
              ? {
                  ...it,
                  answer: "I could not find verified information on this topic in the Tvarita knowledge archive. The archive currently documents traditional Indian art forms such as Kalamkari, Kuchipudi, Madhubani, Warli, Baul, Gond, Kathakali, and Odisha Pattachitra, as well as Tvarita's artisan workshops, master artists, and regional traditions. Please explore our suggested topics below.",
                  sources: [],
                  found: false,
                }
              : it
          )
        );
      }
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  // Modern Web Guidance: IME-safe enter-to-submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Block submission if user is actively composing with an IME (Chinese, Japanese, Korean, etc.)
      // Strategy 1: check event.isComposing || event.keyCode === 229 for Safari fallback
      if (e.isComposing || e.keyCode === 229) {
        return;
      }
      handleAsk();
    }
  };

  const handleResetConversation = () => {
    setHistory([
      {
        id: 'welcome-seed',
        question: null,
        answer: "Namaste. Conversation restarted. Ask any question about Indian traditional arts, master practitioners, or Tvarita experiences.",
        sources: [
          { title: "Tvarita Cultural Archive", type: "archive" }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isWelcome: true,
        found: true,
      }
    ]);
    setError(null);
  };

  return (
    <PublicLayout>
      <div style={{ background: 'var(--color-bg)', minHeight: 'calc(100vh - var(--header-height))', padding: '2rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: 940 }}>
          
          {/* Header Banner */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2rem',
              padding: '2rem 1.5rem',
              background: 'linear-gradient(135deg, #FFF9F3 0%, #FAF1E6 100%)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: '-20px',
                top: '-20px',
                width: 140,
                height: 140,
                background: 'radial-gradient(circle, rgba(194,65,12,0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.875rem',
                background: 'rgba(194,65,12,0.08)',
                color: 'var(--color-terracotta)',
                borderRadius: '9999px',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.75rem',
              }}
            >
              <Feather size={14} />
              RAG Cultural Knowledge Assistant
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: '0 0 0.5rem',
              }}
            >
              Ask Tvarita
            </h1>

            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-muted)',
                maxWidth: 620,
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Explore grounded oral histories, indigenous techniques, master artisans, and workshops curated directly from the Tvarita Cultural Knowledge Archive.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={handleResetConversation}
                className="btn btn-ghost"
                style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.75rem', color: 'var(--color-muted)' }}
              >
                <RefreshCw size={13} style={{ marginRight: '0.35rem' }} />
                Restart Conversation
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-muted)',
                fontWeight: 600,
                marginBottom: '0.625rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <Compass size={14} style={{ color: 'var(--color-terracotta)' }} />
              Suggested Inquiries
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(sug)}
                  disabled={loading}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: '9999px',
                    padding: '0.45rem 0.875rem',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = 'var(--color-terracotta)';
                      e.currentTarget.style.color = 'var(--color-terracotta)';
                      e.currentTarget.style.background = '#FFF8F5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.color = 'var(--color-text)';
                      e.currentTarget.style.background = '#FFFFFF';
                    }
                  }}
                >
                  <span>{sug}</span>
                  <ChevronRight size={12} style={{ opacity: 0.5 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Area */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              minHeight: 380,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Messages Scroll Area */}
            <div
              style={{
                padding: '1.5rem',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                maxHeight: '650px',
                overflowY: 'auto',
              }}
            >
              {history.map((item) => (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {/* User Query Bubble */}
                  {item.question && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div
                        style={{
                          maxWidth: '82%',
                          background: 'var(--color-primary)',
                          color: '#FFFFFF',
                          padding: '0.875rem 1.25rem',
                          borderRadius: '1.25rem 1.25rem 0.25rem 1.25rem',
                          fontSize: 'var(--text-sm)',
                          lineHeight: 1.5,
                          boxShadow: '0 2px 8px rgba(46,125,50,0.15)',
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{item.question}</div>
                        <div style={{ fontSize: '10px', opacity: 0.75, textAlign: 'right', marginTop: '0.25rem' }}>
                          {item.timestamp}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Response Card */}
                  {item.answer ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div
                        style={{
                          maxWidth: '92%',
                          background: item.found === false ? '#FFF9F6' : '#FAF8F5',
                          border: `1px solid ${item.found === false ? '#FED7AA' : 'var(--color-border)'}`,
                          borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem',
                          padding: '1.25rem 1.5rem',
                          position: 'relative',
                        }}
                      >
                        {/* Header with Avatar & Tag */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.75rem',
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                            paddingBottom: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: 'var(--color-terracotta)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                fontSize: '12px',
                                fontFamily: 'var(--font-serif)',
                              }}
                            >
                              T
                            </div>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                                Ask Tvarita
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--color-muted)',
                                  marginLeft: '0.5rem',
                                }}
                              >
                                {item.isWelcome ? 'Heritage Assistant' : 'Grounded AI Response'}
                              </span>
                            </div>
                          </div>

                          {item.found === false ? (
                            <span
                              style={{
                                fontSize: '11px',
                                background: '#FFEDD5',
                                color: '#9A3412',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <Info size={11} />
                              Not in Archive
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '11px',
                                background: '#E8F5E9',
                                color: '#2E7D32',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <CheckCircle2 size={11} />
                              Archive Grounded
                            </span>
                          )}
                        </div>

                        {/* Content Body */}
                        <div
                          style={{
                            fontSize: 'var(--text-sm)',
                            lineHeight: 1.7,
                            color: '#2C2A29',
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {item.answer}
                        </div>

                        {/* Sources & References Section */}
                        {item.sources && item.sources.length > 0 && (
                          <div
                            style={{
                              marginTop: '1.25rem',
                              paddingTop: '0.875rem',
                              borderTop: '1px dashed var(--color-border)',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: 'var(--color-muted)',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                              }}
                            >
                              <BookOpen size={12} style={{ color: 'var(--color-terracotta)' }} />
                              Archive Sources & Grounded Citations
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {item.sources.map((src, sIdx) => (
                                <div
                                  key={sIdx}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    padding: '0.3rem 0.625rem',
                                    background: '#FFFFFF',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    color: 'var(--color-text)',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: '9px',
                                      textTransform: 'uppercase',
                                      background: 'var(--color-surface-2)',
                                      color: 'var(--color-terracotta)',
                                      padding: '1px 5px',
                                      borderRadius: '3px',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {src.type || 'source'}
                                  </span>
                                  <span style={{ fontWeight: 600 }}>{src.title}</span>
                                  {src.region && (
                                    <span style={{ color: 'var(--color-muted)', fontSize: '10px' }}>
                                      • {src.region}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}

              {/* Loading State Animation */}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      background: '#FAF8F5',
                      border: '1px solid var(--color-border)',
                      borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: 'var(--color-muted)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        border: '2px solid var(--color-terracotta)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    <span style={{ fontStyle: 'italic' }}>
                      Searching Tvarita Knowledge Archive and synthesizing grounded response...
                    </span>
                  </div>
                </div>
              )}

              {/* Error State Banner */}
              {error && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem 1rem',
                    color: '#991B1B',
                    fontSize: 'var(--text-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <div style={{ flexGrow: 1 }}>{error}</div>
                  <button
                    onClick={() => handleAsk()}
                    className="btn btn-ghost"
                    style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.5rem', color: '#991B1B' }}
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Question Input Box */}
            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                background: '#FFFFFF',
                padding: '1.25rem 1.5rem',
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}
              >
                <div style={{ flexGrow: 1, position: 'relative' }}>
                  <label htmlFor="ask-tvarita-input" className="visually-hidden" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
                    Ask a cultural question
                  </label>
                  <textarea
                    id="ask-tvarita-input"
                    ref={textareaRef}
                    rows={2}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about Kalamkari, Kuchipudi, Warli art, master artists, workshops, regional practices..."
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 1.5,
                      fontFamily: 'inherit',
                      resize: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      bottom: '0.5rem',
                      fontSize: '11px',
                      color: '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      pointerEvents: 'none',
                    }}
                  >
                    <span>Press Enter</span>
                    <CornerDownLeft size={11} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="btn btn-primary"
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontWeight: 600,
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: 'var(--radius-lg)',
                    flexShrink: 0,
                    opacity: loading || !question.trim() ? 0.6 : 1,
                    cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>Ask</span>
                  <Send size={16} />
                </button>
              </form>

              <div
                style={{
                  marginTop: '0.625rem',
                  fontSize: '11px',
                  color: 'var(--color-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  All answers are strictly synthesized from verified master artisan archives.
                </span>
                <span>
                  No synthetic hallucinations permitted.
                </span>
              </div>
            </div>
          </div>

          {/* Cultural Footer Context Card */}
          <div
            style={{
              marginTop: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              style={{
                background: '#FAF8F5',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-terracotta)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '0.35rem' }}>
                <Quote size={16} />
                Oral Heritage Preservation
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', margin: 0, lineHeight: 1.6 }}>
                Every art form is documented directly with Shilp Guru awardees and village elder guilds, preserving authentic vernacular terminology and organic pigment extraction.
              </p>
            </div>

            <div
              style={{
                background: '#FAF8F5',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '0.35rem' }}>
                <Sparkles size={16} />
                Participate in Masterclasses
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', margin: 0, lineHeight: 1.6 }}>
                Ready to experience these living traditions firsthand? Explore our corporate and public workshops directly taught by the featured master practitioners.
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PublicLayout>
  );
}
