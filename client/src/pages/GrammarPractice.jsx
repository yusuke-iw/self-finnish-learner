import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGrammarPractice } from '../hooks/useGrammarPractice';
import GrammarSetup from '../components/grammar/GrammarSetup';
import GrammarSessionView from '../components/grammar/GrammarSessionView';
import GrammarSummary from '../components/grammar/GrammarSummary';
import '../assets/App.css';

function GrammarPractice() {
  const navigate = useNavigate();
  const g = useGrammarPractice();

  return (
    <div className="grammar-practice-container">
      {g.mode === 'setup' && (
        <GrammarSetup
          mistakeCount={g.mistakeBank.length}
          dueMistakeCount={g.dueMistakeCount}
          selectedCategory={g.selectedCategory}
          selectedTopic={g.selectedTopic}
          selectedType={g.selectedType}
          questionCount={g.questionCount}
          onSelectCategory={(id) => {
            g.setSelectedCategory(id);
            g.setSelectedTopic('all');
          }}
          onSelectTopic={g.setSelectedTopic}
          onSelectType={g.setSelectedType}
          onSelectCount={g.setQuestionCount}
          onStart={() => g.handleStartDrill(false)}
          onStartWeakness={g.handleStartWeaknessDrill}
          onBack={() => navigate('/grammar')}
        />
      )}

      {g.mode === 'session' && g.currentQ && (
        <GrammarSessionView
          question={g.currentQ}
          index={g.currentIndex}
          total={g.questions.length}
          streak={g.streak}
          answer={g.currentAnswer}
          isSubmitted={g.isSubmitted}
          isCorrect={g.isCorrect}
          onAnswerChange={g.setCurrentAnswer}
          onInsertChar={g.handleInsertChar}
          onSubmit={g.handleSubmitAnswer}
          onNext={g.handleNextQuestion}
          onKeyDown={g.handleKeyDown}
          onExit={() => g.setMode('setup')}
        />
      )}

      {g.mode === 'summary' && (
        <GrammarSummary
          score={g.score}
          total={g.questions.length}
          maxStreak={g.maxStreak}
          elapsedTime={g.elapsedTime}
          mistakes={g.sessionMistakes}
          onRetryWeakness={g.handleStartWeaknessDrill}
          onRetry={() => g.handleStartDrill(false)}
          onChangeSettings={() => g.setMode('setup')}
          onBackToHub={() => navigate('/grammar')}
        />
      )}
    </div>
  );
}

export default GrammarPractice;
