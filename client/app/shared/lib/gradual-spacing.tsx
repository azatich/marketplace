'use client';

import { AnimatePresence, motion, useInView } from 'framer-motion';
import * as React from 'react';

// Описываем структуру "кусочка" текста
export type TextSegment = {
  text?: string;
  className?: string;
  isBreak?: boolean;
};

type GradualSpacingProps = {
  segments: TextSegment[];
  className?: string;
};

export function GradualSpacing({ segments, className = '' }: GradualSpacingProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  let globalCharIndex = 0;

  return (
    <h1 className={`flex flex-wrap justify-center ${className}`}>
      <AnimatePresence>
        {segments.map((segment, segIndex) => {
          // Если это перенос строки (<br />)
          if (segment.isBreak) {
            return (
              <div 
                key={`br-${segIndex}`} 
                className="basis-full h-0 hidden md:block" 
              />
            );
          }

          const words = segment.text?.split(/(\s+)/) || [];

          return (
            // Обертка сегмента (сюда применяется твой градиент)
            <span key={segIndex} className={segment.className}>
              {words.map((word, wordIndex) => (
                <span key={wordIndex} className="inline-flex">
                  {word.split('').map((char, charIndex) => {
                    // Чуть уменьшили задержку (0.05), чтобы длинный заголовок не грузился слишком долго
                    const delay = globalCharIndex * 0.05; 
                    globalCharIndex++;
                    
                    return (
                      <motion.span
                        ref={ref}
                        key={charIndex}
                        initial={{ opacity: 0, x: -18 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        exit="hidden"
                        transition={{ duration: 0.5, delay }}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </motion.span>
                    );
                  })}
                </span>
              ))}
            </span>
          );
        })}
      </AnimatePresence>
    </h1>
  );
}