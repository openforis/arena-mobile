export default {
  title: "Novosti",
  since: "Od verzije {{version}}",
  dontShowAgain: "Ne prikazuj ponovo",
  items: {
    geoAttribute: {
      title: "Geoprostorni atribut: crtanje poligona",
      description:
        "Istraživanja sada mogu sadržati **geoprostorne** atribute. U obrascu dodirnite **Nacrtaj poligon** i dodirujte mapu da biste dodali tačke granice (ili, dok hodate duž nje, koristite **Dodaj trenutnu lokaciju**), a zatim pritisnite **Zaustavi**.\n\nDodirnite tačku da biste je izabrali i prevukli, dodirnite središnju tačku da biste dodali novu tačku, a zatim **Sačuvaj**. Poligon se može preuzeti i kao GeoJSON.",
    },
    offlineMaps: {
      title: "Mape van mreže",
      description:
        "Otvorite **Mape van mreže** iz glavnog menija i pomoću **Dodaj oblast** preuzmite mapu oblasti od interesa prije odlaska na teren: biće dostupna i bez internet veze.\n\nNa kartici **PDF mape** možete uvesti i georeferencirane PDF mape: prikazuju se preko osnovne mape.",
    },
    recordsMap: {
      title: "Zapisi na mapi",
      description:
        "U listi zapisa dodirnite dugme **mapa** na vrhu da biste vidjeli svoje podatke na mapi: tačke uzorka (posjećene ili ne), lokacije zabilježene u atributima koordinata i putanje kretanja.\n\nKoristite **Slojevi** da izaberete šta se prikazuje i dodirnite tačku da vidite njene detalje i **Otvori** zapis.",
    },
    autoSync: {
      title: "Automatska sinhronizacija podataka",
      description:
        "Uključite **Automatska sinhronizacija** na dnu liste zapisa (ili u **Podešavanja**): kada ste povezani sa serverom, novi i izmijenjeni zapisi automatski se otpremaju u pozadini, bez ručnog slanja.\n\nDodirnite ikonu statusa sinhronizacije pored toga da pratite napredak ili da izaberete **Sinhronizuj sada**.",
    },
    externalGps: {
      title: "Eksterni GPS uređaji",
      description:
        "Koristite Bluetooth GPS prijemnik (npr. Bad Elf) za tačnije koordinate: u **Podešavanja > Lokacija i GPS** otvorite **Izvor GPS-a** i izaberite **Upari novi uređaj…**.\n\nUz opciju **Automatski**, eksterni GPS se koristi kad god je povezan, a u suprotnom interni GPS uređaja.",
    },
  },
};
