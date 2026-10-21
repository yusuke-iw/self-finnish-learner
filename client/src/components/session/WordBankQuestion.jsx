import React from 'react';

export default function WordBankQuestion({ question, selectedWords, feedback, onToggleWord }) {
  return (
    <div className="word-bank-area">
      <div className={`word-bank-answer ${selectedWords.length > 0 ? 'has-words' : ''}`}>
        {selectedWords.map((wordIdx, idx) => {
          const word = question.wordBank[wordIdx];
          return (
            <span key={idx} className="word-chip in-slot" onClick={() => !feedback && onToggleWord(word, wordIdx)}>{word}</span>
          );
        })}
      </div>
      <div className="word-bank-pool">
        {question.wordBank.map((word, idx) => (
          <span
            key={idx}
            className={`word-chip ${selectedWords.includes(idx) ? 'in-answer' : ''}`}
            onClick={() => !feedback && onToggleWord(word, idx)}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
