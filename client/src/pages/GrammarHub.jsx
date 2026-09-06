import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRAMMAR_CATEGORIES, grammarTopics } from '../data/grammarData';
import '../assets/App.css';

function GrammarHub() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = grammarTopics.filter((topic) => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          topic.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grammar-hub-container">
      <header className="grammar-hub-header">
        <h1 className="hub-title">📖 フィンランド語 文法・イディオム体系学習</h1>
        <p className="hub-subtitle">
          文法ルール、15の格変化、動詞活用から生きた口語表現・イディオムまでを体系的にマスターしましょう。
        </p>

        {/* Drill Studio Hero Banner */}
        <div className="drill-studio-banner">
          <div className="banner-content">
            <div className="banner-badge">NEW ⚡ 反復ドリル</div>
            <h2 className="banner-title">🎯 文法演習スタジオ（Drill Studio）</h2>
            <p className="banner-desc">
              解説を読むだけでなく、1問1答・タイピング入力・カテゴリ別特訓で文法を身体に染み込ませましょう。間違えた問題の集中復習も可能です。
            </p>
          </div>
          <div className="banner-actions">
            <button
              type="button"
              className="start-drill-btn"
              onClick={() => navigate('/grammar/practice')}
            >
              🚀 今すぐ特訓を始める
            </button>
          </div>
        </div>
      </header>

      {/* Search & Category Filter */}
      <div className="grammar-controls">
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="grammar-search-input"
            placeholder="文法項目やキーワードを検索 (例: 母音調和, 支配, Partitiivi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-tabs">
          {GRAMMAR_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Grid */}
      <div className="grammar-topic-grid">
        {filteredTopics.length === 0 ? (
          <div className="no-topics-found">
            <p>該当する文法項目が見つかりませんでした。</p>
          </div>
        ) : (
          filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="grammar-topic-card"
              onClick={() => navigate(`/grammar/${topic.id}`)}
            >
              <div className="topic-card-header">
                <span className={`level-badge level-${topic.level.toLowerCase()}`}>
                  {topic.level}
                </span>
                <span className="category-tag">
                  {GRAMMAR_CATEGORIES.find((c) => c.id === topic.category)?.label || topic.category}
                </span>
              </div>
              <h3 className="topic-card-title">{topic.title}</h3>
              <p className="topic-card-summary">{topic.summary}</p>

              <div className="topic-card-footer">
                <span className="quiz-count-badge">
                  ✏️ 演習問題 {topic.practiceQuiz.length}問
                </span>
                <button className="read-more-btn">
                  解説を見る ➔
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GrammarHub;
