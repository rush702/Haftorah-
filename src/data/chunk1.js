// Chunk 1: Opening Blessing (sec 0), Isaiah 6:1-2 (sec 1), Isaiah 6:3 (sec 2)
const w = (h, t, tr = null) => ({ hebrew: h, transliteration: t, trop: tr });

export const SEC0_WORDS = [
  w('בָּרוּךְ','Ba-RUCH'), w('אַתָּה','a-TAH'), w('יְיָ','Ado-NAI'),
  w('אֱלֹהֵינוּ','E-lo-HEI-nu'), w('מֶלֶךְ','ME-lech'), w('הָעוֹלָם','ha-o-LAM'),
  w('אֲשֶׁר','a-SHER'), w('בָּחַר','ba-CHAR'), w('בִּנְבִיאִים','bin-vi-IM'),
  w('טוֹבִים','to-VIM'), w('וְרָצָה','v\'ra-TZAH'), w('בְּדִבְרֵיהֶם','b\'div-rei-HEM'),
  w('הַנֶּאֱמָרִים','ha-ne-e-ma-RIM'), w('בֶּאֱמֶת','be-e-MET'),
  w('בָּרוּךְ','Ba-RUCH'), w('אַתָּה','a-TAH'), w('יְיָ','Ado-NAI'),
  w('הַבּוֹחֵר','ha-bo-CHER'), w('בַּתּוֹרָה','ba-to-RAH'),
  w('וּבְמשֶׁה','u-v\'Mo-SHEH'), w('עַבְדּוֹ','av-DO'),
  w('וּבְיִשְׂרָאֵל','u-v\'Yis-ra-EL'), w('עַמּוֹ','a-MO'),
  w('וּבִנְבִיאֵי','u-vin-vi-EI'), w('הָאֱמֶת','ha-e-MET'), w('וָצֶדֶק','va-TZE-dek'),
];

export const SEC1_WORDS = [
  // Isaiah 6:1
  w('בִּשְׁנַת','bish-NAT','mercha'), w('מוֹת','MOT','tipcha'),
  w('הַמֶּלֶךְ','ha-ME-lech','mercha'), w('עֻזִּיָּהוּ','u-zi-YA-hu','etnachta'),
  w('וָאֶרְאֶה','va-er-EH','munach'), w('אֶת','et','mercha'),
  w('אֲדֹנָי','a-do-NAI','tipcha'), w('יֹשֵׁב','yo-SHEV','munach'),
  w('עַל','al','mercha'), w('כִּסֵּא','ki-SEI','zakef-katan'),
  w('רָם','ram','mercha'), w('וְנִשָּׂא','v\'ni-SA','tipcha'),
  w('וְשׁוּלָיו','v\'shu-LAV','mercha'), w('מְלֵאִים','m\'le-IM','mercha'),
  w('אֶת','et','mercha'), w('הַהֵיכָל','ha-hei-CHAL','sof-pasuk'),
  // Isaiah 6:2
  w('שְׂרָפִים','s\'ra-FIM','kadma'), w('עֹמְדִים','om-DIM','zakef-katan'),
  w('מִמַּעַל','mi-MA-al','mercha'), w('לוֹ','lo','tipcha'),
  w('שֵׁשׁ','shesh','munach'), w('כְּנָפַיִם','k\'na-FA-yim','zakef-katan'),
  w('שֵׁשׁ','shesh','munach'), w('כְּנָפַיִם','k\'na-FA-yim','zakef-katan'),
  w('לְאֶחָד','l\'e-CHAD','etnachta'),
  w('בִּשְׁתַּיִם','bish-TA-yim','mercha'), w('יְכַסֶּה','y\'cha-SEH','tipcha'),
  w('פָנָיו','pa-NAV','mercha'), w('וּבִשְׁתַּיִם','u-vish-TA-yim','mercha'),
  w('יְכַסֶּה','y\'cha-SEH','tipcha'), w('רַגְלָיו','rag-LAV','mercha'),
  w('וּבִשְׁתַּיִם','u-vish-TA-yim','mercha'), w('יְעוֹפֵף','y\'o-FEF','sof-pasuk'),
];

export const SEC2_WORDS = [
  // Isaiah 6:3 — the KADOSH verse
  w('וְקָרָא','v\'ka-RA','kadma'), w('זֶה','zeh','munach'),
  w('אֶל','el','mercha'), w('זֶה','zeh','tipcha'),
  w('וְאָמַר','v\'a-MAR','etnachta'),
  w('קָדוֹשׁ','ka-DOSH','kadma'),
  w('קָדוֹשׁ','ka-DOSH','mercha'),
  w('קָדוֹשׁ','ka-DOSH','zakef-katan'),
  w('יְהוָה','Ado-NAI','mercha'), w('צְבָאוֹת','ts\'va-OT','tipcha'),
  w('מְלֹא','m\'LO','mercha'), w('כָל','chol','mercha'),
  w('הָאָרֶץ','ha-A-retz','tipcha'), w('כְּבוֹדוֹ','k\'vo-DO','sof-pasuk'),
];
