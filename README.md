# Finnish Learner

A web app for learning Finnish, from A2 basics up to C1 reading. It combines a graded curriculum with three-level quizzes, spaced-repetition review, listening practice, a word book, grammar explanations with drills, graded reading passages, and a "daily-life scenes" mode where you practise Finnish through small games set in a home, a neighbourhood and a town. Audio comes from Google Cloud Text-to-Speech, called through the Express server so the API key never reaches the browser.

The client is React 19 + Vite and the server is Express + Mongoose. The app also runs without MongoDB: the server then serves the built-in seed data from memory.

> Status as of 2026-11-09. The interface language is Japanese or English; the learning content is Finnish with Japanese and English translations.

## Contents

- [Current status](#current-status)
- [By the numbers](#by-the-numbers)
- [Milestones](#milestones)
- [Roadmap / ToDo](#roadmap--todo)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [License](#license)

## Current status

### Screens

| Route | What it does |
| --- | --- |
| `/` | Home and curriculum: 5 units, 15 lessons, each with a guidebook (key vocabulary and grammar notes) and level buttons. Shows your streak and daily goal, entry points for the other exercise types, and a sync ID field. |
| `/sessions` | The quiz engine. Three levels per lesson: level 1 is multiple choice or matching, level 2 is a word bank, and level 3 mixes typing, fill-in-the-blank and speaking. Typing is typo-tolerant (Levenshtein distance, so a missing double consonant or a/ä mix-up is forgiven but the correct form is shown). Enter submits, ä/ö buttons help on any keyboard, and you need 80% to unlock the next level. Wrong answers can be re-run as a mistake review. Extra exercise types: dictation and spoken-to-written practice. The speaking question uses the browser's speech recognition (Chrome or Edge). |
| `/review` | Today's review. Sentences, grammar questions and words are scheduled by spaced repetition; this screen lists what is due and starts the session. |
| `/words` | Word book with flashcards on the same spaced-repetition schedule. Words are added from reading passages and from scene results. |
| `/numbers` | Number practice: dictation of numbers, prices and times (official and everyday forms), with a selectable range. |
| `/scenes`, `/scenes/:gameId` | Daily-life scenes mode (see below). |
| `/passages` | Reading: 12 passages with audio, toggleable translations, vocabulary lists and comprehension questions. |
| `/grammar`, `/grammar/:topicId`, `/grammar/practice` | 22 grammar topics with rules, tables, examples and pitfalls, plus a drill studio for practice questions. |

### Daily-life scenes

Three settings, six mini-games. Every game is driven by a JSON file in `client/src/data/scenes/`, and a data test checks each file's shape.

| Setting | Game | Type |
| --- | --- | --- |
| Koti (home) | Weather and clothes | Pick an outfit that fits the weather |
| Lähiö (neighbourhood) | At the waste shelter | Sort items into the right bins |
| Lähiö | In the stairwell | Short dialogues with neighbours, written or spoken register |
| Kaupunki (town) | Booking an appointment by phone | Dialogue with a health-centre nurse |
| Kaupunki | At the ATM | Step-by-step procedure simulation |
| Kaupunki | At the government offices | Sort errands to the right office |

Each game explains why an answer is right or wrong, ends with info cards (re-readable from the list), a vocabulary list you can add to the word book, a link to related lessons, and the next recommended game. Game text can be shown in Finnish, simplified Finnish (selko), English or Japanese. Progress is marked with a check on the scenes list.

### Cross-cutting features

- **Text-to-speech:** Google Cloud TTS (WaveNet) through the Express server, with an in-browser audio cache and several speaker voices.
- **Spoken Finnish:** 216 of the 270 example sentences have a colloquial (puhekieli) version with notes, and there are exercises that map spoken forms back to written ones.
- **Progress and sync ID:** progress is stored in the browser and can be shared between devices with a sync ID that the server stores.
- **Works without a database:** with no MongoDB connection the server falls back to `seedData.js`.
- **Performance:** routes are lazy-loaded so the grammar data stays out of the main bundle.
- **Quality gates:** lint with zero warnings, client and server tests, and a build, all run in CI on every pull request.

## By the numbers

Measured on 2026-11-09 from the `main` branch.

| Metric | Value |
| --- | --- |
| Started | 2026-08-21 |
| Commits | 105 |
| Merged pull requests | 32 (#1 to #33, #4 was never merged) |
| Days with commits | 19 |
| Source lines (JS, JSX, CSS, JSON in `client/src` and `server/src`) | about 37,400 |
| Test files | 60 |
| Change since the first commit | 216 files, +51,813 lines |

| Content | Amount |
| --- | --- |
| Example sentences | 270 (5 units, 15 lessons, 18 sentences each) |
| Reading passages | 12 (A1/A2 to C1) |
| Grammar topics | 22 in 5 categories |
| Scene settings | 3 (Koti, Lähiö, Kaupunki) |
| Scene mini-games | 6, across 4 game types (outfit, sort, dialogue, procedure) |

## Milestones

| Milestone | Dates | PRs | What shipped |
| --- | --- | --- | --- |
| M0 Foundation | 2026-08-21 to 2026-09-07 | before #1 | MERN structure, session generation API, home page and unit guidebooks, three-level quiz, text-to-speech, reading passages |
| M1 Core learning loop | 2026-10-18 to 2026-10-19 | #1 to #13 | 80% level-up rule and per-lesson progress with sync ID, spaced repetition and today's review with streak and daily goal, dictation and number listening, word book with flashcards, Unit 5 "Life in Finland", spoken Finnish versions, 8 more reading passages, corrections to example sentences, lazy-loaded routes, CI with zero lint warnings |
| M2 Dev workflow and code health | 2026-10-20 to 2026-10-24 | #14 to #20 | A conductor-and-subagents workflow for development, a shared server data layer, Session and grammar drill split into components and hooks, bug fixes |
| M3 Daily-life scenes | 2026-10-24 to 2026-11-01 | #21 to #32 | Scenes foundation and six mini-games across three settings, info cards, word book link, text mode switch (Finnish, selko, English, Japanese), documentation of the game rules |
| Housekeeping | 2026-11-09 | #33 | MIT license |

## Roadmap / ToDo

Planned work, grouped into milestones. Items are directions, not detailed designs.

### M4 More scenes

- [ ] A health setting, for example a quiz at the health centre
- [ ] A money setting, for example paying a bill before its due date
- [ ] A nature setting, for example picking berries and mushrooms in the forest
- [ ] Branching dialogues, where the answer you pick changes the conversation (the data format already allows it)
- [ ] Spoken-register versions for the games other than the stairwell dialogues
- [ ] Per-item selko (simplified Finnish) text instead of per-game

### M5 Connected learning

- [ ] Automatically add words you got wrong to the word book (today you add them with a button)
- [ ] Sync scene progress to the server (today it is stored in the browser only)
- [ ] A library where collected info cards can be read in one place
- [ ] An illustrated map to explore the scenes, replacing the plain list
- [ ] Scene-specific entries in the review schedule (today review runs through the word book)

### M6 Content depth

- [ ] Even out the lessons per unit (currently 4, 2, 2, 1 and 6)
- [ ] Have a native speaker check the Finnish in the example sentences and scenes
- [ ] More reading passages and grammar topics, especially for the categories that have only one topic today (rections, idioms)

### M7 New practice types

- [ ] Speech-recognition speaking practice inside scenes (the quiz already has a speaking question)
- [ ] A fast-paced, reflex-style action game
- [ ] A listening-only mode for scene sentences, for example the weather read aloud with no text
- [ ] Drag and drop and keyboard shortcuts for scene games (today everything is tap or click)

### Housekeeping

- [ ] Remove the already-built stairwell game from `client/src/data/scenes/upcoming.json`. It is hidden automatically, so nothing is visible, but the entry is stale.

## Tech stack

**Client** (`client/`)

- React 19 and React Router 6, with lazy-loaded routes
- Vite 8 for dev server and bundling (the dev server proxies `/api` to port 5000)
- Zustand for progress state; plain CSS with variables for styling
- Vitest, Testing Library and jsdom for tests; oxlint for linting

**Server** (`server/`)

- Node.js and Express 4, with helmet and cors
- MongoDB and Mongoose 8, with a built-in in-memory fallback from `seedData.js`
- Google Cloud Text-to-Speech, called through `/api/tts`
- Jest and Supertest for tests

**Tooling**

- GitHub Actions CI on pull requests and pushes to `main`: client lint (`--deny-warnings`), tests with coverage thresholds, build; server tests with coverage thresholds
- LF line endings everywhere (`.gitattributes`)

## Getting started

1. **Install dependencies.** From the repository root:

   ```bash
   npm run install-all
   ```

2. **Configure the server (optional).** Create `server/.env` if you want any of the following; the app starts without it.

   | Variable | Needed for | Default |
   | --- | --- | --- |
   | `GOOGLE_TTS_API_KEY` | Audio. Without it, `/api/tts` returns an error and the play buttons do not work. | none |
   | `MONGO_URI` | Saving to MongoDB. | `mongodb://localhost:27017/self-finnish-learner` |
   | `PORT` | Server port. | `5000` |

   If MongoDB is not reachable, the server logs a warning and runs in memory-fallback mode: all content comes from `server/src/config/seedData.js` and server-side changes are not saved.

3. **Start the app.** From the root:

   ```bash
   npm run dev
   ```

   This runs the server on port 5000 and the client on port 5173. Open http://localhost:5173.

4. **Seed MongoDB (only when you use it).**

   ```bash
   npm run seed --prefix server
   ```

   Run it again after content changes.

### Running the checks

These are the same checks CI runs.

```bash
cd client && npx oxlint src --deny-warnings && npx vitest run && npx vite build
cd server && npx jest --runInBand
```

## Project structure

```text
client/src/
  pages/         one file per route (Home, Session, Review, WordBook, NumberPractice,
                 Scenes, SceneGame, Passage, GrammarHub, GrammarDetail, GrammarPractice)
  components/    UI pieces, grouped by session/, grammar/ and scenes/
  hooks/         useSession, useGrammarPractice, useSpeechRecognition
  utils/         spaced repetition, word book, sync ID, scene game logic, number-to-Finnish
  data/          curriculum, grammar topics, and scenes/*.json
  store/         Zustand progress store
  locales/       UI strings (Japanese and English)
server/src/
  routes/ controllers/ data/   REST API: sentences, passages, sessions, progress, tts
  services/questionBuilders/   builds quiz questions per level
  models/                      Mongoose models
  config/                      DB connection, seedData.js, seed script
docs/design/                   design notes for the scenes mode
.claude/ and .agents/          rules and workflows for AI-assisted development
```

## License

MIT. See [LICENSE](LICENSE).
