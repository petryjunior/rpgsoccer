/**
 * Tabelas de nomes por seleção (core faltantes + national-teams-expand).
 * Nomes comuns fictícios por região — não são jogadores reais.
 */

/**
 * @param {string} pre
 * @param {string} sur
 */
function mk(pre, sur) {
  return {
    prenomes: pre.split("|").filter(Boolean),
    sobrenomes: sur.split("|").filter(Boolean),
  };
}

/** @type {Record<string, { prenomes: string[], sobrenomes: string[] }>} */
export const TABELAS_EXTRA_SELECOES = {
  ecu: mk(
    "Miguel|Sebastián|Bryan|Joel|Enzo|Damián|Ángel|César|Roberto|Carlos|Luis|Jorge|Pedro|Pablo|Óscar|Daniel|Eduardo|Andrés|Felipe|Iván|Mateo|Samuel|Diego|Antonio|Francisco|Xavier|Byron|Moises|Álvaro|Leonardo|Nicolás|Santiago|Gabriel|Fernando|Ricardo|Tomás|Vicente|Martín|Emilio|Gonzalo|Ramón|Esteban|Hugo|Cristian|Javier",
    "Hurtado|Estupiñán|Caicedo|Preciado|Mendoza|Pereira|Franco|Estrada|Vera|Reyes|Ordóñez|Chalá|Cifuentes|Arboleda|Corozo|Intriago|Ayoví|Ruiz|Mercado|Delgado|Torres|Santos|Vega|Zambrano|Castro|Morales|Vásquez|Naranjo|Benítez|Molina|Aguilar|Bravo|Paredes|Romero|Salazar|Valencia|Zavala|Guerrero|Medina|Rios|Peña|Palacios|Vallejo|Cevallos|Montero",
  ),
  chi: mk(
    "Claudio|Bastián|Eduardo|Nicolás|Matías|Diego|Marcelo|Felipe|Ignacio|Tomás|Benjamín|Maximiliano|Cristóbal|Rodrigo|Gonzalo|Sebastián|Vicente|Joaquín|Álvaro|Francisco|Javier|Roberto|Daniel|Carlos|Luis|Pedro|Pablo|Andrés|Mauricio|Patricio|Esteban|Hernán|Ramón|Gabriel|Samuel|Emilio|Fernando|Ricardo|Leonardo|Martín|Bruno|Hugo|César|Simón|Ángel",
    "Silva|Morales|Rojas|Contreras|Valdés|Araya|Tapia|Peña|Fuentes|Campos|Herrera|Vega|Sepúlveda|Castillo|Núñez|Parra|Cortés|Figueroa|Jara|Medina|Bravo|Pizarro|Vargas|Escobar|Salinas|Torres|Gutiérrez|Ramírez|Flores|Molina|Reyes|Soto|Cáceres|Aguilera|Navarro|Orellana|Riquelme|Sandoval|Vidal|Zúñiga|Acuña|Bustos|Carvajal|Duarte|Espinoza",
  ),
  par: mk(
    "Óscar|Miguel|Antonio|Diego|Gabriel|Rodrigo|Federico|Nelson|Cristian|Richard|Jorge|Luis|Carlos|Pedro|Pablo|Daniel|Eduardo|Andrés|Marcelo|Roberto|Fernando|Ramón|Hugo|Sebastián|Martín|Javier|Francisco|Ángel|Ricardo|Leonardo|Emilio|Gonzalo|Benjamín|Matías|Nicolás|Tomás|Víctor|Héctor|Raúl|Esteban|Bruno|César|Iván|Samuel|Patricio",
    "Benítez|Giménez|Romero|Cardozo|Ayala|Valdez|Acosta|Martínez|González|Rojas|Silva|Morales|Vera|Duarte|Flores|Ortiz|Torres|Medina|Ríos|Pérez|Aguayo|Barrios|Caballero|Coronel|Escobar|Franco|Gaona|Insfrán|Lezcano|Mendoza|Núñez|Paredes|Quintana|Riquelme|Salinas|Villalba|Zárate|Arce|Bogado|Centurión|Dávalos|Espinola|Figueredo|Galeano|Haedo",
  ),
  usa: mk(
    "Tyler|Jordan|Mason|Ethan|Logan|Caleb|Noah|Liam|Jackson|Aiden|Lucas|Henry|Owen|Wyatt|Grayson|Connor|Hunter|Cameron|Evan|Nathan|Brandon|Justin|Derek|Travis|Brett|Kyle|Shawn|Trevor|Blake|Chase|Colin|Garrett|Spencer|Zachary|Tanner|Bradley|Gregory|Marcus|Devin|Eric|Brian|Patrick|Sean|Timothy|Jonathan",
    "Miller|Johnson|Williams|Brown|Jones|Davis|Wilson|Moore|Taylor|Anderson|Thomas|Jackson|White|Harris|Martin|Thompson|Garcia|Martinez|Robinson|Clark|Rodriguez|Lewis|Lee|Walker|Hall|Allen|Young|King|Wright|Scott|Green|Baker|Adams|Nelson|Campbell|Mitchell|Perez|Roberts|Carter|Phillips|Evans|Turner|Torres|Parker|Collins",
  ),
  nga: mk(
    "Chinedu|Emeka|Obinna|Ifeanyi|Uche|Tunde|Segun|Femi|Kelechi|Nnamdi|Chukwu|Oluwaseun|Adebayo|Babatunde|Dayo|Gbenga|Ikenna|Jide|Kunle|Muyiwa|Olamide|Tosin|Yemi|Zubair|Amara|Chidi|Efe|Godwin|Ibrahim|Jelani|Kofi|Moses|Osita|Peter|Samuel|Victor|Yusuf|Abdul|Daniel|Emmanuel|Gabriel|Isaac|Joseph|Michael|Stephen",
    "Okafor|Okonkwo|Adeyemi|Ogunleye|Nwosu|Eze|Onyeka|Chukwuma|Bello|Yusuf|Abubakar|Ibrahim|Mensah|Osei|Boateng|Asante|Danladi|Garba|Lawal|Musah|Suleiman|Afolabi|Bakare|Durojaiye|Fashola|Ige|Kuti|Oladipo|Popoola|Shoneyin|Acholonu|Anozie|Dimka|Enyinnaya|Iroegbu|Njoku|Obi|Okoro|Udeze|Adewale|Balogun|Ezeudu|Nnamani|Okeke|Uzoma",
  ),
  cmr: mk(
    "Jean|Paul|Roger|Brice|Fabrice|Stéphane|Nicolas|Patrick|Boris|Alain|Franck|Yann|Eric|Samuel|David|Joseph|Daniel|Emmanuel|Martin|Bernard|Christian|Michel|André|Jacques|Henri|Claude|Guy|Olivier|Thomas|Vincent|Antoine|Serge|Didier|Cédric|Florent|Ghislain|Hervé|Jules|Lionel|Maxime|Romain|Sébastien|Théodore|Valentin|Wilfried",
    "Ndjock|Foe|Eto|Song|Aboubakar|Choupo|Onana|Ondoa|Bassogog|Ekambi|Kameni|Mbia|Moukandjo|N'Koulou|Oyongo|Siani|Zambo|Anguissa|Boya|Djeugoue|Kunde|Ngapandouetnbu|Tchami|Wome|Bekono|Essama|Kamga|Mbarga|Nguemo|Olinga|Tchinda|Bisseck|Epassy|Kemen|Nsame|Ondoua|Tchakonte|Ateba|Ebongue|Kana|Ndjawe|Owona|Talla",
  ),
  mar: mk(
    "Youssef|Mehdi|Omar|Hamza|Anas|Ayoub|Amine|Bilal|Karim|Rachid|Adil|Hicham|Idriss|Jamal|Khalid|Nabil|Reda|Said|Tariq|Walid|Yassine|Zakaria|Abdel|Brahim|Driss|Fouad|Hassan|Ismail|Larbi|Mustapha|Noureddine|Othman|Riyad|Salah|Tarik|Younes|Zouhair|Aziz|Farid|Hakim|Malik|Oussama|Rachid|Sofiane|Tarik",
    "El Amrani|Benali|Idrissi|Lahlali|Ouazzani|Tazi|Cherkaoui|Fassi|Benjelloun|Lamrani|Zerouali|Bouazza|Chakir|El Mansouri|Filali|Ghazi|Haddad|Jabri|Kettani|Lazrak|Mouline|Rahmani|Sefiani|Talbi|Ziani|Amrani|Berrada|Chraibi|El Harti|Fikri|Guessous|Ibrahimi|Kabbaj|Mrabet|Ouahbi|Rhoulami|Sbihi|Tahiri|Zerhouni|Afilal|Benkirane|Chaoui|El Filali|Fettah|Lemsieh",
  ),
  gha: mk(
    "Kwame|Kofi|Yaw|Kojo|Kwesi|Ato|Nii|Fiifi|Kweku|Akwasi|Adjei|Boateng|Kwarteng|Mensah|Osei|Owusu|Sarpong|Tetteh|Yeboah|Agyeman|Asante|Darko|Frimpong|Gyamfi|Koomson|Nkrumah|Prah|Quaye|Sowah|Abdul|Ibrahim|Mohammed|Salifu|Yakubu|Daniel|Emmanuel|Isaac|Joseph|Michael|Samuel|Stephen|Vincent|William|Benjamin|Gabriel",
    "Asamoah|Boateng|Mensah|Osei|Owusu|Adomah|Agyemang|Appiah|Darko|Gyasi|Kuffour|Paintsil|Sarpei|Tagoe|Yeboah|Acheampong|Addo|Bonsu|Danso|Frimpong|Koomson|Nkrumah|Opoku|Prah|Quansah|Sarpong|Tetteh|Wiafe|Yawson|Zigah|Afful|Baidoo|Cudjoe|Donkor|Eshun|Fosu|Gyan|Kyei|Laryea|Mohammed|Ntow|Ofori|Poku|Quaye|Sulemana",
  ),
  bel: mk(
    "Thibaut|Kevin|Eden|Youri|Dries|Axel|Thomas|Jan|Pieter|Wout|Hans|Jens|Tim|Bram|Lars|Stijn|Maarten|Nick|Seppe|Vince|Robbe|Arne|Brent|Dennis|Frank|Geoffrey|Jasper|Kenny|Lucas|Maxime|Niels|Olivier|Quinten|Robin|Sander|Tobi|Viktor|Wesley|Yannick|Zeno|Adrien|Baptiste|Cédric|Florian|Guillaume",
    "Van den Berg|De Smet|Peeters|Claes|Willems|Jacobs|Martens|Goossens|Wouters|De Cock|Hermans|Vermeulen|Baeten|Coppens|De Bruyne|François|Lambert|Mertens|Renard|Segers|Aerts|Bogaerts|De Vos|Geerts|Janssens|Lemmens|Nijs|Pauwels|Smets|Thijs|Vandenberghe|Wauters|Bosmans|De Clercq|Fontaine|Hendrickx|Maes|Nuyts|Put|Stevens|Verschueren|Wuyts|Cools|De Wolf|Evrard",
  ),
  cro: mk(
    "Luka|Ivan|Marko|Nikola|Filip|Matej|Domagoj|Ante|Josip|Tomislav|Borna|Marin|Mario|Petar|Stipe|Vedran|Zvonimir|Dario|Goran|Hrvoje|Karlo|Kristijan|Leon|Mihael|Nenad|Ognjen|Roko|Slaven|Tin|Viktor|Zoran|Bruno|Damir|Emil|Fran|Goran|Igor|Juraj|Krešimir|Lovro|Mirko|Niko|Oliver|Patrik|Robert",
    "Horvat|Kovačević|Babić|Marić|Jurić|Novak|Vuković|Petrović|Knežević|Božić|Pavlović|Blagojević|Marković|Džakula|Grgić|Ilić|Janković|Klarić|Lovrić|Mandić|Nikolić|Orešković|Pilić|Radić|Šimić|Tomić|Vidović|Zorić|Bilić|Čuljak|Đurđević|Franić|Galić|Herceg|Ivanković|Juriša|Kralj|Lončar|Miloš|Oreški|Pavić|Rogić|Šarić|Trkulja|Vinković",
  ),
  cze: mk(
    "Jan|Petr|Tomáš|Jakub|Martin|Lukáš|David|Ondřej|Filip|Adam|Matěj|Vojtěch|Michal|Daniel|Marek|Pavel|Jiří|Radek|Stanislav|Václav|Zdeněk|Aleš|Dominik|František|Karel|Libor|Oldřich|Roman|Tadeáš|Vít|Bohumil|Čestmír|Dušan|Emil|Gustav|Hynek|Ivo|Jaroslav|Kamil|Leoš|Miloslav|Norbert|Otakar|Patrik|Robin",
    "Novák|Svoboda|Dvořák|Černý|Procházka|Veselý|Horák|Němec|Pokorný|Pospíšil|Hájek|Jelínek|Růžička|Beneš|Fiala|Holub|Kadlec|Macháček|Polák|Soukup|Tichý|Urban|Zeman|Bartoš|Čech|Doležal|Gregor|Hrubý|Chalupa|Janda|Klíma|Linhart|Moravec|Pešek|Rada|Šimek|Tůma|Vlk|Zelenka|Blažek|Čermák|Dostál|Fischer|Havlíček|Krejčí",
  ),
  ukr: mk(
    "Oleksandr|Andriy|Serhiy|Viktor|Yevhen|Mykola|Roman|Ihor|Dmytro|Vitaliy|Oleh|Yaroslav|Bohdan|Denys|Maksym|Pavlo|Ruslan|Taras|Vasyl|Yuriy|Artem|Hryhoriy|Ivan|Kyrylo|Leonid|Mykhailo|Oleksiy|Petro|Stepan|Volodymyr|Anton|Borys|Danylo|Fedir|Heorhiy|Illia|Kostiantyn|Lyubomyr|Myron|Nestor|Ostap|Pylyp|Svyatoslav|Tymofiy|Zakhar",
    "Shevchenko|Bondarenko|Kovalenko|Tkachenko|Melnyk|Moroz|Lysenko|Savchenko|Petrenko|Kravchenko|Oliynyk|Ponomarenko|Rudenko|Sydorenko|Tarasenko|Vovk|Yakovenko|Zinchenko|Antonenko|Bilous|Chernenko|Danylenko|Hlushko|Ivanchuk|Kostenko|Levchenko|Mazur|Nazarenko|Onyshchenko|Prykhodko|Romanyuk|Shapoval|Tyshchenko|Usenko|Velychko|Yaremchuk|Zadorozhnyi|Babiy|Chumak|Doroshenko|Honchar|Kulyk|Lytvyn|Movchan|Ostrovskyi",
  ),
  lva: mk(
    "Jānis|Andris|Edgars|Kārlis|Mārtiņš|Rihards|Roberts|Dāvis|Emīls|Kristaps|Lauris|Nikolajs|Oskars|Pauls|Rūdolfs|Toms|Uldis|Valters|Artūrs|Bruno|Dagnis|Egons|Gatis|Igors|Juris|Līga|Miķelis|Normunds|Oļegs|Pēteris|Raimonds|Sandis|Tālivaldis|Viesturs|Zigmārs|Agris|Dainis|Eriks|Guntis|Ilmārs|Jāzeps|Kaspars|Linards|Māris|Raitis",
    "Bērziņš|Kalniņš|Ozoliņš|Jansons|Krūmiņš|Liepiņš|Pētersons|Āboliņš|Celmiņš|Dūmiņš|Eglītis|Grīnbergs|Jaunzems|Kļaviņš|Lapiņš|Melders|Niedra|Ozols|Pļaviņš|Rozītis|Saulītis|Vītols|Zariņš|Balodis|Cīrulis|Dreimanis|Eglītis|Freimanis|Gulbis|Jēkabsons|Kārkliņš|Lācis|Muižnieks|Podnieks|Riekstiņš|Strautiņš|Vanags|Zālītis|Auziņš|Birznieks|Cēsnieks|Dzelzītis|Eglājs|Freibergs|Graudiņš",
  ),
  swe: mk(
    "Erik|Anders|Johan|Karl|Lars|Nils|Per|Björn|Gustav|Henrik|Magnus|Oskar|Viktor|Axel|Emil|Filip|Fredrik|Hannes|Isak|Joakim|Linus|Marcus|Oscar|Robin|Sebastian|Tobias|Viktor|William|Adam|Daniel|Felix|Gabriel|Hugo|Jonathan|Lucas|Max|Noah|Oliver|Samuel|Theo|Anton|Edvin|Leo|Matteo|Noel",
    "Andersson|Johansson|Karlsson|Nilsson|Eriksson|Larsson|Olsson|Persson|Svensson|Gustafsson|Pettersson|Jonsson|Jansson|Hansson|Bengtsson|Lindberg|Lindström|Berg|Lundgren|Sandberg|Holm|Ström|Åberg|Dahl|Forsberg|Hedlund|Lindqvist|Nyström|Sandström|Wallin|Bergman|Ekström|Fransson|Gustavsson|Håkansson|Lindgren|Mattsson|Nyberg|Olofsson|Palmqvist|Rosén|Sjöberg|Törnqvist|Viklund|Wikström",
  ),
  nor: mk(
    "Ole|Lars|Bjørn|Kjetil|Geir|Tor|Erik|Anders|Håvard|Magnus|Even|Jonas|Kristian|Martin|Nikolai|Ola|Petter|Sander|Thomas|Vegard|William|Adrian|Daniel|Emil|Fredrik|Henrik|Isak|Johannes|Lucas|Marius|Noah|Oskar|Sebastian|Tobias|Viktor|Aksel|Espen|Gaute|Halvor|Iver|Jørgen|Kenneth|Leif|Morten|Rune",
    "Hansen|Johansen|Olsen|Larsen|Andersen|Pedersen|Nilsen|Kristiansen|Jensen|Karlsen|Henriksen|Holm|Eriksen|Svendsen|Myhre|Dahl|Berg|Haugen|Lie|Moen|Strand|Aas|Bakke|Dale|Eide|Foss|Grande|Hagen|Lunde|Nygård|Rønning|Solberg|Tangen|Vik|Aune|Berge|Christiansen|Engen|Fjeld|Gran|Haugland|Kleven|Løken|Mikkelsen|Næss",
  ),
  pol: mk(
    "Piotr|Krzysztof|Andrzej|Tomasz|Paweł|Marcin|Michał|Grzegorz|Jakub|Adam|Łukasz|Marek|Dariusz|Zbigniew|Rafał|Mateusz|Kamil|Bartosz|Dawid|Filip|Maciej|Sebastian|Wojciech|Artur|Cezary|Damian|Emil|Hubert|Igor|Janusz|Leszek|Norbert|Oskar|Przemysław|Robert|Szymon|Tadeusz|Wiktor|Zdzisław|Błażej|Dominik|Eryk|Henryk|Jacek|Leon",
    "Nowak|Kowalski|Wiśniewski|Wójcik|Kowalczyk|Kamiński|Lewandowski|Zieliński|Szymański|Woźniak|Dąbrowski|Kozłowski|Jankowski|Mazur|Kwiatkowski|Krawczyk|Piotrowski|Grabowski|Nowakowski|Pawłowski|Michalski|Król|Wieczorek|Jabłoński|Wróbel|Adamczyk|Borkowski|Czajkowski|Dudek|Górski|Janicki|Kaczmarek|Lis|Malinowski|Olszewski|Pająk|Rutkowski|Sikora|Tomaszewski|Urbański|Walczak|Zając|Baran|Chmielewski|Domański|Filipek",
  ),
  jpn: mk(
    "Haruki|Ren|Sota|Yuto|Kaito|Daiki|Shun|Riku|Kenta|Takumi|Yuki|Kosuke|Hayato|Tomoya|Makoto|Satoshi|Hiroshi|Kazuki|Ryota|Shohei|Takeshi|Yuji|Akira|Daisuke|Fumiya|Genki|Hidetaka|Itsuki|Junpei|Kohei|Minoru|Naoki|Osamu|Ryusei|Tatsuya|Wataru|Yoshinori|Atsushi|Eisuke|Fuyuki|Hayama|Issei|Jin|Kenji|Manabu",
    "Sato|Suzuki|Takahashi|Tanaka|Watanabe|Ito|Yamamoto|Nakamura|Kobayashi|Kato|Yoshida|Yamada|Sasaki|Yamaguchi|Matsumoto|Inoue|Kimura|Hayashi|Shimizu|Yamazaki|Mori|Abe|Ikeda|Hashimoto|Ishikawa|Maeda|Fujita|Okada|Goto|Murakami|Hasegawa|Ogawa|Kondo|Ono|Saito|Arai|Endo|Fujii|Hara|Iwata|Kikuchi|Morita|Nishimura|Ota|Sugiyama",
  ),
  kor: mk(
    "Min-jun|Ji-hoon|Seo-jun|Hyun-woo|Dong-min|Tae-young|Jae-hyun|Sang-woo|Beom-seok|Young-soo|Jun-seo|Hae-chan|Kyung-min|Seung-ho|Woo-jin|Yong-jae|Byung-ho|Chan-yeol|Do-hyun|Eun-sang|Gun-woo|Hee-chul|In-beom|Jong-hyun|Ki-sung|Myung-soo|Seok-jin|Tae-min|Won-sik|Yeong-cheol|Bo-ram|Dae-jung|Eui-jo|Gwang-ho|Hak-min|Il-sung|Jae-sung|Kwang-seok|Min-ho|Seong-jin|Tae-ho|Ui-jo|Woo-young|Yoon-seok|Jun-young",
    "Choi|Jung|Kang|Han|Lim|Yoon|Song|Ahn|Bae|Cho|Hong|Jang|Kwak|Noh|Ryu|Seo|Shin|Baek|Do|Go|Heo|Im|Ji|Ko|Kwon|Moon|Na|Oh|Paik|Pyun|Son|Um|Woo|Yang|An|Byun|Eom|Gang|Gwak|Hahm|Jeong|Kil|Nam|Pang|Sim",
  ),
  aus: mk(
    "Jack|Liam|Noah|Oliver|William|James|Lucas|Henry|Levi|Mason|Ethan|Logan|Jackson|Aiden|Samuel|Ryan|Nathan|Tyler|Jordan|Blake|Connor|Harrison|Jesse|Kyle|Mitchell|Riley|Tyson|Zachary|Aaron|Bradley|Cameron|Declan|Finn|Hayden|Isaac|Jake|Lachlan|Max|Oscar|Patrick|Quinn|Riley|Sean|Toby|Xavier",
    "Smith|Jones|Williams|Brown|Wilson|Taylor|Johnson|White|Martin|Anderson|Thompson|Nguyen|Lee|Walker|Ryan|O'Brien|Kelly|Murphy|Clarke|Bennett|Campbell|Cooper|Edwards|Fisher|Griffiths|Harris|Jackson|King|Lewis|Mitchell|Nelson|Parker|Roberts|Scott|Turner|Ward|Young|Bell|Carter|Davis|Evans|Green|Hall|Hughes|James",
  ),
  nzl: mk(
    "Liam|Noah|Oliver|Jack|Leo|Lucas|Mason|Ethan|James|Henry|William|Alexander|Benjamin|Charlie|Daniel|Finn|George|Harrison|Isaac|Jacob|Max|Oscar|Samuel|Thomas|Archie|Blake|Caleb|Cooper|Dylan|Flynn|Hunter|Jesse|Kaleb|Lachlan|Mitchell|Nathan|Quinn|Riley|Ryan|Toby|Angus|Brodie|Callum|Finlay|Hamish",
    "Smith|Williams|Brown|Wilson|Taylor|Anderson|Thompson|Campbell|Scott|Stewart|Murphy|Clarke|Walker|Watson|Young|Allen|Bennett|Cooper|Edwards|Evans|Fisher|Graham|Harris|Hughes|Kelly|Martin|Mitchell|Nelson|Parker|Reid|Roberts|Ross|Turner|Ward|Bell|Carter|Davis|Gray|Hall|King|Lewis|Marshall|Phillips|Russell|Sullivan",
  ),
  bol: mk(
    "Marcelo|Carlos|Luis|Miguel|Diego|Jorge|Pedro|Pablo|Roberto|Fernando|Daniel|Eduardo|Andrés|Gabriel|Óscar|Ricardo|Sebastián|Martín|Javier|Francisco|Ángel|Ramón|Hugo|Emilio|Gonzalo|Nicolás|Santiago|Tomás|Vicente|Cristian|Damián|Enzo|Iván|Leonardo|Matías|Samuel|Brayan|Jhon|Marco|Raúl|Víctor|Wilson|Boris|Claudio|Efrain",
    "Quispe|Mamani|Condori|Choque|Vargas|Rojas|Flores|Apaza|Calani|Huanca|Limachi|Ticona|Zalasar|Aruquipa|Barrientos|Céspedes|Duran|Espinoza|Gutiérrez|Heredia|Ibañez|Justiniano|Luna|Miranda|Nina|Ortega|Poma|Rivera|Salazar|Ticona|Valencia|Yucra|Zamora|Aguilar|Bautista|Chávez|Daza|Farfán|Galindo|Herrera|López|Medina|Orellana|Paredes|Ramos",
  ),
  per: mk(
    "Paolo|Renato|César|Edison|Jean|Andy|Yordy|Wilder|Christopher|Bryan|Carlos|Luis|Miguel|Diego|Jorge|Pedro|Pablo|Roberto|Fernando|Daniel|Eduardo|Andrés|Gabriel|Óscar|Ricardo|Sebastián|Martín|Javier|Francisco|Ángel|Hugo|Emilio|Gonzalo|Nicolás|Santiago|Tomás|Vicente|Cristian|Damián|Enzo|Iván|Leonardo|Matías|Samuel|Alexander",
    "Quispe|Flores|Rojas|Vásquez|Huamán|Cueva|Tapia|Ramírez|García|López|Sánchez|Torres|Reyes|Mendoza|Castillo|Morales|Díaz|Romero|Silva|Vega|Acosta|Benítez|Cárdenas|Delgado|Espinoza|Gálvez|Hurtado|Ibarra|Jara|Medina|Núñez|Palacios|Quiñones|Salazar|Tello|Valdivia|Zevallos|Aranda|Bardales|Chávez|Dueñas|Fuentes|Guevara|Montes|Pizarro",
  ),
  ven: mk(
    "Jesús|Rafael|Darwin|Jhon|José|Carlos|Luis|Miguel|Diego|Jorge|Pedro|Pablo|Roberto|Fernando|Daniel|Eduardo|Andrés|Gabriel|Óscar|Ricardo|Sebastián|Martín|Javier|Francisco|Ángel|Ramón|Hugo|Emilio|Gonzalo|Nicolás|Santiago|Tomás|Vicente|Cristian|Damián|Enzo|Iván|Leonardo|Matías|Samuel|Wilker|Yeferson|Brayan|Kevin|Frank",
    "Rincón|Márquez|Peña|Rengifo|Mancilla|Fariñas|Herrera|Rosales|Villanueva|Añez|Chacón|Landaeta|Oswaldo|Rivas|Sarmiento|Ureña|Zambrano|Acosta|Bravo|Cedeño|Duarte|Espinoza|González|Infante|Linares|Medina|Narváez|Orozco|Pacheco|Quijada|Ramos|Salazar|Tovar|Uzcátegui|Vargas|Zerpa|Arismendi|Barrios|Casanova|Díaz|Fuentes|Guerra|López|Mendoza|Ortega",
  ),
  crc: mk(
    "Kevin|Bryan|Joel|Óscar|Francisco|Celso|Randall|Kendall|Ian|Patrick|Carlos|Luis|Miguel|Diego|Jorge|Pedro|Pablo|Roberto|Fernando|Daniel|Eduardo|Andrés|Gabriel|Ricardo|Sebastián|Martín|Javier|Ángel|Hugo|Emilio|Gonzalo|Nicolás|Santiago|Tomás|Vicente|Cristian|Damián|Enzo|Iván|Leonardo|Matías|Samuel|Anthony|David|Eric",
    "Vargas|Watterson|González|Ruiz|Borges|Campbell|Calvo|Duarte|Oviedo|Tejeda|Venegas|Acosta|Alvarado|Benavides|Chacón|Díaz|Espinoza|Flores|Gutiérrez|Herrera|Jiménez|López|Mora|Picado|Quesada|Ramírez|Salas|Torres|Ulate|Zeledón|Arroyo|Bolaños|Cerdas|Delgado|Fernández|Granados|Leitón|Madrigal|Obando|Paniagua|Rojas|Soto|Villalobos|Zúñiga|Cambronero|Salazar",
  ),
  jam: mk(
    "Andre|Damion|Devon|Jermaine|Kemar|Leon|Omar|Ricardo|Shamar|Tevin|Wayne|Aaron|Brandon|Craig|Dwayne|Ethan|Garfield|Howard|Isaiah|Jason|Kyle|Leroy|Marcus|Nigel|Orville|Patrick|Quincy|Ryan|Sean|Tyrone|Adrian|Brian|Clifford|Derrick|Everton|Franklin|Gregory|Hugh|Ian|Jerome|Kevin|Lloyd|Malcolm|Neville|Orlando",
    "Campbell|Brown|Johnson|Williams|Thompson|Henry|Reid|Grant|Dawson|Foster|Gordon|Hamilton|Jackson|Knight|Lawrence|Morgan|Palmer|Powell|Richards|Simpson|Taylor|Wallace|Wright|Allen|Bennett|Carter|Edwards|Fisher|Green|Hall|Ingram|James|Lewis|Mitchell|Nelson|Parker|Roberts|Scott|Turner|Walker|Young|Bell|Cole|Davis|Evans",
  ),
  pan: mk(
    "Aníbal|Armando|César|Édgar|Fidel|Gabriel|Ismael|Luis|Óscar|Ricardo|Alberto|Carlos|Daniel|Eduardo|Fernando|Jorge|Miguel|Pedro|Pablo|Roberto|Andrés|Diego|Francisco|Javier|Ramón|Sebastián|Antonio|Emilio|Gonzalo|Hugo|Iván|Leonardo|Martín|Nicolás|Santiago|Tomás|Vicente|Adrián|Bruno|Cristian|Damián|Enzo|Felipe|Héctor|Manuel",
    "Godoy|Cooper|Barcenas|Davis|Escobar|Gómez|Herrera|Murillo|Pérez|Rodríguez|Vargas|Arango|Benítez|Castillo|Díaz|Espinoza|Flores|Gutiérrez|Jiménez|López|Medina|Núñez|Ortega|Palacios|Quiroz|Ramos|Salazar|Torres|Ureña|Valdés|Zapata|Aguilar|Blandón|Cedeño|Duarte|Fuentes|Garzón|Henríquez|Ibarra|Jaramillo|Luna|Mendieta|Orozco|Pineda|Rivas",
  ),
  tto: mk(
    "Kevin|Kenwyne|Khaleem|Levi|Nathan|Ryan|Sheldon|Triston|Tyler|Akeem|Andre|Brandon|Carlos|Daniel|Ethan|Gabriel|Isaiah|Jamal|Kyle|Marcus|Nicholas|Osei|Patrick|Shaquille|Tevin|Adrian|Brian|Curtis|Dwayne|Everton|Franklin|Gregory|Howard|Ian|Jerome|Leroy|Malcolm|Nigel|Orville|Peter|Quinton|Roger|Sean|Tyrone|Wayne",
    "Phillips|George|Jones|Williams|Henry|Mitchell|David|Baptiste|Bostock|Charles|Daniel|Edwards|Francis|Garcia|Harris|James|Lewis|Mohammed|Nelson|Pierre|Ramkissoon|Samuel|Thomas|Wilson|Young|Alexander|Bennett|Campbell|Davis|Evans|Fletcher|Grant|Ince|John|King|Lee|Morgan|Powell|Roberts|Scott|Taylor|Walker|White|Wright|Zamora",
  ),
  cuw: mk(
    "Leandro|Rangelo|Jurgen|Vidar|Brandley|Gillian|Charlton|Roshon|Dustley|Gevaro|Aaron|Brian|Carlos|Daniel|Ethan|Frank|Gregory|Ian|Jason|Kevin|Luis|Marcus|Nathan|Patrick|Ryan|Sean|Tyler|Adrian|Bryan|Curtis|Derek|Edwin|Felix|Giovanni|Hendrik|Jordy|Kenny|Lorenzo|Mario|Nelson|Orlando|Peter|Quincy|Roger|Steven",
    "Martina|Bernardus|Statie|Antonia|Brito|Carmelia|Daal|Francisca|Helmrich|Isenia|Jansen|Koolman|Lopes|Maduro|Nepomuceno|Oduber|Pauletta|Quandus|Rijssel|Semper|Trappenberg|Valpoort|Winklaar|Zimmerman|Acosta|Berg|De Windt|Evertsz|Frazer|Goedgedrag|Hooi|Jacobs|Kwidama|Loen|Martis|Nobrega|Pieters|Rojer|Schmidt|Tromp|Van der Laan|Wout|Yrausquin|Zeppenfeld|Blijden",
  ),
  hti: mk(
    "Jean|Wilson|Duckens|Carnejy|Derrick|Steeven|Alex|Bryan|Charles|Daniel|Emmanuel|Frantz|Guerry|Jameson|Kervens|Louicius|Marc|Nelson|Peterson|Ricardo|Steeve|Woodensky|Abel|Benson|Clifford|Dorvil|Ernst|Fritz|Gregory|Herve|Isaac|Judelin|Kenol|Luther|Maxon|Norbert|Obed|Pierre|Reginald|Samson|Tidson|Vladimir|Wisnel|Yves|Zacharie",
    "Pierre|Jean-Baptiste|Louis|Joseph|Alexis|Baptiste|Désir|Estimé|Fleurant|Guillaume|Honorat|Jean-Louis|Lamothe|Mercier|Noël|Occéan|Paul|Romain|Sainvil|Théodore|Vilnor|Aristide|Bazile|Célestin|Dorléant|Etienne|Félicien|Gilles|Hilaire|Jeanty|Laurent|Michel|Narcisse|Osias|Pétion|Raphaël|Saint-Fleur|Toussaint|Vaval|Zéphirin|Belizaire|Célestin|Dorcent|Fenelon|Gaspard|Hyppolite",
  ),
  can: mk(
    "Jonathan|Alphonso|Stephen|Liam|Lucas|Noah|Oliver|William|James|Ethan|Benjamin|Mason|Logan|Jacob|Jackson|Levi|Daniel|Henry|Owen|Sebastian|Jack|Aiden|Matthew|Samuel|David|Joseph|Carter|Wyatt|Jayden|John|Luke|Grayson|Isaac|Gabriel|Julian|Mateo|Anthony|Jaxon|Lincoln|Joshua|Christopher|Andrew|Theodore|Caleb|Ryan",
    "Davies|David|Larin|Miller|Buchanan|Cornelius|Fraser|Henry|Hoilett|Hutchinson|James|Johnson|Kaye|Laryea|Osorio|Piette|Ricketts|Sturing|Teibert|Vitoria|Wotherspoon|Adekugbe|Borges|Cavallini|Didic|Eustaquio|Gagnon|Herdman|Kennedy|Lappalainen|Montgomery|Okello|Pasher|Shaffelburg|Tissot|Waterman|Arfield|Bernier|Crepeau|Duverne|Girard|Kone|Leutwiler|McKenna|Piette",
  ),
  irl: mk(
    "Seamus|Patrick|Liam|Conor|Cian|Oisín|Fionn|Darragh|Tadhg|Ronan|Cillian|Shane|Declan|Eoin|Niall|Padraig|Aidan|Brendan|Colm|Dermot|Enda|Finbar|Gearóid|Kieran|Lorcan|Micheál|Nolan|Oran|Peadar|Ruairí|Senan|Tomas|Ultan|Aodh|Brían|Cathal|Donnacha|Eamonn|Fergus|Gareth|Hugh|Iarlaith|Jarlath|Kevin|Lorcan",
    "Murphy|Kelly|O'Sullivan|Walsh|Smith|O'Brien|Byrne|Ryan|O'Connor|O'Neill|Doyle|McCarthy|Gallagher|O'Doherty|Kennedy|Lynch|Murray|Quinn|Moore|McLoughlin|O'Reilly|Power|Fitzgerald|Dunne|Brennan|Burke|Campbell|Clarke|Donnelly|Farrell|Healy|Johnston|Lyons|McGrath|Nolan|Reilly|Sweeney|Tierney|Whelan|Boylan|Casey|Daly|Flanagan|Griffin|Hogan",
  ),
  sco: mk(
    "Callum|Scott|Ryan|Lewis|Andrew|James|David|John|Robert|William|Daniel|Michael|Thomas|Christopher|Matthew|Joshua|Jack|Oliver|Harry|George|Charlie|Jacob|Noah|Alfie|Ethan|Max|Logan|Lucas|Finlay|Hamish|Angus|Fraser|Gregor|Iain|Keir|Lachlan|Murdo|Niall|Ruaridh|Struan|Tormod|Alistair|Bruce|Cameron|Dougal|Ewan",
    "MacDonald|Campbell|Stewart|MacLeod|MacKenzie|MacKay|Robertson|Anderson|Scott|Reid|Murray|Taylor|Watson|Morrison|Young|Clark|Paterson|Wright|Thompson|Graham|Ross|Wood|Burns|Craig|Ferguson|Henderson|Johnston|McLean|Sinclair|Allan|Baxter|Chisholm|Donnelly|Erskine|Findlay|Gunn|Innes|Kerr|Lamont|McIntyre|Nicol|Ogilvy|Ritchie|Shaw|Tulloch",
  ),
  wal: mk(
    "Gareth|Aaron|Joe|Daniel|Ethan|Harry|Oliver|Jack|Jacob|Noah|Thomas|Charlie|Oscar|William|James|George|Leo|Arthur|Freddie|Alfie|Henry|Archie|Isaac|Teddy|Finley|Lucas|Mason|Max|Reuben|Sebastian|Theo|Alexander|Benjamin|Caleb|Dylan|Elliott|Felix|Gruffudd|Harri|Iestyn|Ioan|Llewelyn|Morgan|Owain|Rhys",
    "Jones|Williams|Davies|Evans|Thomas|Roberts|Lewis|Hughes|Morgan|Griffiths|Edwards|James|Rees|Owen|Price|Phillips|Powell|Harris|Jenkins|Hopkins|Howells|Isaacs|John|Lloyd|Matthews|Morris|Parry|Pritchard|Richards|Rowlands|Samuel|Vaughan|Watkins|Williams|Bevan|Bowen|Charles|Daniel|Ellis|Francis|Gareth|Howell|Ivor|Jarman|Kendrick",
  ),
  den: mk(
    "William|Noah|Oscar|Carl|Victor|Oliver|Alfred|Emil|August|Malthe|Magnus|Felix|Anton|Alexander|Frederik|Christian|Mathias|Sebastian|Jonas|Benjamin|Lucas|Mikkel|Philip|Tobias|Andreas|Daniel|Henrik|Jakob|Lasse|Martin|Nikolaj|Peter|Rasmus|Simon|Thomas|Ulrik|Viktor|Anders|Bjørn|Erik|Frans|Hans|Jens|Kasper|Lars",
    "Nielsen|Jensen|Hansen|Pedersen|Andersen|Christensen|Larsen|Sørensen|Rasmussen|Jørgensen|Petersen|Madsen|Kristensen|Olsen|Thomsen|Johansen|Knudsen|Holm|Kjær|Møller|Schmidt|Lund|Dam|Berg|Krogh|Vestergaard|Winther|Aagaard|Bach|Dahl|Eriksen|Frandsen|Gregersen|Hedegaard|Iversen|Kjeldsen|Laursen|Mortensen|Nygaard|Overgaard|Poulsen|Skov|Thorsen|Villadsen|Würtz",
  ),
  hun: mk(
    "Balázs|Gergely|László|Zoltán|Attila|István|Tamás|Ádám|Dániel|Máté|Bence|Levente|Péter|Norbert|Roland|Szabolcs|Viktor|András|Csaba|Endre|Ferenc|György|János|Károly|Márk|Olivér|Patrik|Richárd|Sándor|Tibor|Ákos|Botond|Dénes|Ervin|Gábor|Hunor|Imre|Jenő|Krisztián|Mihály|Örs|Pál|Róbert|Szilárd|Vilmos",
    "Nagy|Kovács|Tóth|Szabó|Horváth|Varga|Kiss|Molnár|Németh|Farkas|Balogh|Papp|Takács|Juhász|Lakatos|Oláh|Simon|Rácz|Fekete|Szilágyi|Boros|Császár|Dudás|Erdős|Gál|Hajdu|Iványi|Kelemen|Lengyel|Magyar|Orbán|Pintér|Rózsa|Sárközi|Török|Váradi|Zsolnai|Bíró|Csontos|Dobos|Fábián|Győri|Hegedűs|Jakab|Kántor",
  ),
  svk: mk(
    "Marek|Peter|Ján|Tomáš|Martin|Juraj|Lukáš|Patrik|Filip|Adam|Matúš|Michal|Richard|Stanislav|Vladimír|Branislav|Dušan|Erik|Igor|Karol|Ladislav|Milan|Norbert|Ondrej|Radoslav|Slavomír|Tibor|Vlastimil|Zoltán|Andrej|Boris|Cyril|Dalibor|Emil|František|Gustáv|Henrich|Ivan|Jozef|Kristián|Ľubomír|Miroslav|Oldrich|Roman|Samuel",
    "Horváth|Kováč|Nagy|Tóth|Varga|Molnár|Baláž|Bartoš|Čech|Danko|Farkaš|Gajdoš|Hruška|Chovanec|Jančo|Kollár|Lukáč|Macák|Novotný|Oravec|Pavlík|Rusnák|Šimko|Tóth|Urban|Valach|Zeman|Babjak|Černák|Dvonč|Ferenc|Gašpar|Holub|Chalupka|Juriga|Krajčír|Lobotka|Meszároš|Nemec|Polák|Rabatin|Škriniar|Tatar|Vavro|Weiss",
  ),
  che: mk(
    "Nico|Fabian|Loris|Xaver|Remo|Yann|Denis|Ricardo|Silvan|Christian|Michael|Daniel|Thomas|Patrick|Simon|Andreas|Marco|Stefan|Lukas|David|Jonas|Manuel|Philipp|Sven|Adrian|Benjamin|Cédric|Florian|Julien|Kevin|Maxime|Nicolas|Olivier|Raphaël|Samuel|Vincent|Alexandre|Baptiste|Clément|Étienne|Guillaume|Hugo|Jérémy|Loïc|Pierre",
    "Müller|Fischer|Weber|Schneider|Keller|Huber|Meyer|Widmer|Steiner|Gerber|Baumann|Frei|Kaufmann|Lehmann|Wyss|Zbinden|Bühler|Clerc|Dubois|Favre|Girard|Jaquet|Monnier|Rochat|Savary|Aebi|Bolliger|Christen|Dietrich|Eggenberger|Fankhauser|Graf|Häberli|Ineichen|Jost|Kistler|Lüthi|Moser|Niederhauser|Odermatt|Pfister|Rohner|Stucki|Tschopp|Vogt",
  ),
  aut: mk(
    "Marko|Marcel|Sasa|David|Michael|Florian|Konrad|Xaver|Patrick|Daniel|Thomas|Andreas|Stefan|Martin|Christian|Alexander|Benjamin|Felix|Johannes|Lukas|Matthias|Maximilian|Niklas|Philipp|Sebastian|Tobias|Valentin|Adrian|Dominik|Fabian|Gregor|Julian|Leon|Moritz|Oliver|Paul|Raphael|Simon|Tim|Vincent|Wolfgang|Bernhard|Clemens|Emanuel|Franz",
    "Gruber|Leitner|Lazaro|Baumgartner|Lainer|Wimmer|Schlager|Prödl|Dragović|Lienhart|Hinteregger|Kainz|Gregoritsch|Janko|Ulmer|Weimann|Zulj|Burgstaller|Fuchs|Harnik|Jantscher|Klein|Leitgeb|Ranftl|Schoop|Ulreich|Holzer|Ziereis|Almer|Bauer|Eder|Freis|Holzhauser|Ilsanker|Kitzmüller|Lasko|Mader|Nussbaumer|Prokop|Reinhardt|Sturm|Triendl|Wohlfarter|Zech",
  ),
  bih: mk(
    "Edin|Miralem|Senad|Haris|Ermin|Ibrahim|Amer|Gojko|Adnan|Kenan|Muhamed|Nermin|Ognjen|Samir|Tarik|Vedad|Zoran|Armin|Bojan|Damir|Elvir|Faruk|Goran|Jasmin|Kemal|Mirza|Nedim|Omer|Rifat|Safet|Vedran|Zlatko|Adis|Bakir|Dženan|Emir|Fuad|Ismar|Jusuf|Ljubiša|Mustafa|Nedžad|Rijad|Salem|Harun|Kerim",
    "Hadžić|Kapić|Muslimović|Omerović|Pandža|Rahimić|Šehić|Tihić|Zahirović|Alispahić|Bajramović|Ćosić|Demirović|Fazlić|Hasić|Jusić|Kovačević|Mahmutović|Nadarević|Osmanović|Pandurević|Ristić|Sušić|Tomić|Vranješ|Zukić|Bešlagić|Čengić|Džafić|Ferhatović|Glamočanin|Halilović|Ibrisimović|Krdžić|Ljajić|Mahmić|Nukić|Osmanić|Pirić|Ramić|Salihović|Tufekčić|Vilić|Čolić",
  ),
  mkd: mk(
    "Goran|Stole|Eljif|Ezgjan|Enis|Boban|Darko|Igor|Aleksandar|Stefan|Nikola|Marko|Filip|Daniel|Martin|Petar|Vlatko|Bojan|Dejan|Emil|Hristijan|Jovan|Kire|Ljupcho|Mario|Oliver|Panche|Riste|Sashko|Todor|Viktor|Zoran|Andrej|Blagoj|Damjan|Ervin|Goce|Ilija|Jani|Kosta|Mile|Naum|Pece|Risto|Sasho",
    "Ristovski|Spirovski|Ademi|Babunski|Churlinov|Demiri|Elezi|Hasani|Jankulovski|Kostadinov|Lichina|Mavrov|Naumovski|Ristevski|Stojanovski|Velkovski|Zajkov|Angelov|Bogdanov|Chochev|Davkov|Gjorgjiev|Hristov|Iliev|Jovanov|Kitanovski|Lazarov|Mitev|Nikolov|Popov|Radevski|Stamenkov|Trajkov|Ugrinovski|Vasilev|Zdravkovski|Atanasov|Boskovski|Čurović|Dodevski|Filipovski|Gjorčev|Hristovski|Ilievski|Janevski|Kocev",
  ),
  gre: mk(
    "Giorgos|Konstantinos|Dimitris|Nikos|Alexandros|Stefanos|Vasilis|Panagiotis|Christos|Ioannis|Michalis|Andreas|Evangelos|Filippos|Haralambos|Ilias|Kyriakos|Leonidas|Manolis|Petros|Spyros|Theodoros|Yannis|Zacharias|Athanasios|Charalampos|Eleftherios|Georgios|Hristos|Iakovos|Lazaros|Matthaios|Nikolaos|Orestis|Pavlos|Sotiris|Thanasis|Vangelis|Xenophon|Yorgos|Agamemnon|Babis|Costas|Demetrios|Efstathios",
    "Papadopoulos|Georgiou|Nikolaidis|Dimitriou|Vasiliou|Konstantinou|Petrou|Antoniou|Ioannidis|Christou|Alexiou|Stavrou|Theodorou|Panagiotopoulos|Kalogeropoulos|Mavrogiannis|Stefanidis|Tzavellas|Fortounis|Giannopoulos|Kontos|Mitropoulos|Paschalidis|Samarakis|Tachmatzidis|Vlachopoulos|Zekos|Anagnostakis|Bakopoulos|Chatzopoulos|Doukas|Galinos|Katsoulis|Lampropoulos|Mavridis|Pavlidis|Retsinas|Sifakis|Tzolas|Vasilakis|Vrionis|Zografos|Arvanitis|Botsaris|Cholevas|Delopoulos",
  ),
  tur: mk(
    "Emre|Hakan|Arda|Cengiz|Kenan|Merih|Ozan|Okay|Orkun|Umut|Yusuf|Burak|Caner|Enes|Ferdi|Gökhan|Halil|İlkay|Kerem|Mahmut|Nuri|Oğuz|Salih|Taylan|Volkan|Yunus|Ahmet|Berk|Çağlar|Doğan|Efe|Fatih|Güven|Hüseyin|İsmail|Kaan|Levent|Murat|Onur|Rıdvan|Serkan|Tolga|Uğur|Yasin|Zafer",
    "Yılmaz|Demir|Şahin|Çelik|Kaya|Arslan|Doğan|Öztürk|Aydın|Özdemir|Kılıç|Aslan|Koç|Polat|Erdoğan|Kurt|Özkan|Şimşek|Kara|Çetin|Kaplan|Tekin|Yüksel|Akar|Bulut|Duran|Eren|Güneş|Işık|Karaca|Mutlu|Şen|Turan|Ünal|Yavuz|Acar|Bozkurt|Çiftçi|Dere|Güler|Keskin|Özer|Şeker|Tunç|Yıldız",
  ),
  geo: mk(
    "Giorgi|Luka|Khvicha|Zuriko|Jambul|Solomon|Otar|Levan|Davit|Nika|Irakli|Giorgi|Lasha|Mamuka|Revaz|Shota|Tamaz|Vakhtang|Zaza|Archil|Besik|Dito|Erekle|Gela|Iago|Kakhaber|Lado|Malkhaz|Paata|Ramaz|Sergo|Tengiz|Ucha|Vano|Zurab|Akaki|Beka|Dachi|Giga|Irakli|Jaba|Kote|Leri|Mindia|Nodar",
    "Kbilashvili|Mamrikishvili|Kashakashvili|Kankoshvili|Chakvadze|Kobadze|Gvilava|Kvekheridze|Aburjani|Dvalishvili|Gugeshvili|Katchibadze|Lobjanishvili|Merebashvili|Navalishvili|Qazaishvili|Shengeliya|Tabatadze|Vashakidze|Zivzivadze|Arveladze|Beridze|Chanturia|Davitashvili|Gagnidze|Janelidze|Kipiani|Lomtatidze|Mchedlidze|Odikadze|Papuashvili|Shubitidze|Tsereteli|Vatsadze|Zoidze|Abashidze|Bolkvadze|Chkheidze|Gelashvili|Jgharkava|Kopaliani|Lekvinadze|Mdivani|Rukhadze|Sharvashidze|Tskhadadze",
  ),
  cod: mk(
    "Dieumerci|Yannick|Cédric|Chancel|Arthur|Gaël|Jonathan|Jordan|Paul-José|Samuel|Steve|Youssouf|Fabrice|Grégory|Héritier|Joël|Lobi|Marcel|Merveil|Trésor|Wilfried|Yves|Benjamin|Christian|Daniel|Emmanuel|François|Guy|Henri|Jacques|Louis|Michel|Olivier|Patrick|Robert|Serge|André|Claude|Dominique|Eric|Florent|Gérard|Hubert|Jean|Luc",
    "Kabongo|Bolinga|Wissa|Malonga|Mobulu|Luyeye|Tshimanga|Bokila|Kasongo|Lualaba|Matumona|Ndombe|Omasombo|Paluku|Kabasele|Lukoji|Mputu|Nzuzi|Onanga|Banza|Diangana|Ikoko|Lokilo|Mukendi|Nzila|Diba|Ilunga|Luyindula|Bope|Dikanda|Ilanga|Kafanda|Lusamba|Mulumba|Bokote|Ditu|Kasai|Lumena|Mobanza|Nkongolo|Tshibola",
  ),
  sen: mk(
    "Kassoum|Idrissa|Cheikhou|Ismaïla|Badou|Famara|Habib|Lamine|Mame|Oumar|Pape|Youssou|Abdoulaye|Boubacar|Cheikh|Djibril|Fallou|Gora|Ibrahima|Lassana|Moussa|Ousmane|Papa|Serigne|Tidiane|Yaya|Abdou|Babacar|Demba|El Hadji|Fodé|Mamadou|Khassim|Modou|Ndongo|Seydou|Tapha|Yacouba|Abib|Bachir|Cheikhna|Dialo|Moustapha|Oumarou|Samba|Thierno",
    "N'Diaye|Diallo|Fall|Sarr|Sow|Touré|Ba|Cissé|Diop|Faye|Niang|Seck|Sy|Thiam|Wade|Ndao|Samb|Diagne|Gaye|Lo|Ndiaye|Sène|Sylla|Traoré|Yade|Aïdara|Badiane|Camara|Diouf|Ly|Niane|Badji|Beye|Coly|Diatta|Gomis|Lopy|Ngom|Wade|Bâ|Dramé|Faye|Gueye|Lô|Sène",
  ),
  mli: mk(
    "Yves|Adama|Amadou|Bakary|Cheick|Drissa|Fousseyni|Ibrahim|Kalifa|Lassana|Mohamed|Oumar|Sékou|Youba|Abdoulaye|Boubacar|Daouda|Elhadj|Fanta|Gaoussou|Hamed|Issa|Kassoum|Lamine|Mamadou|Ousmane|Pape|Salif|Tidiane|Yacouba|Ali|Balla|Djibril|Fatoumata|Guindo|Kader|Mahamadou|Nouhoum|Oumarou|Samba|Tiemoko|Yoro|Aly|Bakary|Cheickna|Diallo",
    "Traoré|Coulibaly|Diarra|Koné|Diallo|Touré|Keita|Sissoko|Doumbia|Sidibé|Dembele|Fofana|Kanté|Sangaré|Togola|Yattara|Bagayoko|Camara|Dembélé|Gakou|Maiga|Ouattara|Sako|Yalcouyé|Abeid|Bah|Cissoko|Diakité|Gindo|Koita|Samaké|Touré|Bamba|Diawara|Doucouré|Haidara|Kouyaté|Maïga|Samassa|Yatabaré|Aïdara|Ballo|Diakhaté|Fane|Kanté|Moctar",
  ),
  ksa: mk(
    "Salem|Mohammed|Fahad|Abdullah|Yasser|Saud|Ali|Hassan|Omar|Khalid|Turki|Nawaf|Faisal|Bandar|Salman|Tariq|Abdulaziz|Badr|Fahd|Hamad|Ibrahim|Mansour|Rashid|Sultan|Yahya|Zayed|Adel|Bassam|Faris|Hakim|Jamal|Karim|Maher|Nasser|Osama|Qasim|Rami|Tamer|Waleed|Youssef|Ahmed|Emad|Hani|Khaled|Marwan",
    "Al-Dawsari|Al-Bulayhi|Al-Muwallad|Al-Shehri|Al-Owais|Al-Faraj|Al-Jassim|Al-Shahrani|Al-Hamdan|Al-Malki|Al-Obaid|Al-Rubaie|Al-Zahrani|Al-Ghamdi|Al-Harbi|Al-Qahtani|Al-Zahrani|Al-Amri|Al-Dosari|Al-Ghamdi|Al-Juhani|Al-Mutairi|Al-Rashidi|Al-Subaie|Al-Yami|Al-Zahrani|Al-Ali|Al-Dakhil|Al-Fayez|Al-Harthy|Al-Khalaf|Al-Mansouri|Al-Otaibi|Al-Rajhi|Al-Shamrani|Al-Tamimi|Al-Wuhaibi|Al-Zahrani|Al-Ajmi|Al-Dosari|Al-Garni|Al-Hussain|Al-Mazrouei|Al-Rashid|Al-Shehri",
  ),
  irn: mk(
    "Alireza|Mehdi|Sardar|Karim|Masoud|Ramin|Vahid|Ashkan|Omid|Pejman|Reza|Saeid|Hossein|Morteza|Amir|Behnam|Farhad|Javad|Kaveh|Mostafa|Navid|Parviz|Rostam|Shahab|Yashar|Arash|Babak|Dariush|Ehsan|Farshid|Hamid|Kamran|Mahmoud|Nima|Payman|Siavash|Taha|Yousef|Arman|Behrouz|Cyrus|Davood|Ebrahim|Farzin|Hadi",
    "Rahmanpour|Hosseinzadeh|Ghafouri|Tabrizi|Hajisafi|Behnamvand|Pourya|Rezapanah|Amirhossein|Ebrahimi|Khalilzadeh|Milad|Moharrami|Nourollahi|Shojaei|Abdolmaleki|Ansarifar|Bagheri|Gholizadeh|Hosseini|Karimi|Montazeri|Rafiei|Shiri|Alipour|Eskandari|Fazeli|Hashemi|Khatibi|Mahdavi|Nekouei|Rahmati|Aghili|Borhani|Davari|Ghotbi|Heydari|Kazemi|Mansouri|Navidpour|Rahbar|Zandifar|Jafari|Keshavarz|Moradi|Najafi",
  ),
  uzb: mk(
    "Jaloliddin|Eldor|Otabek|Ikrom|Azizbek|Dostonbek|Khojiakbar|Sanjar|Sherzod|Temur|Ulugbek|Vokhid|Zafarbek|Abror|Bobur|Dilshod|Farrukh|Gulom|Islom|Javlon|Kamoliddin|Lutfulla|Mirjalol|Nodir|Oybek|Rustam|Sardor|Tohir|Umid|Zokir|Akbar|Bakhrom|Davron|Ergash|Fazliddin|Hikmat|Ibrohim|Jasur|Komil|Muxammad|Nuriddin|Olim|Ravshan|Shavkat|Temur",
    "Maqsudov|Shomurodov|Turgunboev|Khashimov|Sidikov|Alibaev|Ganiev|Mirzayev|Rakhmatullaev|Yuldashev|Akhmedov|Dustov|Ergashev|Hasanov|Ismoilov|Juraev|Kholmurodov|Muminov|Norboev|Ochilov|Pulatov|Ruziev|Saidov|Toshmatov|Umarov|Yakubov|Ziyoev|Abdurakhmonov|Bobojonov|Davlataliev|Ermatov|Hamidov|Ibragimov|Jalolov|Kurbanov|Mamatkulov|Nabiev|Ortikov|Rahimov|Sobirov|Tursunov|Uktamov|Yusupov|Zokirov|Abdullaev|Boltayev",
  ),
  qat: mk(
    "Akram|Almoez|Assim|Bassam|Hassan|Khalid|Meshaal|Mustafa|Saad|Yousef|Abdulrahman|Ali|Fahad|Hamad|Ibrahim|Jassim|Mohammed|Nasser|Omar|Salman|Tariq|Youssef|Ahmed|Badr|Faisal|Khaled|Maher|Sultan|Waleed|Yahya|Adel|Bassam|Faris|Hani|Jamal|Karim|Nawaf|Osama|Rashid|Tamer|Zayed|Abdulla|Emad|Hakim|Marwan|Qasim",
    "Al-Haydos|Hassan|Khader|Alaaeldin|Boudiaf|Madibo|Salman|Al-Kuwari|Al-Rawi|Al-Shahrani|Borai|Daham|Ghanim|Jalal|Khalifa|Mansour|Nasser|Obaid|Rashid|Al-Ali|Al-Dosari|Al-Hail|Al-Mansouri|Al-Obaidly|Al-Rumaihi|Al-Sulaiti|Al-Thani|Bakhit|Darwish|Fadhel|Ghareeb|Hajri|Jaber|Khouri|Musa|Naim|Othman|Rahman|Salem|Al-Abdulla|Al-Baker|Al-Darwish|Al-Emadi|Al-Hajri|Al-Muftah",
  ),
  irq: mk(
    "Ali|Ahmed|Mohammed|Hussein|Omar|Karrar|Safaa|Bashar|Dhurgham|Humam|Mustafa|Noor|Rebin|Yaser|Zaid|Abdullah|Bassim|Falah|Haidar|Jassim|Khalid|Laith|Muntadher|Rasheed|Taha|Younis|Adnan|Emad|Firas|Hammadi|Ibrahim|Kadhim|Mahdi|Nabil|Qusay|Saif|Wisam|Yahya|Amjad|Bilal|Dhia|Farouk|Hayder|Ismail|Karim",
    "Adnan|Hussein|Mahdi|Rashid|Salim|Tariq|Yasin|Abbas|Faris|Hameed|Jabbar|Kamil|Mohsin|Nouri|Qasim|Saeed|Talib|Zaid|Abdul|Basim|Fadel|Hakim|Jalal|Kasim|Majid|Naji|Rami|Sami|Wahab|Younes|Akram|Baha|Dhia|Fathi|Hani|Issa|Khalaf|Murtada|Nashat|Raad|Sabah|Waleed|Yasser|Zuhair",
  ),
  jor: mk(
    "Yazan|Baha'|Anas|Ihsan|Musa|Yousef|Ali|Ahmed|Mohammed|Omar|Khalid|Tariq|Hamza|Ibrahim|Mahmoud|Salem|Youssef|Abdullah|Fadi|Hassan|Jamal|Karim|Nasser|Rami|Salim|Zaid|Adnan|Bilal|Firas|Hakim|Issa|Khaled|Maher|Nabil|Omar|Saeed|Waleed|Yahya|Amjad|Bassam|Emad|Fadi|Hani|Ibrahim|Kareem",
    "Al-Naimat|Al-Taamari|Al-Rawashdeh|Al-Mardi|Al-Dmeiri|Al-Bashir|Al-Eissa|Al-Fakhouri|Al-Haddad|Al-Jamal|Al-Khatib|Al-Maharmeh|Al-Nsour|Al-Rashdan|Al-Saudi|Al-Zoubi|Abu Hweij|Bani Atieh|Dahoud|Eid|Halabi|Jaber|Khatib|Mansour|Naber|Obeid|Qawasmi|Rousan|Salem|Zureikat|Abdel|Badr|Dajani|Fakhouri|Haddad|Jarrar|Kilani|Mashal|Nazzal|Odeh|Rifai|Sabbagh|Tarawneh|Zahran",
  ),
};
