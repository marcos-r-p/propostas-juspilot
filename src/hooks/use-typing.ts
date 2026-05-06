'use client';

import { useEffect, useState } from 'react';

interface UseTypingOptions {
  charDelay?: number;
  commaDelay?: number;
  periodDelay?: number;
  enabled?: boolean;
}

export function useTyping(text: string, options: UseTypingOptions = {}) {
  const { charDelay = 25, commaDelay = 80, periodDelay = 100, enabled = false } = options;
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [printing, setPrinting] = useState(false);

  // Print event: jump straight to full text so PDF shows complete subtitle
  useEffect(() => {
    const onBefore = () => setPrinting(true);
    const onAfter = () => setPrinting(false);
    window.addEventListener('beforeprint', onBefore);
    window.addEventListener('afterprint', onAfter);
    return () => {
      window.removeEventListener('beforeprint', onBefore);
      window.removeEventListener('afterprint', onAfter);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !text) return;

    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    function typeNext() {
      if (index >= text.length) {
        setIsDone(true);
        return;
      }

      index++;
      setDisplayText(text.slice(0, index));

      const char = text[index - 1];
      const delay = char === ',' ? commaDelay : char === '.' ? periodDelay : charDelay;
      timeoutId = setTimeout(typeNext, delay);
    }

    typeNext();

    return () => clearTimeout(timeoutId);
  }, [text, charDelay, commaDelay, periodDelay, enabled]);

  return {
    displayText: printing ? text : displayText,
    isDone: printing ? true : isDone,
  };
}
