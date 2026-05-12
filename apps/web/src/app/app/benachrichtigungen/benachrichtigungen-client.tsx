"use client";

import type { NotificationItem } from "@hege/domain";
import { Bell, BellOff, Check, CheckCheck, MessageSquareText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  countUnread,
  getReadNotificationIds,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeReadIds
} from "../../../lib/notifications-read-state";

interface BenachrichtigungenClientProps {
  notifications: NotificationItem[];
}

type FilterKey = "alle" | "ungelesen";

export function BenachrichtigungenClient({ notifications }: BenachrichtigungenClientProps) {
  const [readIds, setReadIds] = useState<ReadonlyArray<string>>([]);
  const [filter, setFilter] = useState<FilterKey>("alle");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Beim Mount aus dem localStorage laden; danach Live-Updates ueber
    // den Subscribe-Channel (z.B. wenn auf einer anderen Sub-Seite
    // markRead aufgerufen wird).
    setReadIds(getReadNotificationIds());
    setHydrated(true);

    return subscribeReadIds((next) => {
      setReadIds(next);
    });
  }, []);

  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const visible = useMemo(() => {
    if (filter === "ungelesen") {
      return notifications.filter((entry) => !readSet.has(entry.id));
    }
    return notifications;
  }, [filter, notifications, readSet]);
  const unreadCount = countUnread(
    notifications.map((entry) => entry.id),
    readIds
  );

  function handleTap(notification: NotificationItem) {
    if (readSet.has(notification.id)) {
      return;
    }
    markNotificationRead(notification.id);
  }

  function handleMarkAll() {
    if (unreadCount === 0) {
      return;
    }
    markAllNotificationsRead(notifications.map((entry) => entry.id));
  }

  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Benachrichtigungen</p>
            <h1>
              {!hydrated
                ? "Letzte Meldungen"
                : unreadCount > 0
                  ? unreadCount === 1
                    ? "1 ungelesene Meldung."
                    : `${unreadCount} ungelesene Meldungen.`
                  : "Alles gelesen."}
            </h1>
            <p className="hero-copy">
              Push- und In-App-Nachrichten der letzten Zeit. Klick auf eine Karte markiert sie als
              gelesen — das wird lokal im Browser gespeichert.
            </p>
          </div>
          <div className="section-actions">
            {hydrated && unreadCount > 0 ? (
              <button className="button-control button-control-secondary" onClick={handleMarkAll} type="button">
                <CheckCheck aria-hidden="true" size={16} />
                Alle als gelesen
              </button>
            ) : null}
          </div>
        </header>

        <div className="notification-filter-row">
          <button
            aria-pressed={filter === "alle"}
            className={
              filter === "alle"
                ? "notification-filter-chip notification-filter-chip-active"
                : "notification-filter-chip"
            }
            onClick={() => setFilter("alle")}
            type="button"
          >
            Alle <span className="notification-filter-count">{notifications.length}</span>
          </button>
          <button
            aria-pressed={filter === "ungelesen"}
            className={
              filter === "ungelesen"
                ? "notification-filter-chip notification-filter-chip-active"
                : "notification-filter-chip"
            }
            onClick={() => setFilter("ungelesen")}
            type="button"
          >
            Ungelesen <span className="notification-filter-count">{hydrated ? unreadCount : "–"}</span>
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="empty-card">
            <BellOff aria-hidden="true" size={28} />
            <strong>
              {filter === "ungelesen" ? "Keine ungelesenen Meldungen" : "Noch keine Meldungen"}
            </strong>
            <p>
              {filter === "ungelesen"
                ? "Du bist auf dem aktuellen Stand."
                : "Sobald eine Sitzung freigegeben wird oder jemand Fallwild meldet, taucht hier eine Meldung auf."}
            </p>
          </div>
        ) : (
          <ul className="notification-list">
            {visible.map((notification) => {
              const isRead = readSet.has(notification.id);
              return (
                <li key={notification.id}>
                  <button
                    aria-label={isRead ? `${notification.title}, gelesen` : `${notification.title}, ungelesen`}
                    className={
                      isRead
                        ? "notification-card notification-card-read"
                        : "notification-card notification-card-unread"
                    }
                    onClick={() => handleTap(notification)}
                    type="button"
                  >
                    <div className="notification-card-head">
                      <span className="notification-channel">
                        {notification.channel === "push" ? (
                          <Bell aria-hidden="true" size={12} />
                        ) : (
                          <MessageSquareText aria-hidden="true" size={12} />
                        )}
                        {notification.channel === "push" ? "Push" : "In-App"}
                      </span>
                      {!isRead ? <span className="notification-unread-dot" aria-hidden="true" /> : null}
                      {isRead ? <Check aria-hidden="true" className="notification-read-mark" size={14} /> : null}
                    </div>
                    <strong>{notification.title}</strong>
                    <p>{notification.body}</p>
                    <time>{formatRelative(notification.createdAt)}</time>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "vor 1 Std." : `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Gestern";
  if (days < 7) return `vor ${days} Tagen`;
  try {
    return new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "short" }).format(then);
  } catch {
    return iso.slice(0, 10);
  }
}
