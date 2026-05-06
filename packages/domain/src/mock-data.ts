import type { DemoData } from "./types";

export const demoData: DemoData = {
  reviere: [
    {
      id: "revier-attersee",
      tenantKey: "gaenserndorf",
      name: "Jagdgesellschaft Gänserndorf",
      bundesland: "Niederösterreich",
      bezirk: "Gänserndorf",
      flaecheHektar: 2150,
      setupCompletedAt: "2026-04-01T09:00:00+02:00",
      zentrum: {
        lat: 48.3394,
        lng: 16.7202,
        label: "Gänserndorf"
      }
    }
  ],
  users: [
    {
      id: "user-steyrer",
      name: "Andreas Ostheimer",
      phone: "+43 660 0000000",
      email: "andreas@ostheimer.at",
      username: "ostheimer"
    },
    {
      id: "user-revierleitung",
      name: "Revierleitung Gänserndorf",
      phone: "+43 660 1001001",
      email: "revierleitung@hege.app",
      username: "revieradmin"
    },
    {
      id: "user-huber",
      name: "Lukas Huber",
      phone: "+43 676 1002003",
      email: "lukas.huber@hege.app",
      username: "huber"
    },
    {
      id: "user-mair",
      name: "Martin Mair",
      phone: "+43 660 7008009",
      email: "martin.mair@hege.app",
      username: "mair"
    }
  ],
  memberships: [
    {
      id: "member-admin",
      userId: "user-revierleitung",
      revierId: "revier-attersee",
      role: "revier-admin",
      jagdzeichen: "RL-01",
      pushEnabled: true
    },
    {
      id: "member-ausgeher",
      userId: "user-steyrer",
      revierId: "revier-attersee",
      role: "ausgeher",
      jagdzeichen: "AO-01",
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
      id: "device-andreas",
      membershipId: "member-ausgeher",
      platform: "ios",
      pushToken: "expo-token-andreas",
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
      membershipId: "member-ausgeher",
      standortId: "einrichtung-1",
      standortName: "Hochstand Weikendorfer Remise",
      location: {
        lat: 48.3512,
        lng: 16.7258,
        label: "Weikendorfer Remise"
      },
      startedAt: "2026-04-03T05:45:00+02:00",
      plannedEndAt: "2026-04-03T09:30:00+02:00",
      note: "Rehwildwechsel am Feldrand beobachten.",
      status: "active",
      conflict: false
    },
    {
      id: "ansitz-2",
      revierId: "revier-attersee",
      membershipId: "member-admin",
      standortId: "einrichtung-3",
      standortName: "Ansitz Marchfeldrand",
      location: {
        lat: 48.3336,
        lng: 16.7014,
        label: "Marchfeldrand"
      },
      startedAt: "2026-04-03T06:10:00+02:00",
      note: "Kurzer Frühansitz wegen Wildschaden am Mais.",
      status: "active",
      conflict: false
    }
  ],
  reviereinrichtungen: [
    {
      id: "einrichtung-1",
      revierId: "revier-attersee",
      type: "hochstand",
      name: "Hochstand Weikendorfer Remise",
      status: "gut",
      location: {
        lat: 48.3512,
        lng: 16.7258,
        label: "Weikendorfer Remise"
      },
      beschreibung: "Leiterstand mit Blick auf Remise und Feldkante.",
      photos: [
        {
          id: "photo-stand-1",
          title: "Weikendorfer Remise Ostseite",
          url: "https://images.example.invalid/weikendorfer-remise.jpg",
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
      name: "Fütterung Feldweg Nord",
      status: "wartung-faellig",
      location: {
        lat: 48.3468,
        lng: 16.7361,
        label: "Feldweg Nord"
      },
      beschreibung: "Winterfütterung entlang der Windschutzhecke.",
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
      name: "Ansitz Marchfeldrand",
      status: "gut",
      location: {
        lat: 48.3336,
        lng: 16.7014,
        label: "Marchfeldrand"
      },
      beschreibung: "Schwenkbarer Stuhl, ideal bei Nordwestwind.",
      photos: [],
      kontrollen: [],
      wartung: []
    }
  ],
  fallwild: [
    {
      id: "fallwild-1",
      revierId: "revier-attersee",
      reportedByMembershipId: "member-ausgeher",
      recordedAt: "2026-04-03T06:55:00+02:00",
      location: {
        lat: 48.3441,
        lng: 16.7289,
        label: "B8 Abzweigung Weikendorf",
        source: "device-gps",
        addressLabel: "B8, 2230 Gänserndorf"
      },
      wildart: "Reh",
      geschlecht: "weiblich",
      altersklasse: "Adult",
      bergungsStatus: "geborgen",
      gemeinde: "Gänserndorf",
      strasse: "B8",
      roadReference: {
        roadName: "B8",
        roadKilometer: "33,4",
        source: "gip"
      },
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
  reviermeldungen: [
    {
      id: "reviermeldung-1",
      revierId: "revier-attersee",
      createdByMembershipId: "member-ausgeher",
      category: "schaden",
      status: "neu",
      occurredAt: "2026-04-03T07:20:00+02:00",
      title: "Frischer Wildschaden am Maisacker",
      description: "Südlich vom Feldweg sind mehrere Reihen umgebrochen.",
      location: {
        lat: 48.3428,
        lng: 16.7334,
        label: "Feldweg Süd"
      },
      photos: [],
      createdAt: "2026-04-03T07:24:00+02:00",
      updatedAt: "2026-04-03T07:24:00+02:00"
    }
  ],
  aufgaben: [
    {
      id: "aufgabe-1",
      revierId: "revier-attersee",
      createdByMembershipId: "member-admin",
      sourceType: "reviereinrichtung",
      sourceId: "einrichtung-2",
      title: "Deckel der Fütterung richten",
      description: "Holzleiste tauschen und Deckel wieder leichtgängig machen.",
      status: "offen",
      priority: "hoch",
      dueAt: "2026-04-06T16:00:00+02:00",
      assigneeMembershipIds: ["member-ausgeher"],
      createdAt: "2026-04-03T08:00:00+02:00",
      updatedAt: "2026-04-03T08:00:00+02:00"
    }
  ],
  sitzungen: [
    {
      id: "sitzung-1",
      revierId: "revier-attersee",
      title: "Frühjahrsbesprechung 2026",
      scheduledAt: "2026-04-11T19:00:00+02:00",
      locationLabel: "Jagdhaus Gänserndorf",
      status: "entwurf",
      participants: [
        {
          membershipId: "member-admin",
          anwesend: true
        },
        {
          membershipId: "member-ausgeher",
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
              title: "Wartung Weikendorfer Remise",
              decision: "Kontrolle aller Leiterstände bis 20. April abschließen.",
              owner: "Andreas Ostheimer",
              dueAt: "2026-04-20T18:00:00+02:00"
            }
          ],
          attachments: []
        }
      ]
    },
    {
      id: "sitzung-2",
      revierId: "revier-attersee",
      title: "Winterabschluss 2025",
      scheduledAt: "2026-02-14T18:30:00+01:00",
      locationLabel: "Jagdhaus Gänserndorf",
      status: "freigegeben",
      participants: [
        {
          membershipId: "member-admin",
          anwesend: true
        },
        {
          membershipId: "member-ausgeher",
          anwesend: true
        },
        {
          membershipId: "member-schrift",
          anwesend: true
        }
      ],
      versions: [
        {
          id: "version-2",
          createdAt: "2026-02-15T08:10:00+01:00",
          createdByMembershipId: "member-schrift",
          summary: "Rückblick auf die Saison und Beschluss für den Frühjahrsputz.",
          agenda: ["Rückblick", "Abschussplan", "Frühjahrsputz"],
          beschluesse: [
            {
              id: "beschluss-2",
              title: "Frühjahrsputz",
              decision: "Gemeinsamer Reviertag am 22. März mit Fokus auf Hochstände und Wege.",
              owner: "Martin Mair",
              dueAt: "2026-03-22T09:00:00+01:00"
            }
          ],
          attachments: []
        }
      ],
      publishedDocument: {
        id: "document-sitzung-2",
        title: "Winterabschluss 2025 Protokoll",
        fileName: "winterabschluss-2025-protokoll.pdf",
        contentType: "application/pdf",
        url: "/api/v1/documents/document-sitzung-2/download",
        createdAt: "2026-02-15T08:30:00+01:00"
      }
    }
  ],
  notifications: [
    {
      id: "notification-1",
      revierId: "revier-attersee",
      channel: "push",
      title: "Ansitz aktiv",
      body: "Andreas Ostheimer sitzt am Hochstand Weikendorfer Remise an.",
      createdAt: "2026-04-03T05:46:00+02:00"
    },
    {
      id: "notification-2",
      revierId: "revier-attersee",
      channel: "in-app",
      title: "Fallwild geborgen",
      body: "Ein Reh an der B8 wurde dokumentiert und geborgen.",
      createdAt: "2026-04-03T06:57:00+02:00"
    },
    {
      id: "notification-3",
      revierId: "revier-attersee",
      channel: "in-app",
      title: "Protokoll veröffentlicht",
      body: "Das Protokoll Winterabschluss 2025 steht mobil zum Lesen bereit.",
      createdAt: "2026-02-15T08:32:00+01:00"
    }
  ]
};

export function cloneDemoData(): DemoData {
  return JSON.parse(JSON.stringify(demoData)) as DemoData;
}
