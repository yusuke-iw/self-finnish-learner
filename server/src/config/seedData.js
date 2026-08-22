const sentences = [
  // Module 1 (A2)
  { _id: "m1_1", text: "Mihin aikaan juna lähtee Tampereelle?", translation: "What time does the train leave for Tampere?", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Aikaan (at time), lähtee (leaves)" },
  { _id: "m1_2", text: "Haluaisin varata huoneen kahdeksi yöksi.", translation: "I would like to book a room for two nights.", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Haluaisin (conditional), kahdeksi yöksi (translative for duration)" },
  { _id: "m1_3", text: "Voitko neuvoa minulle tien rautatieasemalle?", translation: "Can you show me the way to the railway station?", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Neuvoa tien (show the way), asemalle (allative)" },
  { _id: "m1_4", text: "Otatko kuitin?", translation: "Do you want the receipt?", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Kuitin (accusative)" },
  { _id: "m1_5", text: "Maksaako tämä enemmän kuin kymmenen euroa?", translation: "Does this cost more than ten euros?", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Maksaako (does it cost), enemmän kuin (more than)" },
  { _id: "m1_6", text: "Missä on lähin apteekki?", translation: "Where is the nearest pharmacy?", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Missä on (where is), lähin (nearest)" },
  { _id: "m1_7", text: "Yksi lippu Helsinkiin, kiitos.", translation: "One ticket to Helsinki, please.", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Lippu (ticket), Helsinkiin (illative)" },
  { _id: "m1_8", text: "Voinko maksaa kortilla?", translation: "Can I pay by card?", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Voinko (can I), kortilla (adessive for instrument)" },
  { _id: "m1_9", text: "Bussi numero viisi menee keskustaan.", translation: "Bus number five goes to the city center.", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Menee (goes), keskustaan (illative)" },
  { _id: "m1_10", text: "Tarvitsen apua matkatavaroiden kanssa.", translation: "I need help with the luggage.", difficulty: "easy", category: "Asiointi ja Matkustaminen", grammarNotes: "Tarvitsen (I need), kanssa (with + genitive)" },
  
  { _id: "m1_11", text: "Saisinko ruokalistan, kiitos?", translation: "Could I get the menu, please?", difficulty: "easy", category: "Ruoka ja Juoma", grammarNotes: "Saisinko (could I get), ruokalistan (accusative)" },
  { _id: "m1_12", text: "Minulla on nälkä ja jano.", translation: "I am hungry and thirsty.", difficulty: "easy", category: "Ruoka ja Juoma", grammarNotes: "Minulla on (I have)" },
  { _id: "m1_13", text: "Mitä suosittelette lounaaksi?", translation: "What do you recommend for lunch?", difficulty: "easy", category: "Ruoka ja Juoma", grammarNotes: "Suosittelette (you recommend), lounaaksi (translative)" },
  { _id: "m1_14", text: "Otan kupin kahvia ja korvapuustin.", translation: "I'll take a cup of coffee and a cinnamon bun.", difficulty: "easy", category: "Ruoka ja Juoma", grammarNotes: "Otan (I take), kupin (accusative)" },
  { _id: "m1_15", text: "Lasku, kiitos.", translation: "The bill, please.", difficulty: "easy", category: "Ruoka ja Juoma", grammarNotes: "Lasku (the bill)" },

  { _id: "m1_16", text: "Tämä on minun ystäväni Mikko.", translation: "This is my friend Mikko.", difficulty: "easy", category: "Perhe ja Ystävät", grammarNotes: "Minun (my), ystäväni (friend + possessive suffix)" },
  { _id: "m1_17", text: "Kuinka monta sisarusta sinulla on?", translation: "How many siblings do you have?", difficulty: "easy", category: "Perhe ja Ystävät", grammarNotes: "Kuinka monta (how many), sisarusta (partitive)" },
  { _id: "m1_18", text: "Minun perheeseeni kuuluu neljä ihmistä.", translation: "My family consists of four people.", difficulty: "easy", category: "Perhe ja Ystävät", grammarNotes: "Perheeseeni (illative + possessive), kuuluu (belongs to)" },
  { _id: "m1_19", text: "Mikä sinun nimesi on?", translation: "What is your name?", difficulty: "easy", category: "Perhe ja Ystävät", grammarNotes: "Mikä (what), nimesi (name + possessive)" },
  { _id: "m1_20", text: "Olemme tunteneet toisemme monta vuotta.", translation: "We have known each other for many years.", difficulty: "easy", category: "Perhe ja Ystävät", grammarNotes: "Olemme tunteneet (perfect tense), toisemme (each other)" },

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
  },
  {
    _id: "p3",
    title: "Matka Lappiin",
    text: "Talvella monet suomalaiset matkustavat Lappiin hiihtämään ja nauttimaan lumesta. Juna Helsingistä Rovaniemelle kestää noin kahdeksan tuntia. Yöjunassa voi nukkua mukavasti hytissä. Aamulla, kun juna saapuu perille, ulkona on usein pakkasta ja paljon lunta. Ihmiset pukeutuvat lämpimästi ja lähtevät heti ulos. Jotkut vuokraavat moottorikelkan, toiset taas hiihtävät pitkiä matkoja metsässä. Illalla kaikki menevät tietysti saunaan rentoutumaan kylmän päivän jälkeen.",
    translation: "In winter, many Finns travel to Lapland to ski and enjoy the snow. The train from Helsinki to Rovaniemi takes about eight hours. On the night train, you can sleep comfortably in a cabin. In the morning, when the train arrives, it is often freezing outside and there is a lot of snow. People dress warmly and go outside immediately. Some rent a snowmobile, while others ski long distances in the forest. In the evening, everyone naturally goes to the sauna to relax after a cold day.",
    category: "Winter Travel",
    vocabulary: [
      { word: "matkustavat", translation: "they travel" },
      { word: "hiihtämään", translation: "to ski (illative of 3rd infinitive)" },
      { word: "kestää", translation: "takes (time)" },
      { word: "hytissä", translation: "in a cabin (inessive)" },
      { word: "pakkasta", translation: "freezing weather (partitive)" },
      { word: "pukeutuvat", translation: "they dress" },
      { word: "moottorikelkan", translation: "snowmobile (accusative)" },
      { word: "rentoutumaan", translation: "to relax (illative of 3rd infinitive)" }
    ]
  },
  {
    _id: "p4",
    title: "Suomalainen koulujärjestelmä",
    text: "Suomen koulujärjestelmä on maailmankuulu. Lapset aloittavat koulun yleensä seitsemänvuotiaina. Peruskoulu kestää yhdeksän vuotta, ja se on kaikille ilmainen. Koulussa tarjotaan myös ilmainen ja terveellinen lämmin lounas joka päivä. Opettajat ovat korkeasti koulutettuja, sillä heillä kaikilla on yliopistotutkinto. Suomalaisessa koulussa ei ole paljon kokeita tai kotitehtäviä verrattuna moniin muihin maihin. Sen sijaan korostetaan leikkiä, luovuutta ja yhdessä oppimista. Tavoitteena on antaa jokaiselle lapselle yhtäläiset mahdollisuudet oppia ja menestyä elämässä taustasta riippumatta.",
    translation: "The Finnish school system is world-famous. Children usually start school at the age of seven. Comprehensive school lasts nine years, and it is free for everyone. The school also provides a free and healthy warm lunch every day. Teachers are highly educated, as they all have a university degree. In a Finnish school, there are not many exams or homework compared to many other countries. Instead, play, creativity, and learning together are emphasized. The goal is to give every child equal opportunities to learn and succeed in life, regardless of their background.",
    category: "Society & Education",
    vocabulary: [
      { word: "maailmankuulu", translation: "world-famous" },
      { word: "peruskoulu", translation: "comprehensive school" },
      { word: "ilmainen", translation: "free of charge" },
      { word: "yliopistotutkinto", translation: "university degree" },
      { word: "kokeita", translation: "exams (partitive plural)" },
      { word: "korostetaan", translation: "is emphasized (passive)" },
      { word: "yhtäläiset mahdollisuudet", translation: "equal opportunities" },
      { word: "riippumatta", translation: "regardless of (+ elative)" }
    ]
  }
];

module.exports = {
  sentences,
  passages
};
