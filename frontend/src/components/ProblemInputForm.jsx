export default function ProblemInputForm({ value, onChange, onSubmit }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSubmit()
  }

  const charCount = value.length
  const isNearLimit = charCount > 800

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. Given an array of integers, find two numbers that add up to a target sum. Return their indices."
        rows={3}
        className="input w-full resize-none pr-16 text-[13px] leading-relaxed"
        style={{ minHeight: '82px' }}
      />
      {/* Char count */}
      {charCount > 0 && (
        <span className="absolute right-3 bottom-2.5 text-[10px] font-mono pointer-events-none"
          style={{ color: isNearLimit ? '#f87171' : 'rgba(100,116,139,0.6)' }}>
          {charCount}
        </span>
      )}
      <p className="text-[11px] mt-1.5 flex items-center gap-1.5" style={{ color: 'rgba(100,116,139,0.5)' }}>
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Press Ctrl+Enter to generate
      </p>
    </div>
  )
}
