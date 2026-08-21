const sentences = [
  // Module 1 (A2)
  { _id: "m1_1", text: "Mihin aikaan juna lähtee Tampereelle?", translation: "What time does the train leave for Tampere?", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Aikaan (at time), lähtee (leaves)" },
  { _id: "m1_2", text: "Haluaisin varata huoneen kahdeksi yöksi.", translation: "I would like to book a room for two nights.", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Haluaisin (conditional), kahdeksi yöksi (translative for duration)" },
  { _id: "m1_3", text: "Voitko neuvoa minulle tien rautatieasemalle?", translation: "Can you show me the way to the railway station?", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Neuvoa tien (show the way), asemalle (allative)" },
  { _id: "m1_4", text: "Otatko kuitin?", translation: "Do you want the receipt?", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Kuitin (accusative)" },
  { _id: "m1_5", text: "Maksaako tämä enemmän kuin kymmenen euroa?", translation: "Does this cost more than ten euros?", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Maksaako (does it cost), enemmän kuin (more than)" },

  // Module 2 (A2/B1)
  { _id: "m2_1", text: "Minä asuin Helsingissä viisi vuotta sitten.", translation: "I lived in Helsinki five years ago.", difficulty: "medium", category: "Menneet ajat", grammarNotes: "Asuin (imperfect)" },
  { _id: "m2_2", text: "Oletko koskaan käynyt Lapissa?", translation: "Have you ever been to Lapland?", difficulty: "medium", category: "Menneet ajat", grammarNotes: "Oletko käynyt (perfect)" },
  { _id: "m2_3", text: "Me emme nähneet häntä eilen.", translation: "We didn't see him yesterday.", difficulty: "medium", category: "Menneet ajat", grammarNotes: "Emme nähneet (negative imperfect)" },
  { _id: "m2_4", text: "Hän oli jo lähtenyt, kun minä saavuin.", translation: "He had already left when I arrived.", difficulty: "medium", category: "Menneet ajat", grammarNotes: "Oli lähtenyt (pluperfect)" },
  { _id: "m2_5", text: "En ole lukenut tätä kirjaa vielä.", translation: "I haven't read this book yet.", difficulty: "medium", category: "Menneet ajat", grammarNotes: "En ole lukenut (negative perfect)" },

  // Module 3 (B1)
  { _id: "m3_1", text: "Olen työskennellyt tässä yrityksessä kolme vuotta.", translation: "I have worked in this company for three years.", difficulty: "medium", category: "Työelämä ja Opiskelu", grammarNotes: "Työskennellyt yrityksessä (inessive for workplace)" },
  { _id: "m3_2", text: "Mitkä ovat sinun vahvuutesi ja heikkoutesi työntekijänä?", translation: "What are your strengths and weaknesses as an employee?", difficulty: "medium", category: "Työelämä ja Opiskelu", grammarNotes: "Työntekijänä (essive)" },
  { _id: "m3_3", text: "Opiskelen suomea, jotta voin ymmärtää asiakkaita paremmin.", translation: "I study Finnish so that I can understand customers better.", difficulty: "medium", category: "Työelämä ja Opiskelu", grammarNotes: "Jotta (so that), paremmin (comparative)" },
  { _id: "m3_4", text: "Kokous on peruttu sairaustapauksen vuoksi.", translation: "The meeting is cancelled due to illness.", difficulty: "medium", category: "Työelämä ja Opiskelu", grammarNotes: "Peruttu (passive participle), vuoksi (due to + genitive)" },
  { _id: "m3_5", text: "Haluaisin hakea tätä avointa työpaikkaa.", translation: "I would like to apply for this open job position.", difficulty: "medium", category: "Työelämä ja Opiskelu", grammarNotes: "Hakea työpaikkaa (partitive object)" },

  // Module 4 (B1/B2)
  { _id: "m4_1", text: "Jos minulla olisi aikaa, lähtisin lomalle.", translation: "If I had time, I would go on vacation.", difficulty: "hard", category: "Konditionaali ja Potentiaali", grammarNotes: "Olisi, lähtisin (conditional)" },
  { _id: "m4_2", text: "Voisitko auttaa minua tämän raportin kanssa?", translation: "Could you help me with this report?", difficulty: "hard", category: "Konditionaali ja Potentiaali", grammarNotes: "Voisitko (conditional question)" },
  { _id: "m4_3", text: "Hän lienee jo kotona.", translation: "He is probably already at home.", difficulty: "hard", category: "Konditionaali ja Potentiaali", grammarNotes: "Lienee (potential of olla)" },
  { _id: "m4_4", text: "Söisittekö mieluummin kalaa vai lihaa?", translation: "Would you rather eat fish or meat?", difficulty: "hard", category: "Konditionaali ja Potentiaali", grammarNotes: "Söisittekö (conditional plural 2nd)" },
  { _id: "m4_5", text: "En usko, että hän tulisi, vaikka pyytäisin.", translation: "I don't think he would come, even if I asked.", difficulty: "hard", category: "Konditionaali ja Potentiaali", grammarNotes: "Vaikka pyytäisin (even if I asked)" },

  // Module 5 (B2)
  { _id: "m5_1", text: "Ilmastonmuutos on yksi aikamme suurimmista haasteista.", translation: "Climate change is one of the biggest challenges of our time.", difficulty: "hard", category: "Yhteiskunta ja Ympäristö", grammarNotes: "Aikamme (genitive + suffix), haasteista (elative)" },
  { _id: "m5_2", text: "Kierrättäminen on tärkeää ympäristön suojelemiseksi.", translation: "Recycling is important for protecting the environment.", difficulty: "hard", category: "Yhteiskunta ja Ympäristö", grammarNotes: "Suojelemiseksi (translative verbal noun)" },
  { _id: "m5_3", text: "Hallitus suunnittelee uusia verohelpotuksia.", translation: "The government is planning new tax reliefs.", difficulty: "hard", category: "Yhteiskunta ja Ympäristö", grammarNotes: "Uusia verohelpotuksia (partitive plural)" },
  { _id: "m5_4", text: "Demokratia edellyttää kansalaisten aktiivista osallistumista.", translation: "Democracy requires the active participation of citizens.", difficulty: "hard", category: "Yhteiskunta ja Ympäristö", grammarNotes: "Edellyttää + partitive" },
  { _id: "m5_5", text: "Uusiutuva energia korvaa vähitellen fossiiliset polttoaineet.", translation: "Renewable energy is gradually replacing fossil fuels.", difficulty: "hard", category: "Yhteiskunta ja Ympäristö", grammarNotes: "Korvaa (replaces)" },

  // Module 6 (B2/C1)
  { _id: "m6_1", text: "Huomatessaan virheen, hän korjasi sen heti.", translation: "Upon noticing the mistake, he corrected it immediately.", difficulty: "hard", category: "Lauseenvastikkeet", grammarNotes: "Huomatessaan (temporaalinen lauseenvastike)" },
  { _id: "m6_2", text: "Olen kuullut hänen muuttaneen ulkomaille.", translation: "I have heard that he has moved abroad.", difficulty: "hard", category: "Lauseenvastikkeet", grammarNotes: "Muuttaneen (referatiivinen lauseenvastike)" },
  { _id: "m6_3", text: "Tehtävä on liian vaikea minun ratkaistakseni.", translation: "The task is too difficult for me to solve.", difficulty: "hard", category: "Lauseenvastikkeet", grammarNotes: "Ratkaistakseni (finaalinen lauseenvastike)" },
  { _id: "m6_4", text: "Sateesta huolimatta jatkoimme matkaa.", translation: "Despite the rain, we continued the journey.", difficulty: "hard", category: "Lauseenvastikkeet", grammarNotes: "Sateesta huolimatta (despite + elative)" },
  { _id: "m6_5", text: "Hänen tultuaan kotiin aloimme syödä.", translation: "After he came home, we started eating.", difficulty: "hard", category: "Lauseenvastikkeet", grammarNotes: "Tultuaan (temporaalinen lauseenvastike, passive)" },

  // Module 7 (C1)
  { _id: "m7_1", text: "Yksilön vastuu korostuu nyky-yhteiskunnan eettisissä keskusteluissa.", translation: "The responsibility of the individual is emphasized in the ethical discussions of modern society.", difficulty: "hard", category: "Abstraktit keskustelut", grammarNotes: "Korostuu (passive/reflexive)" },
  { _id: "m7_2", text: "Kielen omaksuminen on monisäikeinen, elinikäinen prosessi.", translation: "Language acquisition is a multifaceted, lifelong process.", difficulty: "hard', category: 'Abstraktit keskustelut', grammarNotes: 'Omaksuminen (noun derived from verb)" },
  { _id: "m7_3", text: "Kulttuurinen omiminen on herättänyt laajaa julkista debattia.", translation: "Cultural appropriation has sparked broad public debate.", difficulty: "hard", category: "Abstraktit keskustelut", grammarNotes: "Herättänyt debattia (perfect tense with abstract noun)" },
  { _id: "m7_4", text: "Taide ei ainoastaan heijasta todellisuutta, vaan myös muokkaa sitä.", translation: "Art doesn't only reflect reality, but also shapes it.", difficulty: "hard", category: "Abstraktit keskustelut", grammarNotes: "Ei ainoastaan... vaan myös (not only... but also)" },
  { _id: "m7_5", text: "On kyseenalaista, voidaanko absoluuttista totuutta koskaan saavuttaa.", translation: "It is questionable whether absolute truth can ever be achieved.", difficulty: "hard", category: "Abstraktit keskustelut", grammarNotes: "Voidaanko saavuttaa (passive potential question)" }
];

const passages = [
  {
    _id: "p1",
    title: "Pekka ja Sauna",
    text: "Pekka tykkää saunasta. Lauantaina hän lämmittää puusaunan. Saunassa on erittäin kuuma, noin kahdeksankymmentä astetta. Pekka heittää löylyä kiukaalle. Sitten hän juo kylmää vettä ja katsoo järvelle.",
    translation: "Pekka likes sauna. On Saturday, he heats up the wooden sauna. In the sauna, it is very hot, about 80 degrees. Pekka throws water on the stove. Then he drinks cold water and looks at the lake.",
    category: "Culture & Daily Life",
    vocabulary: [
      { word: "tykkää", translation: "likes" },
      { word: "lämmittää", translation: "heats up" },
      { word: "löylyä", translation: "steam thrown on sauna rocks" },
      { word: "kiukaalle", translation: "onto the sauna stove" },
      { word: "järvelle", translation: "towards the lake" }
    ]
  },
  {
    _id: "p2",
    title: "Tori ja Kahvila",
    text: "Helsingin kauppatorilla on paljon ihmisiä kesällä. Maija menee torikahvilaan. Hän tilaa korvapuustin ja kahvin. Torilla myydään myös tuoreita mansikoita ja herneitä. Maija nauttii auringosta meren rannalla.",
    translation: "There are many people at Helsinki Market Square in summer. Maija goes to the market cafe. She orders a cinnamon bun and a coffee. Fresh strawberries and peas are also sold at the market. Maija enjoys the sun by the seaside.",
    category: "Helsinki Travel",
    vocabulary: [
      { word: "kauppatorilla", translation: "at the market square" },
      { word: "korvapuustin", translation: "cinnamon bun (accusative)" },
      { word: "tuoreita", translation: "fresh (partitive plural)" },
      { word: "mansikoita", translation: "strawberries (partitive plural)" },
      { word: "nauttii", translation: "enjoys" }
    ]
  }
];

module.exports = {
  sentences,
  passages
};
