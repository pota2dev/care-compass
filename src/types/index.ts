import type {
  User,
  Pet,
  Booking,
  Event,
  AdoptionPost,
  RescueReport,
  Product,
  Order,
  Notification,
  ServiceProvider,
  BookingStatus,
  BookingType,
  UserRole,
  ProviderType,
  ProductCategory,
  EventCategory,
  AdoptionType,
  AdoptionStatus,
  RescueStatus,
  RescueUrgency,
  PetGender,
} from "@prisma/client";

export type {
  User, Pet, Booking, Event, AdoptionPost, RescueReport,
  Product, Order, Notification, ServiceProvider,
  BookingStatus, BookingType, UserRole, ProviderType,
  ProductCategory, EventCategory, AdoptionType, AdoptionStatus,
  RescueStatus, RescueUrgency, PetGender,
};

// Extended types with relations
export type PetWithOwner = Pet & { owner: User };

export type BookingWithRelations = Booking & {
  pet: Pet;
  provider: ServiceProvider;
  user: User;
};

export type EventWithCreator = Event & {
  creator: User;
  rsvps: { userId: string }[];
  _count: { rsvps: number };
};

export type AdoptionPostWithPet = AdoptionPost & {
  pet: Pet;
  owner: User;
  _count: { requests: number };
};

export type OrderWithItems = Order & {
  items: (import("@prisma/client").OrderItem & { product: Product })[];
};

export type NotificationWithUser = Notification & { user: User };

// Form input types
export interface CreatePetInput {
  name: string;
  species: string;
  breed?: string;
  gender: PetGender;
  dateOfBirth?: string;
  weight?: number;
  color?: string;
  microchipId?: string;
  photoUrl?: string;
  notes?: string;
}

export interface CreateBookingInput {
  petId: string;
  providerId: string;
  timeslotId: string;
  type: BookingType;
  notes?: string;
  isHomeService?: boolean;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  category: EventCategory;
  location: string;
  city: string;
  startDate: string;
  endDate?: string;
  maxAttendees?: number;
  isFree?: boolean;
  fee?: number;
}

export interface CreateAdoptionPostInput {
  petId: string;
  type: AdoptionType;
  reason: string;
  description?: string;
}

export interface CreateRescueReportInput {
  animalType: string;
  condition: string;
  location: string;
  city: string;
  description?: string;
  urgency: RescueUrgency;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
