import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { assets } from "./assets";
import { events } from "./events";
import { members } from "./members";
import { visitors } from "./visitors";

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  plateText: text("plate_text"),
  capacity: integer("capacity").notNull(),
  kind: text("kind").notNull(), // onibus | van | carro | outro
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  assetId: uuid("asset_id").references(() => assets.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const eventTrips = pgTable("event_trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "restrict" }),
  driverMemberId: uuid("driver_member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  driverText: text("driver_text"),
  departureAt: timestamp("departure_at").notNull(),
  departurePlaceText: text("departure_place_text").notNull(),
  returnAt: timestamp("return_at"),
  notes: text("notes"),
  status: text("status").notNull().default("planejada"), // planejada | realizada | cancelada
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const tripPassengers = pgTable(
  "trip_passengers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => eventTrips.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    visitorId: uuid("visitor_id").references(() => visitors.id, {
      onDelete: "set null",
    }),
    personName: text("person_name").notNull(),
    phone: text("phone"),
    boarded: boolean("boarded").notNull().default(false),
  },
  (table) => [
    unique("trip_passengers_trip_person_unique").on(
      table.tripId,
      table.personName
    ),
  ]
);
