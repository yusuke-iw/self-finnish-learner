export const units = [
  {
    id: 1,
    title: 'Unit 1: A2 Foundations',
    titleJa: 'ユニット 1: A2 基礎編',
    description: 'Basic daily life and past tenses',
    descriptionJa: '日常生活の用事、食事、家族と過去形',
    color: '#58cc02', // Green
    lessons: [
      { id: 'l1', title: 'Asiointi ja Matkustaminen', titleJa: '用事・旅行 (Asiointi & Matkustaminen)', description: 'Running errands, travel', descriptionJa: '買い物・用事・旅行' },
      { id: 'l1b', title: 'Ruoka ja Juoma', titleJa: '食事・飲み物 (Ruoka & Juoma)', description: 'Food, drink, and restaurants', descriptionJa: '食べ物、飲み物、レストラン' },
      { id: 'l1c', title: 'Perhe ja Ystävät', titleJa: '家族・友人 (Perhe & Ystävät)', description: 'Family members and relationships', descriptionJa: '家族構成や人間関係' },
      { id: 'l2', title: 'Menneet ajat', titleJa: '過去の表現 (Menneet ajat)', description: 'Past tenses: Imperfect & Perfect', descriptionJa: '過去形（イムペルフェクティ）と完了形' },
    ]
  },
  {
    id: 2,
    title: 'Unit 2: B1 Intermediate',
    titleJa: 'ユニット 2: B1 中級編',
    description: 'Worklife and conditional mood',
    descriptionJa: '仕事・学習と条件法（-isi-）',
    color: '#ce82ff', // Purple
    lessons: [
      { id: 'l3', title: 'Työelämä ja Opiskelu', titleJa: '仕事・学業 (Työelämä & Opiskelu)', description: 'Worklife, job interviews', descriptionJa: '職場、面接、学校生活' },
      { id: 'l4', title: 'Konditionaali ja Potentiaali', titleJa: '条件法・可能性法', description: 'Conditional mood "-isi-"', descriptionJa: '条件法「〜なら・〜したい」' },
    ]
  },
  {
    id: 3,
    title: 'Unit 3: B2 Advanced',
    titleJa: 'ユニット 3: B2 上級編',
    description: 'Society and participle phrases',
    descriptionJa: '社会・環境と分詞構文',
    color: '#00cd9c', // Cyan
    lessons: [
      { id: 'l5', title: 'Yhteiskunta ja Ympäristö', titleJa: '社会・環境 (Yhteiskunta & Ympäristö)', description: 'Society, politics', descriptionJa: '時事、社会制度、環境問題' },
      { id: 'l6', title: 'Lauseenvastikkeet', titleJa: '分詞構文 (Lauseenvastikkeet)', description: 'Complex participle phrases', descriptionJa: '高度な短縮複文・分詞構文' },
    ]
  },
  {
    id: 4,
    title: 'Unit 4: C1 Mastery',
    titleJa: 'ユニット 4: C1 最上級編',
    description: 'Abstract and nuanced discussions',
    descriptionJa: '抽象的・高度な議論と慣用句',
    color: '#ff9600', // Orange
    lessons: [
      { id: 'l7', title: 'Abstraktit keskustelut', titleJa: '抽象表現 (Abstraktit keskustelut)', description: 'Nuanced abstract topics, idioms', descriptionJa: 'ニュアンスに富んだ成句と抽象議論' }
    ]
  },
  {
    id: 5,
    title: 'Unit 5: Life in Finland',
    titleJa: 'ユニット 5: フィンランドの暮らし',
    description: 'Everyday errands and official matters',
    descriptionJa: '買い物・病院・住まい・役所などの生活場面',
    color: '#1cb0f6', // Blue
    lessons: [
      { id: 'l8', title: 'Kaupassa ja apteekissa', titleJa: '買い物・薬局 (Kaupassa & Apteekissa)', description: 'Shopping, prices, returns, and pharmacy visits', descriptionJa: 'スーパー、値段、返品、薬局での相談' },
      { id: 'l9', title: 'Terveys ja lääkärissä', titleJa: '健康・病院 (Terveys & Lääkärissä)', description: 'Appointments, symptoms, and sick leave', descriptionJa: '診療予約、症状、診察、病欠の連絡' },
      { id: 'l10', title: 'Asuminen', titleJa: '住まい (Asuminen)', description: 'Renting, maintenance, recycling, and sauna bookings', descriptionJa: '賃貸契約、家賃、故障の連絡、ゴミ分別、サウナの利用枠' },
      { id: 'l11', title: 'Sää ja vuodenajat', titleJa: '天気・季節 (Sää & Vuodenajat)', description: 'Weather forecasts, temperatures, and seasonal celebrations', descriptionJa: '天気予報、気温、季節の行事' },
      { id: 'l12', title: 'Virastoissa', titleJa: '役所・手続き (Virastoissa)', description: 'Kela, residence permits, taxes, address changes, and employment services', descriptionJa: 'Kela、在留許可、税金、住所変更、就労支援の手続き' },
      { id: 'l13', title: 'Vapaa-aika ja harrastukset', titleJa: '余暇・趣味 (Vapaa-aika & Harrastukset)', description: 'Hobbies, sports, libraries, films, and invitations', descriptionJa: '趣味、スポーツ、図書館、映画、誘いと断り方' },
    ]
  }
];

export function findLessonById(id) {
  if (!id) return undefined;
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
}

export function findLessonByTitle(title) {
  if (!title) return undefined;
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.title === title);
    if (lesson) return lesson;
  }
  return undefined;
}

