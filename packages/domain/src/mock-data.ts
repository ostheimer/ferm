import type { DemoData } from "./types";

export const demoData: DemoData = {
  reviere: [
    {
      id: "revier-attersee",
      tenantKey: "attersee-nord",
      name: "Jagdgesellschaft Attersee Nord",
      bundesland: "Oberösterreich",
      bezirk: "Vöcklabruck",
      flaecheHektar: 1480,
      zentrum: {
        lat: 47.9134,
        lng: 13.5251,
        label: "Attersee Nord"
      }
    }
  ],
  users: [
    {
      id: "user-steyrer",
      name: "Anna Steyrer",
      phone: "+43 664 1234567",
      email: "anna.steyrer@ferm.at"
    },
    {
      id: "user-huber",
      name: "Lukas Huber",
      phone: "+43 676 1002003",
      email: "lukas.huber@ferm.at"
    },
    {
      id: "user-mair",
      name: "Martin Mair",
      phone: "+43 660 7008009",
      email: "martin.mair@ferm.at"
    }
  ],
  memberships: [
    {
      id: "member-admin",
      userId: "user-steyrer",
      revierId: "revier-attersee",
      role: "revier-admin",
      jagdzeichen: "AS-01",
      pushEnabled: true
    },
    {
      id: "member-schrift",
      userId: "user-mair",
      revierId: "revier-attersee",
      role: "schriftfuehrer",
      jagdzeichen: "MM-04",
      pushEnabled: true
    },
    {
      id: "member-jaeger",
      userId: "user-huber",
      revierId: "revier-attersee",
      role: "jaeger",
      jagdzeichen: "LH-07",
      pushEnabled: true
    }
  ],
  devices: [
    {
      id: "device-anna",
      membershipId: "member-admin",
      platform: "ios",
      pushToken: "expo-token-anna",
      lastSeenAt: "2026-04-03T08:05:00+02:00"
    },
    {
      id: "device-lukas",
      membershipId: "member-jaeger",
      platform: "android",
      pushToken: "expo-token-lukas",
      lastSeenAt: "2026-04-03T07:55:00+02:00"
    }
  ],
  ansitze: [
    {
      id: "ansitz-1",
      revierId: "revier-attersee",
      membershipId: "member-jaeger",
      standortId: "einrichtung-1",
      standortName: "Hochstand Buchenhang",
      location: {
        lat: 47.9161,
        lng: 13.5182,
        label: "Buchenhang"
      },
      startedAt: "2026-04-03T05:45:00+02:00",
      plannedEndAt: "2026-04-03T09:30:00+02:00",
      note: "Sauenwechsel im unteren Graben beobachten.",
      status: "active",
      conflict: false
    },
    {
      id: "ansitz-2",
      revierId: "revier-attersee",
      membershipId: "member-admin",
      standortId: "einrichtung-3",
      standortName: "Ansitz Wiesenrand",
      location: {
        lat: 47.9124,
        lng: 13.5312,
        label: "Wiesenrand"
      },
      startedAt: "2026-04-03T06:10:00+02:00",
      note: "Kurzer Frühansitz wegen Wildschaden.",
      status: "active",
      conflict: false
    }
  ],
  reviereinrichtungen: [
    {
      id: "einrichtung-1",
      revierId: "revier-attersee",
      type: "hochstand",
      name: "Hochstand Buchenhang",
      status: "gut",
      location: {
        lat: 47.9161,
        lng: 13.5182,
        label: "Buchenhang"
      },
      beschreibung: "Leiterstand mit Blick auf Schneise und Graben.",
      photos: [
        {
          id: "photo-stand-1",
          title: "Buchenhang Ostseite",
          url: "https://images.example.invalid/buchenhang.jpg",
          createdAt: "2026-03-28T10:00:00+01:00"
        }
      ],
      kontrollen: [
        {
          id: "kontrolle-1",
          createdAt: "2026-03-28T10:00:00+01:00",
          createdByMembershipId: "member-admin",
          zustand: "gut",
          note: "Leiter und Dach in Ordnung."
        }
      ],
      wartung: []
    },
    {
      id: "einrichtung-2",
      revierId: "revier-attersee",
      type: "fuetterung",
      name: "Fütterung Forststraße",
      status: "wartung-faellig",
      location: {
        lat: 47.9184,
        lng: 13.5219,
        label: "Forststraße"
      },
      beschreibung: "Winterfütterung oberhalb der Kehre.",
      photos: [],
      kontrollen: [
        {
          id: "kontrolle-2",
          createdAt: "2026-04-01T07:15:00+02:00",
          createdByMembershipId: "member-jaeger",
          zustand: "wartung-faellig",
          note: "Deckel verzogen, Nachfüllung schwierig."
        }
      ],
      wartung: [
        {
          id: "wartung-1",
          dueAt: "2026-04-06T16:00:00+02:00",
          status: "offen",
          title: "Deckel richten",
          note: "Holzleiste tauschen."
        }
      ]
    },
    {
      id: "einrichtung-3",
      revierId: "revier-attersee",
      type: "hochstand",
      name: "Ansitz Wiesenrand",
      status: "gut",
      location: {
        lat: 47.9124,
        lng: 13.5312,
        label: "Wiesenrand"
      },
      beschreibung: "Schwenkbarer Stuhl, ideal bei Westwind.",
      photos: [],
      kontrollen: [],
      wartung: []
    }
  ],
  fallwild: [
    {
      id: "fallwild-1",
      revierId: "revier-attersee",
      reportedByMembershipId: "member-jaeger",
      recordedAt: "2026-04-03T06:55:00+02:00",
      location: {
        lat: 47.9201,
        lng: 13.5194,
        label: "L127 Abzweigung Weyregg"
      },
      wildart: "Reh",
      geschlecht: "weiblich",
      altersklasse: "Adult",
      bergungsStatus: "geborgen",
      gemeinde: "Steinbach am Attersee",
      strasse: "L127",
      note: "Gemeinsam mit Straßenmeisterei gesichert.",
      photos: [
        {
          id: "photo-fallwild-1",
          title: "Unfallstelle",
          url: "https://images.example.invalid/fallwild-1.jpg",
          createdAt: "2026-04-03T06:56:00+02:00"
        }
      ]
    }
  ],
  sitzungen: [
    {
      id: "sitzung-1",
      revierId: "revier-attersee",
      title: "Frühjahrsbesprechung 2026",
      scheduledAt: "2026-04-11T19:00:00+02:00",
      locationLabel: "Jagdhaus Attersee Nord",
      status: "entwurf",
      participants: [
        {
          membershipId: "member-admin",
          anwesend: true
        },
        {
          membershipId: "member-schrift",
          anwesend: true
        },
        {
          membershipId: "member-jaeger",
          anwesend: false
        }
      ],
      versions: [
        {
          id: "version-1",
          createdAt: "2026-04-02T21:15:00+02:00",
          createdByMembershipId: "member-schrift",
          summary: "Erster Entwurf mit Themen zu Fallwild und Hochstandwartung.",
          agenda: ["Begrüßung", "Fallwildstatistik", "Wartungsplan Hochstände"],
          beschluesse: [
            {
              id: "beschluss-1",
              title: "Wartung Buchenhang",
              decision: "Kontrolle aller Leiterstände bis 20. April abschließen.",
              owner: "Anna Steyrer",
              dueAt: "2026-04-20T18:00:00+02:00"
            }
          ],
          attachments: []
        }
      ]
    }
  ],
  notifications: [
    {
      id: "notification-1",
      revierId: "revier-attersee",
      channel: "push",
      title: "Ansitz aktiv",
      body: "Lukas Huber sitzt am Hochstand Buchenhang an.",
      createdAt: "2026-04-03T05:46:00+02:00"
    },
    {
      id: "notification-2",
      revierId: "revier-attersee",
      channel: "in-app",
      title: "Fallwild geborgen",
      body: "Ein Reh an der L127 wurde dokumentiert und geborgen.",
      createdAt: "2026-04-03T06:57:00+02:00"
    }
  ]
};

export function cloneDemoData(): DemoData {
  return JSON.parse(JSON.stringify(demoData)) as DemoData;
}
