import { useRef, useState, useEffect } from 'react';
import { FiSend, FiCpu } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import { ChatBubble, SuggestedQuestion } from '../components/ai/ChatParts';

const SUGGESTED = [
  'Which vehicle has the highest maintenance cost?',
  'Show available vehicles.',
  'Recommend a vehicle for 450 kg cargo.',
  "Give today's fleet summary.",
];

// Placeholder replies — swap for a real call to `/ai/copilot` once the backend AI module is live.
const MOCK_REPLIES = {
  'Which vehicle has the highest maintenance cost?':
    'PB44 JK 3390 (Force Traveller) has the highest maintenance spend this quarter at ₹18,500, driven by an engine overhaul completed on 1 Jul.',
  'Show available vehicles.':
    'You have 27 available vehicles right now: 11 trucks, 9 vans, and 7 pickups. PB10 AB 4521 and PB02 XY 5567 have been idle longest.',
  'Recommend a vehicle for 450 kg cargo.':
    'PB65 CT 9087 (Tata Ace Gold, 750 kg capacity) is recommended — it is available, has sufficient headroom above 450 kg, and the lowest operational cost per km among vans currently free.',
  "Give today's fleet summary.":
    "Good morning. 27 vehicles are available, 5 are in maintenance, and 1 driver's license expires within 30 days. Estimated fleet utilization today is 72%.",
};

export default function FleetAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Ask me anything about your fleet — vehicles, drivers, trips, or costs.' },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text) => {
    const question = text ?? input;
    if (!question.trim()) return;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const reply = MOCK_REPLIES[question] || "I'll be able to answer that once connected to your live fleet data — for now, try one of the suggested questions below.";
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
      setThinking(false);
    }, 900);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="AI COPILOT"
        title="Fleet Assistant"
        description="Natural-language answers, grounded in your fleet's live data."
      />

      <Card className="flex h-[65vh] flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto scrollbar-thin p-5">
          {messages.map((m, i) => (
            <ChatBubble key={i} role={m.role}>{m.text}</ChatBubble>
          ))}
          {thinking && (
            <ChatBubble role="assistant">
              <span className="flex items-center gap-2 text-ink-400">
                <FiCpu className="animate-pulse" size={14} /> Thinking…
              </span>
            </ChatBubble>
          )}
        </div>

        <div className="border-t border-ink-100 dark:border-ink-700 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED.map((q) => (
              <SuggestedQuestion key={q} text={q} onClick={send} />
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a vehicle, driver, trip, or cost…"
              className="flex-1 rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-transit"
            />
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal text-ink-950 hover:bg-signal-dark transition-colors"
              aria-label="Send message"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
