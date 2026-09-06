import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { grammarTopics, GRAMMAR_CATEGORIES } from '../data/grammarData';
import { playAudio } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';
import '../assets/App.css';

function GrammarDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const topic = grammarTopics.find((t) => t.id === topicId);

  const [activeTab, setActiveTab] = useState('explanation');
  
  // Interactive quiz state
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!topic) {
    return (
      <div className="grammar-detail-container">
        <h2>{t('grammarDetail.notFound')}</h2>
        <button className="back-btn" onClick={() => navigate('/grammar')}>
          {t('grammarDetail.backToHub')}
        </button>
      </div>
    );
  }

  const categoryObj = GRAMMAR_CATEGORIES.find((c) => c.id === topic.category);

  const handleOptionSelect = (qIndex, option) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qIndex]: option
    }));
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    let calculatedScore = 0;
    topic.practiceQuiz.forEach((q, idx) => {
      if (userAnswers[idx] && userAnswers[idx].trim().toLowerCase() === q.answer.trim().toLowerCase()) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setSubmitted(true);
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div className="grammar-detail-container">
      {/* Top Bar Navigation */}
      <button className="back-btn" onClick={() => navigate('/grammar')}>
        ← 文法・イディオム一覧に戻る
      </button>

      {/* Hero Header */}
      <div className="grammar-detail-header">
        <div className="header-meta">
          <span className={`level-badge level-${topic.level.toLowerCase()}`}>
            {topic.level}
          </span>
          <span className="category-tag">
            {categoryObj ? categoryObj.label : topic.category}
          </span>
        </div>
        <h1 className="topic-title">{topic.title}</h1>
        <p className="topic-summary">{topic.summary}</p>
      </div>

      {/* Main Content Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'explanation' ? 'active' : ''}`}
          onClick={() => setActiveTab('explanation')}
        >
          📖 解説・ルール
        </button>
        <button
          className={`tab-btn ${activeTab === 'examples' ? 'active' : ''}`}
          onClick={() => setActiveTab('examples')}
        >
          🔊 例文と発音 ({topic.examples.length})
        </button>
        {(topic.pitfalls.length > 0 || topic.idioms.length > 0) && (
          <button
            className={`tab-btn ${activeTab === 'pitfalls' ? 'active' : ''}`}
            onClick={() => setActiveTab('pitfalls')}
          >
            💡 注意点・イディオム ({topic.pitfalls.length + topic.idioms.length})
          </button>
        )}
        <button
          className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          ✏️ 確認テスト ({topic.practiceQuiz.length}問)
        </button>
      </div>

      {/* Tab 1: Explanation */}
      {activeTab === 'explanation' && (
        <div className="tab-content-panel">
          <section className="overview-section">
            <h3>概要とルール</h3>
            <div className="formatted-overview">
              {topic.overview.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {topic.rules && topic.rules.length > 0 && (
            <section className="rules-section">
              <h3>基本法則</h3>
              <div className="rules-grid">
                {topic.rules.map((rule, idx) => (
                  <div key={idx} className="rule-card">
                    <h4 className="rule-title">🔹 {rule.title}</h4>
                    <p className="rule-desc">{rule.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {topic.table && (
            <section className="table-section">
              <h3>活用・変化一覧表</h3>
              <div className="table-wrapper">
                <table className="grammar-table">
                  <thead>
                    <tr>
                      {topic.table.headers.map((h, idx) => (
                        <th key={idx}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topic.table.rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Tab 2: Examples */}
      {activeTab === 'examples' && (
        <div className="tab-content-panel">
          <h3>実践例文（Native Finnish Audio）</h3>
          <p className="section-subtitle">スピーカーアイコンを押すとフィンランド語の発音（TTS）が確認できます。</p>
          <div className="examples-list">
            {topic.examples.map((ex, idx) => (
              <div key={idx} className="example-card">
                <div className="example-main">
                  <span className="finnish-text">{ex.finnish}</span>
                  <button
                    className="audio-play-btn"
                    title="発音を聞く"
                    onClick={() => playAudio(ex.finnish)}
                  >
                    🔊
                  </button>
                </div>
                <div className="example-translations">
                  {language === 'ja' ? (
                    <>
                      <p className="japanese-text">🇯🇵 {ex.japanese}</p>
                      {ex.english && <p className="english-text">🇬🇧 {ex.english}</p>}
                    </>
                  ) : (
                    <>
                      <p className="english-text" style={{ fontSize: '1.05rem', fontWeight: 600 }}>🇬🇧 {ex.english || ex.japanese}</p>
                      {ex.japanese && <p className="japanese-text" style={{ opacity: 0.8 }}>🇯🇵 {ex.japanese}</p>}
                    </>
                  )}
                </div>
                {ex.note && <div className="example-note">{t('grammarDetail.pointLabel')} {ex.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Pitfalls & Idioms */}
      {activeTab === 'pitfalls' && (
        <div className="tab-content-panel">
          {topic.pitfalls.length > 0 && (
            <section className="pitfalls-section">
              <h3>間違えやすいポイント・例外ルール</h3>
              <div className="pitfalls-list">
                {topic.pitfalls.map((pit, idx) => (
                  <div key={idx} className="pitfall-card">
                    <h4 className="pitfall-title">⚠️ {pit.title}</h4>
                    <p className="pitfall-explanation">{pit.explanation}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {topic.idioms.length > 0 && (
            <section className="idioms-section">
              <h3>関連する主要イディオム・定型表現</h3>
              <div className="idiom-grid">
                {topic.idioms.map((idm, idx) => (
                  <div key={idx} className="idiom-card">
                    <div className="idiom-header">
                      <span className="idiom-phrase">{idm.phrase}</span>
                      <button
                        className="audio-play-btn"
                        onClick={() => playAudio(idm.phrase)}
                      >
                        🔊
                      </button>
                    </div>
                    <p className="idiom-meaning">👉 意味: {idm.meaning}</p>
                    <p className="idiom-example">例: {idm.example}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Tab 4: Interactive Practice Quiz */}
      {activeTab === 'quiz' && (
        <div className="tab-content-panel">
          <div className="quiz-header">
            <div className="quiz-header-title-row">
              <div>
                <h3>✏️ 確認テスト: {topic.title}</h3>
                <p>このテーマで学んだ知識をテストしてみましょう。</p>
              </div>
              <button
                type="button"
                className="drill-studio-link-btn"
                onClick={() => navigate(`/grammar/practice?topic=${topic.id}`)}
              >
                🎯 演習スタジオで特訓 ➔
              </button>
            </div>
          </div>

          <form onSubmit={handleQuizSubmit} className="grammar-quiz-form">
            {topic.practiceQuiz.map((q, idx) => (
              <div key={idx} className="quiz-item-card">
                <h4 className="quiz-question">
                  問 {idx + 1}. {q.question}
                </h4>

                {q.type === 'choice' && (
                  <div className="quiz-options-list">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[idx] === opt;
                      let btnClass = 'quiz-option-btn';
                      if (submitted) {
                        if (opt === q.answer) btnClass += ' correct';
                        else if (isSelected) btnClass += ' wrong';
                      } else if (isSelected) {
                        btnClass += ' selected';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          className={btnClass}
                          onClick={() => handleOptionSelect(idx, opt)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'wordbank' && (
                  <div className="quiz-wordbank">
                    <div className="wordbank-words">
                      {q.words.map((w, wIdx) => {
                        const isSelected = userAnswers[idx] === w;
                        let btnClass = 'word-chip';
                        if (submitted) {
                          if (w === q.answer) btnClass += ' correct';
                          else if (isSelected) btnClass += ' wrong';
                        } else if (isSelected) {
                          btnClass += ' selected';
                        }

                        return (
                          <button
                            key={wIdx}
                            type="button"
                            className={btnClass}
                            onClick={() => handleOptionSelect(idx, w)}
                          >
                            {w}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {q.type === 'typing' && (
                  <div className="quiz-typing-box">
                    <div className="typing-input-wrapper">
                      <input
                        type="text"
                        className="quiz-text-input"
                        placeholder={q.hint || 'フィンランド語を入力...'}
                        value={userAnswers[idx] || ''}
                        disabled={submitted}
                        onChange={(e) => handleOptionSelect(idx, e.target.value)}
                      />
                      {!submitted && (
                        <div className="char-helper-buttons">
                          {['ä', 'ö', 'Ä', 'Ö'].map((ch) => (
                            <button
                              key={ch}
                              type="button"
                              className="char-btn"
                              onClick={() => {
                                const current = userAnswers[idx] || '';
                                handleOptionSelect(idx, current + ch);
                              }}
                            >
                              {ch}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {submitted && (
                  <div className={`quiz-feedback ${String(userAnswers[idx] || '').trim().toLowerCase() === String(q.answer).trim().toLowerCase() ? 'correct-feed' : 'wrong-feed'}`}>
                    <p className="feedback-result">
                      {String(userAnswers[idx] || '').trim().toLowerCase() === String(q.answer).trim().toLowerCase() ? '✅ 正解！' : `❌ 不正解（正解: ${q.answer}）`}
                    </p>
                    <p className="feedback-explanation">💡 {q.explanation}</p>
                  </div>
                )}
              </div>
            ))}

            {!submitted ? (
              <button
                type="submit"
                className="submit-quiz-btn"
                disabled={Object.keys(userAnswers).length < topic.practiceQuiz.length}
              >
                回答を送信する
              </button>
            ) : (
              <div className="quiz-result-summary">
                <h4>
                  🎉 結果: {topic.practiceQuiz.length}問中 {score}問正解！
                </h4>
                <button type="button" className="reset-quiz-btn" onClick={handleResetQuiz}>
                  もう一度挑戦する
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default GrammarDetail;
