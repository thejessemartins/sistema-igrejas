import { asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  events,
  worshipSetlistItems,
  worshipSetlists,
  worshipSongs,
} from "@/db/schema";

export async function getWorshipSongs() {
  return db
    .select()
    .from(worshipSongs)
    .where(isNull(worshipSongs.deletedAt))
    .orderBy(asc(worshipSongs.title));
}

export async function getWorshipSetlists() {
  const [setlists, items, eventsList, songs] = await Promise.all([
    db
      .select({
        id: worshipSetlists.id,
        title: worshipSetlists.title,
        eventTitle: events.title,
      })
      .from(worshipSetlists)
      .innerJoin(events, eq(worshipSetlists.eventId, events.id))
      .orderBy(desc(worshipSetlists.createdAt)),
    db
      .select({
        id: worshipSetlistItems.id,
        setlistId: worshipSetlistItems.setlistId,
        position: worshipSetlistItems.position,
        songTitle: worshipSongs.title,
        defaultKey: worshipSongs.musicalKey,
        musicalKeyOverride: worshipSetlistItems.musicalKeyOverride,
      })
      .from(worshipSetlistItems)
      .innerJoin(worshipSongs, eq(worshipSetlistItems.songId, worshipSongs.id))
      .orderBy(asc(worshipSetlistItems.position)),
    db
      .select({ id: events.id, title: events.title })
      .from(events)
      .where(isNull(events.deletedAt))
      .orderBy(desc(events.startsAt))
      .limit(15),
    getWorshipSongs(),
  ]);

  return {
    setlists: setlists.map((s) => ({
      ...s,
      items: items.filter((i) => i.setlistId === s.id),
    })),
    events: eventsList,
    songs,
  };
}
