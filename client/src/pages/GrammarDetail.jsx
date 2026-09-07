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

  const topicTitle = language === 'en' && topic.titleEn ? topic.titleEn : topic.title;
  const topicSummary = language === 'en' && topic.summaryEn ? topic.summaryEn : topic.summary;
  const overviewText = language === 'en' && topic.overviewEn ? topic.overviewEn : topic.overview;
  const rulesList = language === 'en' && topic.rulesEn ? topic.rulesEn : topic.rules;
  const tableData = language === 'en' && topic.tableEn ? topic.tableEn : topic.table;
  const pitfallsList = language === 'en' && topic.pitfallsEn ? topic.pitfallsEn : topic.pitfalls;
  const idiomsList = language === 'en' && topic.idiomsEn ? topic.idiomsEn : (topic.idioms || []);

  return (
    <div className="grammar-detail-container">
      {/* Top Bar Navigation */}
      <button className="back-btn" onClick={() => navigate('/grammar')}>
        {t('grammarDetail.backToHub')}
      </button>

      {/* Hero Header */}
      <div className="grammar-detail-header">
        <div className="header-meta">
          <span className={`level-badge level-${topic.level.toLowerCase()}`}>
            {topic.level}
          </span>
          <span className="category-tag">
            {language === 'en'
              ? t(`grammarCategories.${topic.category}`)
              : (categoryObj ? categoryObj.label : topic.category)}
          </span>
        </div>
        <h1 className="topic-title">{topicTitle}</h1>
        <p className="topic-summary">{topicSummary}</p>
      </div>

      {/* Main Content Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'explanation' ? 'active' : ''}`}
          onClick={() => setActiveTab('explanation')}
        >
          {t('grammarDetail.tabRules')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'examples' ? 'active' : ''}`}
          onClick={() => setActiveTab('examples')}
        >
          {t('grammarDetail.tabExamples')} ({topic.examples.length})
        </button>
        {(pitfallsList.length > 0 || idiomsList.length > 0) && (
          <button
            className={`tab-btn ${activeTab === 'pitfalls' ? 'active' : ''}`}
            onClick={() => setActiveTab('pitfalls')}
          >
            {t('grammarDetail.tabPitfalls')} ({pitfallsList.length + idiomsList.length})
          </button>
        )}
        <button
          className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          {t('grammarDetail.tabQuiz', { count: topic.practiceQuiz.length })}
        </button>
      </div>

      {/* Tab 1: Explanation */}
      {activeTab === 'explanation' && (
        <div className="tab-content-panel">
          <section className="overview-section">
            <h3>{t('grammarDetail.overviewTitle')}</h3>
            <div className="formatted-overview">
              {overviewText.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {rulesList && rulesList.length > 0 && (
            <section className="rules-section">
              <h3>{t('grammarDetail.rulesTitle')}</h3>
              <div className="rules-grid">
                {rulesList.map((rule, idx) => (
                  <div key={idx} className="rule-card">
                    <h4 className="rule-title">🔹 {rule.title}</h4>
                    <p className="rule-desc">{rule.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tableData && (
            <section className="table-section">
              <h3>{t('grammarDetail.tableTitle')}</h3>
              <div className="table-wrapper">
                <table className="grammar-table">
                  <thead>
                    <tr>
                      {tableData.headers.map((h, idx) => (
                        <th key={idx}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, rIdx) => (
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
          <h3>{t('grammarDetail.examplesTitle')}</h3>
          <p className="section-subtitle">{t('grammarDetail.examplesSubtitle')}</p>
          <div className="examples-list">
            {topic.examples.map((ex, idx) => {
              const exNote = (language === 'en' && ex.noteEn) ? ex.noteEn : ex.note;

              return (
                <div key={idx} className="example-card">
                  <div className="example-main">
                    <span className="finnish-text">{ex.finnish}</span>
                    <button
                      className="audio-play-btn"
                      title={t('common.listen')}
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
                  {exNote && <div className="example-note">{t('grammarDetail.pointLabel')} {exNote}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Pitfalls & Idioms */}
      {activeTab === 'pitfalls' && (
        <div className="tab-content-panel">
          {pitfallsList.length > 0 && (
            <section className="pitfalls-section">
              <h3>{t('grammarDetail.pitfallsTitle')}</h3>
              <div className="pitfalls-list">
                {pitfallsList.map((pit, idx) => (
                  <div key={idx} className="pitfall-card">
                    <h4 className="pitfall-title">⚠️ {pit.title}</h4>
                    <p className="pitfall-explanation">{pit.explanation}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {idiomsList.length > 0 && (
            <section className="idioms-section">
              <h3>{t('grammarDetail.idiomsTitle')}</h3>
              <div className="idiom-grid">
                {idiomsList.map((idm, idx) => (
                  <div key={idx} className="idiom-card">
                    <div className="idiom-header">
                      <span className="idiom-phrase">{idm.phrase}</span>
                      <button
                        className="audio-play-btn"
                        onClick={() => playAudio(idm.phrase)}
                        title={t('common.listen')}
                      >
                        🔊
                      </button>
                    </div>
                    <p className="idiom-meaning">{t('grammarDetail.idiomMeaning')} {(language === 'en' && idm.meaningEn) ? idm.meaningEn : idm.meaning}</p>
                    <p className="idiom-example">{t('grammarDetail.idiomExample')} {(language === 'en' && idm.exampleEn) ? idm.exampleEn : idm.example}</p>
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
                <h3>{t('grammarDetail.quizHeaderTitle')} {topicTitle}</h3>
                <p>{t('grammarDetail.quizHeaderDesc')}</p>
              </div>
              <button
                type="button"
                className="drill-studio-link-btn"
                onClick={() => navigate(`/grammar/practice?topic=${topic.id}`)}
              >
                {t('grammarDetail.drillStudioLink')}
              </button>
            </div>
          </div>

          <form onSubmit={handleQuizSubmit} className="grammar-quiz-form">
            {topic.practiceQuiz.map((q, idx) => {
              const qText = (language === 'en' && q.questionEn) ? q.questionEn : q.question;
              const qExplanation = (language === 'en' && q.explanationEn) ? q.explanationEn : q.explanation;
              const qHint = (language === 'en' && q.hintEn) ? q.hintEn : (q.hint || t('drillStudio.inputPlaceholder'));

              const isCorrectAnswer = String(userAnswers[idx] || '').trim().toLowerCase() === String(q.answer).trim().toLowerCase();

              return (
                <div key={idx} className="quiz-item-card">
                  <h4 className="quiz-question">
                    {t('grammarDetail.questionNum', { num: idx + 1 })} {qText}
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
                          placeholder={qHint}
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
                    <div className={`quiz-feedback ${isCorrectAnswer ? 'correct-feed' : 'wrong-feed'}`}>
                      <p className="feedback-result">
                        {isCorrectAnswer ? `✅ ${t('common.correct')}` : `❌ ${t('common.incorrect')} (${t('drillStudio.correctAnswerLabel')} ${q.answer})`}
                      </p>
                      <p className="feedback-explanation">💡 {qExplanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {!submitted ? (
              <button
                type="submit"
                className="submit-quiz-btn"
                disabled={Object.keys(userAnswers).length < topic.practiceQuiz.length}
              >
                {t('grammarDetail.submitAnswers')}
              </button>
            ) : (
              <div className="quiz-result-summary">
                <h4>
                  🎉 {t('grammarDetail.resultsTitle', { total: topic.practiceQuiz.length, correct: score })}
                </h4>
                <button type="button" className="reset-quiz-btn" onClick={handleResetQuiz}>
                  {t('grammarDetail.retryQuiz')}
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
