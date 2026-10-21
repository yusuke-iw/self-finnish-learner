import React from 'react';

export default function MatchingQuestion({ question, selectedTokens, matchedPairIds, wrongMatch, isChecking, onTokenClick }) {
  return (
    <div className="matching-grid">
      {question.tokens.map((token, idx) => {
        const isMatched = matchedPairIds.includes(token.id);
        const isSelected = selectedTokens.includes(token);
        const isWrong = isSelected && wrongMatch;

        return (
          <button
            key={`${token.id}-${token.lang}-${idx}`}
            className={`choice-btn matching-token-btn ${isSelected ? 'selected' : ''} ${isMatched ? 'correct-choice matched' : ''} ${isWrong ? 'wrong-choice' : ''}`}
            onClick={() => onTokenClick(token)}
            disabled={isMatched || isChecking}
          >
            {token.text}
          </button>
        );
      })}
    </div>
  );
}
