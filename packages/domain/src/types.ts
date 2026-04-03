export type Role = "platform-admin" | "revier-admin" | "schriftfuehrer" | "jaeger";

export type NotificationChannel = "push" | "in-app";

export type AnsitzStatus = "active" | "completed";

export type EinrichtungTyp =
  | "hochstand"
  | "fuetterung"
  | "salzlecke"
  | "kirrung"
  | "kamera"
  | "wildacker";

export type EinrichtungZustand = "gut" | "wartung-faellig" | "gesperrt";

export type Wildart =
  | "Reh"
  | "Rotwild"
  | "Schwarzwild"
  | "Fuchs"
  | "Dachs"
  | "Hase"
  | "Muffelwild";

export type Geschlecht = "männlich" | "weiblich" | "unbekannt";

export type Altersklasse = "Kitz" | "Jährling" | "Adult" | "unbekannt";

export type BergungsStatus = "erfasst" | "geborgen" | "entsorgt" | "an-behoerde-gemeldet";

export type ProtokollStatus = "entwurf" | "freigegeben";

export interface GeoPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Revier {
  id: string;
  tenantKey: string;
  name: string;
  bundesland: string;
  bezirk: string;
  flaecheHektar: number;
  zentrum: GeoPoint;
}

export interface Membership {
  id: string;
  userId: string;
  revierId: string;
  role: Role;
  jagdzeichen: string;
  pushEnabled: boolean;
}

export interface Device {
  id: string;
  membershipId: string;
  platform: "ios" | "android";
  pushToken: string;
  lastSeenAt: string;
}

export interface DocumentAsset {
  id: string;
  title: string;
  fileName: string;
  contentType: string;
  url: string;
  createdAt: string;
}

export interface PhotoAsset {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

export interface AnsitzSession {
  id: string;
  revierId: string;
  membershipId: string;
  standortId?: string;
  standortName: string;
  location: GeoPoint;
  startedAt: string;
  plannedEndAt?: string;
  endedAt?: string;
  note?: string;
  status: AnsitzStatus;
  conflict: boolean;
}

export interface ReviereinrichtungKontrolle {
  id: string;
  createdAt: string;
  createdByMembershipId: string;
  zustand: EinrichtungZustand;
  note?: string;
}

export interface WartungsEintrag {
  id: string;
  dueAt: string;
  status: "offen" | "erledigt";
  title: string;
  note?: string;
}

export interface Reviereinrichtung {
  id: string;
  revierId: string;
  type: EinrichtungTyp;
  name: string;
  status: EinrichtungZustand;
  location: GeoPoint;
  beschreibung?: string;
  photos: PhotoAsset[];
  kontrollen: ReviereinrichtungKontrolle[];
  wartung: WartungsEintrag[];
}

export interface FallwildVorgang {
  id: string;
  revierId: string;
  reportedByMembershipId: string;
  recordedAt: string;
  location: GeoPoint;
  wildart: Wildart;
  geschlecht: Geschlecht;
  altersklasse: Altersklasse;
  bergungsStatus: BergungsStatus;
  gemeinde: string;
  strasse?: string;
  note?: string;
  photos: PhotoAsset[];
}

export interface Beschluss {
  id: string;
  title: string;
  decision: string;
  owner?: string;
  dueAt?: string;
}

export interface Teilnehmer {
  membershipId: string;
  anwesend: boolean;
}

export interface ProtokollVersion {
  id: string;
  createdAt: string;
  createdByMembershipId: string;
  summary: string;
  agenda: string[];
  beschluesse: Beschluss[];
  attachments: DocumentAsset[];
}

export interface Sitzung {
  id: string;
  revierId: string;
  title: string;
  scheduledAt: string;
  locationLabel: string;
  status: ProtokollStatus;
  participants: Teilnehmer[];
  versions: ProtokollVersion[];
  publishedDocument?: DocumentAsset;
}

export interface NotificationItem {
  id: string;
  revierId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  createdAt: string;
}

export interface DashboardOverview {
  revier: Revier;
  aktiveAnsitze: number;
  ansitzeMitKonflikt: number;
  offeneWartungen: number;
  heutigeFallwildBergungen: number;
  unveroeffentlichteProtokolle: number;
  letzteBenachrichtigungen: NotificationItem[];
  naechsteSitzung?: Sitzung;
}

export interface DemoData {
  reviere: Revier[];
  users: User[];
  memberships: Membership[];
  devices: Device[];
  ansitze: AnsitzSession[];
  reviereinrichtungen: Reviereinrichtung[];
  fallwild: FallwildVorgang[];
  sitzungen: Sitzung[];
  notifications: NotificationItem[];
}

export interface StartAnsitzPayload {
  revierId: string;
  membershipId: string;
  standortId?: string;
  standortName: string;
  location: GeoPoint;
  startedAt: string;
  plannedEndAt?: string;
  note?: string;
}

export interface EndAnsitzPayload {
  endedAt: string;
}

export interface CreateFallwildPayload {
  revierId: string;
  reportedByMembershipId: string;
  recordedAt: string;
  location: GeoPoint;
  wildart: Wildart;
  geschlecht: Geschlecht;
  altersklasse: Altersklasse;
  gemeinde: string;
  strasse?: string;
  bergungsStatus: BergungsStatus;
  note?: string;
}

export interface AddKontrollePayload {
  zustand: EinrichtungZustand;
  createdAt: string;
  createdByMembershipId: string;
  note?: string;
}
