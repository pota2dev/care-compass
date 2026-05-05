import {
  PrismaClient,
  UserRole,
  ProviderType,
  ProductCategory,
  EventCategory,
  PetGender,
} from "@prisma/client";

const prisma = new PrismaClient();

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function makeSlots(baseDate: Date, count: number) {
  const slots = [];
  for (let i = 0; i < count; i++) {
    const start = new Date(baseDate);
    start.setDate(start.getDate() + i);
    start.setHours(9 + (i % 4) * 2, 0, 0, 0); // 9am, 11am, 1pm, 3pm
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    slots.push({
      startTime: start,
      endTime: end,
      isAvailable: true,
      maxCapacity: 3,
    });
  }
  return slots;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Vet Clinic Provider ──────────────────────────────────────
  const vetUser = await prisma.user.upsert({
    where: { email: "dhanmondi-vet@carecompass.com" },
    update: {},
    create: {
      clerkId: "seed_vet_1",
      email: "dhanmondi-vet@carecompass.com",
      name: "Dr. Karim Ahmed",
      role: UserRole.SERVICE_PROVIDER,
      city: "Dhaka",
    },
  });

  const vetProvider = await prisma.serviceProvider.upsert({
    where: { userId: vetUser.id },
    update: {},
    create: {
      userId: vetUser.id,
      name: "Dhanmondi Vet Clinic",
      type: ProviderType.VET_CLINIC,
      description:
        "Full-service veterinary clinic with 15+ years of experience. Vaccinations, surgeries, dental care.",
      address: "House 12, Road 5, Dhanmondi",
      city: "Dhaka",
      phone: "01700-123456",
      email: "dhanmondi-vet@carecompass.com",
      isVerified: true,
      rating: 4.8,
      reviewCount: 120,
    },
  });

  // Timeslots for vet
  await prisma.timeslot.deleteMany({ where: { providerId: vetProvider.id } });
  await prisma.timeslot.createMany({
    data: makeSlots(new Date(), 8).map((s) => ({
      ...s,
      providerId: vetProvider.id,
    })),
  });

  // Second vet
  const vet2User = await prisma.user.upsert({
    where: { email: "gulshan-vet@carecompass.com" },
    update: {},
    create: {
      clerkId: "seed_vet_2",
      email: "gulshan-vet@carecompass.com",
      name: "Dr. Nasrin Begum",
      role: UserRole.SERVICE_PROVIDER,
      city: "Dhaka",
    },
  });

  const vet2Provider = await prisma.serviceProvider.upsert({
    where: { userId: vet2User.id },
    update: {},
    create: {
      userId: vet2User.id,
      name: "Gulshan Animal Hospital",
      type: ProviderType.VET_CLINIC,
      description:
        "Modern animal hospital with X-ray, ultrasound, and 24/7 emergency care.",
      address: "Road 11, Gulshan 2",
      city: "Dhaka",
      phone: "01800-654321",
      email: "gulshan-vet@carecompass.com",
      isVerified: true,
      rating: 4.6,
      reviewCount: 85,
    },
  });

  await prisma.timeslot.deleteMany({ where: { providerId: vet2Provider.id } });
  await prisma.timeslot.createMany({
    data: makeSlots(addDays(new Date(), 1), 6).map((s) => ({
      ...s,
      providerId: vet2Provider.id,
    })),
  });

  // ── Grooming Provider ────────────────────────────────────────
  const groomUser = await prisma.user.upsert({
    where: { email: "pawsgrooming@carecompass.com" },
    update: {},
    create: {
      clerkId: "seed_groom_1",
      email: "pawsgrooming@carecompass.com",
      name: "Paws & Claws Grooming",
      role: UserRole.SERVICE_PROVIDER,
      city: "Dhaka",
    },
  });

  const groomProvider = await prisma.serviceProvider.upsert({
    where: { userId: groomUser.id },
    update: {},
    create: {
      userId: groomUser.id,
      name: "Paws & Claws Grooming Studio",
      type: ProviderType.GROOMING,
      description:
        "Professional grooming for all breeds. Bath, haircut, nail trim, ear cleaning. Home service available.",
      address: "Shop 3, Mirpur 10",
      city: "Dhaka",
      phone: "01900-111222",
      email: "pawsgrooming@carecompass.com",
      isVerified: true,
      rating: 4.7,
      reviewCount: 63,
    },
  });

  await prisma.timeslot.deleteMany({ where: { providerId: groomProvider.id } });
  await prisma.timeslot.createMany({
    data: makeSlots(new Date(), 10).map((s) => ({
      ...s,
      providerId: groomProvider.id,
    })),
  });

  // ── Daycare Provider ─────────────────────────────────────────
  const dayUser = await prisma.user.upsert({
    where: { email: "happypaws-daycare@carecompass.com" },
    update: {},
    create: {
      clerkId: "seed_day_1",
      email: "happypaws-daycare@carecompass.com",
      name: "Happy Paws Daycare",
      role: UserRole.SERVICE_PROVIDER,
      city: "Dhaka",
    },
  });

  const dayProvider = await prisma.serviceProvider.upsert({
    where: { userId: dayUser.id },
    update: {},
    create: {
      userId: dayUser.id,
      name: "Happy Paws Daycare Center",
      type: ProviderType.DAYCARE,
      description:
        "Safe, fun daycare for dogs and cats. Trained staff, play areas, CCTV monitoring, daily updates.",
      address: "House 7, Banani",
      city: "Dhaka",
      phone: "01700-999888",
      email: "happypaws-daycare@carecompass.com",
      isVerified: true,
      rating: 4.9,
      reviewCount: 47,
    },
  });

  await prisma.timeslot.deleteMany({ where: { providerId: dayProvider.id } });
  await prisma.timeslot.createMany({
    data: makeSlots(new Date(), 7).map((s) => ({
      ...s,
      providerId: dayProvider.id,
      maxCapacity: 5,
    })),
  });

  // ── Rescue Organization ──────────────────────────────────────
  const rescueUser = await prisma.user.upsert({
    where: { email: "rescue@carecompass.com" },
    update: {},
    create: {
      clerkId: "seed_rescue_1",
      email: "rescue@carecompass.com",
      name: "Dhaka Humane Society",
      role: UserRole.SERVICE_PROVIDER,
      city: "Dhaka",
    },
  });

  await prisma.serviceProvider.upsert({
    where: { userId: rescueUser.id },
    update: {},
    create: {
      userId: rescueUser.id,
      name: "Dhaka Humane Society",
      type: ProviderType.RESCUE,
      description:
        "24/7 animal rescue and rehabilitation. Response time ~30 minutes.",
      address: "Dhanmondi 15",
      city: "Dhaka",
      phone: "01700-RESCUE",
      email: "rescue@carecompass.com",
      isVerified: true,
      rating: 4.9,
      reviewCount: 210,
    },
  });

  // ── Products ─────────────────────────────────────────────────
  const products = [
    {
      name: "Royal Canin Adult Dog Food",
      category: ProductCategory.FOOD,
      price: 1850,
      stock: 50,
      description: "Premium nutrition for adult dogs. 3kg bag.",
    },
    {
      name: "Whiskas Cat Food",
      category: ProductCategory.FOOD,
      price: 450,
      stock: 100,
      description: "Complete nutrition for adult cats. 1.2kg.",
    },
    {
      name: "Interactive Fetch Ball Set",
      category: ProductCategory.TOYS,
      price: 450,
      stock: 30,
      description: "Pack of 3 durable fetch balls.",
    },
    {
      name: "Cat Scratching Post",
      category: ProductCategory.ACCESSORIES,
      price: 750,
      stock: 20,
      description: "60cm sisal scratching post.",
    },
    {
      name: "Professional Grooming Kit",
      category: ProductCategory.GROOMING_SUPPLIES,
      price: 980,
      stock: 15,
      description: "8-piece grooming set.",
    },
    {
      name: "Flea & Tick Treatment",
      category: ProductCategory.MEDICINE,
      price: 620,
      stock: 40,
      description: "Monthly topical treatment.",
    },
    {
      name: "Cozy Pet Bed",
      category: ProductCategory.ACCESSORIES,
      price: 1200,
      stock: 25,
      description: "Orthopedic medium-size pet bed.",
    },
    {
      name: "Dog Collar & Leash Set",
      category: ProductCategory.ACCESSORIES,
      price: 380,
      stock: 35,
      description: "Adjustable nylon collar + 1.5m leash.",
    },
  ];

  for (const p of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: p.name },
    });
    if (!existingProduct) {
      await prisma.product.create({
        data: { ...p, providerId: vetProvider.id },
      });
    }
  }

  // ── Events ───────────────────────────────────────────────────
  const eventUser = await prisma.user.upsert({
    where: { email: "community@carecompass.com" },
    update: {},
    create: {
      clerkId: "seed_community_1",
      email: "community@carecompass.com",
      name: "CareCompass Community",
      role: UserRole.PET_OWNER,
      city: "Dhaka",
    },
  });

  const events = [
    {
      title: "Pug Meetup at Ramna Park",
      category: EventCategory.MEETUP,
      location: "Ramna Park",
      city: "Dhaka",
      startDate: addDays(new Date(), 2),
      description:
        "Join fellow pug owners for a morning walk and play session.",
    },
    {
      title: "Cat Lovers Café Afternoon",
      category: EventCategory.MEETUP,
      location: "Café Purrfect, Gulshan 1",
      city: "Dhaka",
      startDate: addDays(new Date(), 5),
      description: "A cozy afternoon meetup for cat lovers.",
    },
    {
      title: "Free Vaccination Camp — Mirpur",
      category: EventCategory.VACCINATION_CAMP,
      location: "Mirpur 10 Community Hall",
      city: "Dhaka",
      startDate: addDays(new Date(), 12),
      description:
        "Free rabies and parvovirus vaccination. First 200 pets free.",
      maxAttendees: 200,
    },
    {
      title: "Dog Training Workshop",
      category: EventCategory.TRAINING_WORKSHOP,
      location: "Uttara Sector 7 Park",
      city: "Dhaka",
      startDate: addDays(new Date(), 18),
      description: "Beginner-friendly dog obedience workshop.",
      isFree: false,
      fee: 500,
    },
  ];

  for (const e of events) {
    const existing = await prisma.event.findFirst({
      where: { title: e.title },
    });
    if (!existing) {
      await prisma.event.create({ data: { ...e, creatorId: eventUser.id } });
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log("   • 2 vet clinics with timeslots");
  console.log("   • 1 grooming studio with timeslots");
  console.log("   • 1 daycare center with timeslots");
  console.log("   • 1 rescue organization");
  console.log("   • 8 shop products");
  console.log("   • 4 community events");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
