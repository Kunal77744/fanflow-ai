// Core domain types for the FanFlow AI stadium assistant.
// Keeping these centralized avoids duplicated shape definitions
// across components, services, and API routes.

export type CrowdLevel = "low" | "medium" | "high";

export interface Section {
  id: string;
  gate: string;
  rows: string;
}

export interface Gate {
  id: string;
  sections: string[];
  crowdLevel: CrowdLevel;
  nearestAmenities: string[];
  walkFromMainEntranceMin: number;
}

export interface Amenity {
  id: string;
  type: "washroom" | "food" | "medical" | "info_desk" | "refill_station";
  nearGate: string;
  wheelchairAccessible: boolean;
  label: string;
}

export interface TransportOption {
  id: string;
  type: "metro" | "bus" | "parking" | "shuttle";
  name: string;
  distanceKm: number;
  nearGate: string;
  co2FriendlyNote?: string;
}

export interface SustainabilityTip {
  id: string;
  nearGate: string;
  message: string;
}

export interface TournamentMatch {
  id: string;
  date: string;
  time: string;
  teams: string;
  stage: string;
  status: string;
}

export interface StadiumData {
  stadiumName: string;
  gates: Gate[];
  sections: Section[];
  amenities: Amenity[];
  transport: TransportOption[];
  sustainabilityTips: SustainabilityTip[];
  tournamentMatches: TournamentMatch[];
}

export interface ChatRequestBody {
  message: string;
  seatSection?: string;
  accessibilityMode?: boolean;
  history?: ChatMessage[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatApiResponse {
  reply: string;
  suggestedGate?: string;
  crowdAdvisory?: {
    gate: string;
    level: CrowdLevel;
  };
}

export interface ApiErrorResponse {
  error: string;
}
