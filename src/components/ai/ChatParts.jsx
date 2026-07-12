export function ChatBubble({ role, children }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
          ${isUser
            ? 'bg-ink-900 text-paper-50 dark:bg-signal dark:text-ink-950 rounded-br-sm'
            : 'bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-800 dark:text-paper-100 rounded-bl-sm'}`}
      >
        {children}
      </div>
    </div>
  );
}

export function SuggestedQuestion({ text, onClick }) {
  return (
    <button
      onClick={() => onClick(text)}
      className="rounded-full border border-ink-200/70 dark:border-ink-600 px-3.5 py-1.5 text-xs text-ink-600 dark:text-paper-200 hover:border-transit hover:text-transit-dark dark:hover:text-transit-light transition-colors"
    >
      {text}
    </button>
  );
}
