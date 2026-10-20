import fs from "fs";
import path from "path";

export interface RestaurantItem {
  id: string;
  name: string;
  location: string;
  seatCount: number;
  image?: { url: string; uploadUrl?: string };
  "xata.createdAt"?: string;
  [key: string]: any;
}

export interface SeatItem {
  id: string;
  restaurant?: string | { id: string };
  row?: number;
  column?: number;
  label?: string;
  status?: "available" | "booked" | "selected";
  [key: string]: any;
}

export interface BookingItem {
  id: string;
  restaurant?: string | { id?: string; name?: string };
  user?: string | { id?: string; name?: string; email?: string };
  time?: string | Date;
  interval?: number;
  remarks?: string;
  [key: string]: any;
}

export interface BookingSeatItem {
  id: string;
  booking?: string | { id: string };
  seat?: string | { id?: string; label?: string };
  [key: string]: any;
}

export interface ReviewItem {
  id: string;
  restaurant?: string | { id: string };
  user?: { id?: string; name?: string; image?: string };
  review?: string;
  stars?: number;
  [key: string]: any;
}

export interface DatabaseStore {
  restaurants: RestaurantItem[];
  seats: SeatItem[];
  bookings: BookingItem[];
  bookingSeats: BookingSeatItem[];
  reviews: ReviewItem[];
}

const DATA_FILE = path.join(process.cwd(), "local-db.json");

const initialData: DatabaseStore = {
  restaurants: [
    {
      id: "rest-1",
      name: "Bhojan Griha",
      location: "Dillibazar, Kathmandu",
      seatCount: 16,
      image: {
        url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      },
      "xata.createdAt": new Date("2024-01-01").toISOString(),
    },
    {
      id: "rest-2",
      name: "Thakali Bhanchha Ghar",
      location: "Jhamsikhel, Lalitpur",
      seatCount: 16,
      image: {
        url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      },
      "xata.createdAt": new Date("2024-01-02").toISOString(),
    },
    {
      id: "rest-3",
      name: "Lakeside Heritage Cafe",
      location: "Lakeside, Pokhara",
      seatCount: 16,
      image: {
        url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
      },
      "xata.createdAt": new Date("2024-01-03").toISOString(),
    },
    {
      id: "rest-4",
      name: "Newari Samay Baji Corner",
      location: "Durbar Square, Bhaktapur",
      seatCount: 16,
      image: {
        url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      },
      "xata.createdAt": new Date("2024-01-04").toISOString(),
    },
  ],
  seats: [],
  bookings: [
    {
      id: "booking-1",
      restaurant: { id: "rest-1", name: "Bhojan Griha" },
      user: { id: "user-1", name: "Aarav Sharma", email: "aarav@example.com" },
      time: new Date(Date.now() + 86400000).toISOString(),
      interval: 60,
      remarks: "Window seat preferred for traditional dinner.",
    },
  ],
  bookingSeats: [
    {
      id: "bs-1",
      booking: "booking-1",
      seat: { label: "Table 1 (00)" },
    },
  ],
  reviews: [
    {
      id: "rev-1",
      restaurant: "rest-1",
      user: {
        name: "Shreya Shrestha",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      },
      stars: 5,
      review: "The authentic Nepali flavors and traditional cultural performance made it an unforgettable dinner experience!",
    },
    {
      id: "rev-2",
      restaurant: "rest-1",
      user: {
        name: "Rohan KC",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      },
      stars: 4,
      review: "Excellent food, generous portions, and very warm hospitable staff.",
    },
  ],
};

function readDb(): DatabaseStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content) as DatabaseStore;
    }
  } catch (err) {
    console.error("Error reading local db file, falling back to defaults", err);
  }
  // Initialize file
  saveDb(initialData);
  return initialData;
}

function saveDb(data: DatabaseStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving local db file", err);
  }
}

export const localDb = {
  getStore: readDb,
  saveStore: saveDb,
};
