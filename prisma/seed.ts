import {
  PrismaClient,
  UserRole,
  ProviderType,
  ProductCategory,
  EventCategory,
} from "@prisma/client";

const prisma = new PrismaClient();

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Generate timeslots starting from tomorrow so they're always in the future
function makeSlots(providerId: string, daysAhead: number, slotsPerDay: number) {
  const slots = [];
  const hours = [9, 11, 13, 15, 17]; // 9am, 11am, 1pm, 3pm, 5pm
  for (let day = 1; day <= daysAhead; day++) {
    for (let h = 0; h < slotsPerDay && h < hours.length; h++) {
      const start = new Date();
      start.setDate(start.getDate() + day);
      start.setHours(hours[h], 0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 1, 30); // 1.5 hour slots
      slots.push({
        providerId,
        startTime: start,
        endTime: end,
        isAvailable: true,
        maxCapacity: 3,
        bookedCount: 0,
      });
    }
  }
  return slots;
}

async function upsertProvider(
  email: string,
  clerkId: string,
  name: string,
  type: ProviderType,
  extra: object,
) {
  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: {
      clerkId,
      email,
      name,
      role: UserRole.SERVICE_PROVIDER,
      city: "Dhaka",
    },
  });
  const provider = await prisma.serviceProvider.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      name,
      type,
      email,
      isVerified: true,
      address: "Default Address",
      city: "Dhaka",
      phone: "0123456789",
      ...extra
    },
  });
  // Always delete old timeslots and recreate fresh ones so they're in the future
  await prisma.timeslot.deleteMany({ where: { providerId: provider.id } });
  return provider;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── VET CLINICS ──────────────────────────────────────────────
  const vet1 = await upsertProvider(
    "dhanmondi-vet@carecompass.com",
    "seed_vet_1",
    "Dhanmondi Vet Clinic",
    ProviderType.VET_CLINIC,
    {
      description:
        "Full-service veterinary clinic. Vaccinations, surgeries, dental care, X-ray.",
      address: "House 12, Road 5, Dhanmondi",
      city: "Dhaka",
      phone: "01700-123456",
      rating: 4.8,
      reviewCount: 120,
    },
  );
  await prisma.timeslot.createMany({ data: makeSlots(vet1.id, 14, 4) });

  const vet2 = await upsertProvider(
    "gulshan-vet@carecompass.com",
    "seed_vet_2",
    "Gulshan Animal Hospital",
    ProviderType.VET_CLINIC,
    {
      description:
        "Modern animal hospital with ultrasound, ECG, and 24/7 emergency care.",
      address: "Road 11, Gulshan 2",
      city: "Dhaka",
      phone: "01800-654321",
      rating: 4.6,
      reviewCount: 85,
    },
  );
  await prisma.timeslot.createMany({ data: makeSlots(vet2.id, 14, 3) });

  const vet3 = await upsertProvider(
    "uttara-vet@carecompass.com",
    "seed_vet_3",
    "Uttara Pet Care Hospital",
    ProviderType.VET_CLINIC,
    {
      description:
        "Specialist in small animals, exotic pets, and birds. Friendly and affordable.",
      address: "Sector 7, Uttara",
      city: "Dhaka",
      phone: "01900-222333",
      rating: 4.5,
      reviewCount: 52,
    },
  );
  await prisma.timeslot.createMany({ data: makeSlots(vet3.id, 10, 4) });

  const vet4 = await upsertProvider(
    "mirpur-vet@carecompass.com",
    "seed_vet_4",
    "Mirpur Animal Clinic",
    ProviderType.VET_CLINIC,
    {
      description:
        "Affordable vet services for all pets. Walk-ins welcome. Free annual checkup.",
      address: "Mirpur 10, Section B",
      city: "Dhaka",
      phone: "01600-445566",
      rating: 4.3,
      reviewCount: 38,
    },
  );
  await prisma.timeslot.createMany({ data: makeSlots(vet4.id, 10, 5) });

  // ── GROOMING ─────────────────────────────────────────────────
  const groom1 = await upsertProvider(
    "pawsgrooming@carecompass.com",
    "seed_groom_1",
    "Paws & Claws Grooming Studio",
    ProviderType.GROOMING,
    {
      description:
        "Professional grooming for all breeds. Bath, haircut, nail trim, ear cleaning. Home service available!",
      address: "Shop 3, Mirpur 10",
      city: "Dhaka",
      phone: "01900-111222",
      rating: 4.7,
      reviewCount: 63,
    },
  );
  await prisma.timeslot.createMany({ data: makeSlots(groom1.id, 14, 4) });

  const groom2 = await upsertProvider(
    "furbaby-grooming@carecompass.com",
    "seed_groom_2",
    "FurBaby Grooming Salon",
    ProviderType.GROOMING,
    {
      description:
        "Premium grooming with organic shampoos. Specializes in Poodles, Shih Tzus, and Persian cats. Home visits available.",
      address: "Banani 11, Road 3",
      city: "Dhaka",
      phone: "01700-778899",
      rating: 4.9,
      reviewCount: 91,
    },
  );
  await prisma.timeslot.createMany({ data: makeSlots(groom2.id, 14, 3) });

  const groom3 = await upsertProvider(
    "sparkle-groom@carecompass.com",
    "seed_groom_3",
    "Sparkle Pet Spa",
    ProviderType.GROOMING,
    {
      description:
        "Full-service pet spa. Aromatherapy baths, teeth brushing, de-shedding treatment. Walk-ins welcome.",
      address: "Dhanmondi 27, Road 2",
      city: "Dhaka",
      phone: "01800-334455",
      rating: 4.4,
      reviewCount: 44,
    },
  );
  await prisma.timeslot.createMany({ data: makeSlots(groom3.id, 10, 4) });

  // ── DAYCARE ──────────────────────────────────────────────────
  const day1 = await upsertProvider(
    "happypaws-daycare@carecompass.com",
    "seed_day_1",
    "Happy Paws Daycare Center",
    ProviderType.DAYCARE,
    {
      description:
        "Safe, fun daycare for dogs and cats. Trained staff, outdoor play areas, CCTV monitoring, daily photo updates.",
      address: "House 7, Banani",
      city: "Dhaka",
      phone: "01700-999888",
      rating: 4.9,
      reviewCount: 47,
    },
  );
  await prisma.timeslot.createMany({ data: makeSlots(day1.id, 14, 2) });

  const day2 = await upsertProvider(
    "petparadise-daycare@carecompass.com",
    "seed_day_2",
    "Pet Paradise Daycare",
    ProviderType.DAYCARE,
    {
      description:
        "Large indoor and outdoor play spaces. Separate areas for small/large dogs. Swimming pool for dogs in summer.",
      address: "Gulshan 1, Road 17",
      city: "Dhaka",
      phone: "01600-112233",
      rating: 4.7,
      reviewCount: 33,
    },
  );
  await prisma.timeslot.createMany({ data: makeSlots(day2.id, 14, 2) });

  const day3 = await upsertProvider(
    "petclub-daycare@carecompass.com",
    "seed_day_3",
    "The Pet Club Daycare",
    ProviderType.DAYCARE,
    {
      description:
        "Affordable half-day and full-day options. Trained caregivers, feeding included, daily report card.",
      address: "Uttara Sector 4",
      city: "Dhaka",
      phone: "01900-556677",
      rating: 4.5,
      reviewCount: 28,
    },
  );
  await prisma.timeslot.createMany({ data: makeSlots(day3.id, 10, 3) });

  // ── RESCUE ORGS ──────────────────────────────────────────────
  const rescue1 = await upsertProvider(
    "rescue@carecompass.com",
    "seed_rescue_1",
    "Dhaka Humane Society",
    ProviderType.RESCUE,
    {
      description:
        "24/7 animal rescue and rehabilitation. Response time ~30 minutes across Dhaka.",
      address: "Dhanmondi 15",
      city: "Dhaka",
      phone: "01700-RESCUE",
      rating: 4.9,
      reviewCount: 210,
    },
  );

  const rescue2 = await upsertProvider(
    "pawsrescue@carecompass.com",
    "seed_rescue_2",
    "Paws & Claws Rescue BD",
    ProviderType.RESCUE,
    {
      description:
        "Volunteer-run rescue network. Stray animal care, fostering, and adoption support.",
      address: "Gulshan 2",
      city: "Dhaka",
      phone: "01800-RESCUE",
      rating: 4.8,
      reviewCount: 143,
    },
  );

  // ── PRODUCTS ─────────────────────────────────────────────────
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
      name: "Pedigree Puppy Food",
      category: ProductCategory.FOOD,
      price: 950,
      stock: 60,
      description: "DHA-enriched food for growing puppies. 1.5kg.",
    },
    {
      name: "Interactive Fetch Ball Set",
      category: ProductCategory.TOYS,
      price: 450,
      stock: 30,
      description: "Pack of 3 durable rubber fetch balls.",
    },
    {
      name: "Cat Scratching Post",
      category: ProductCategory.ACCESSORIES,
      price: 750,
      stock: 20,
      description: "60cm sisal scratching post with base.",
    },
    {
      name: "Professional Grooming Kit",
      category: ProductCategory.GROOMING_SUPPLIES,
      price: 980,
      stock: 15,
      description: "8-piece grooming set: brush, comb, nail clipper, scissors.",
    },
    {
      name: "Flea & Tick Treatment",
      category: ProductCategory.MEDICINE,
      price: 620,
      stock: 40,
      description: "Monthly topical flea and tick prevention.",
    },
    {
      name: "Cozy Pet Bed (Medium)",
      category: ProductCategory.ACCESSORIES,
      price: 1200,
      stock: 25,
      description: "Orthopedic memory foam bed, washable cover.",
    },
    {
      name: "Dog Collar & Leash Set",
      category: ProductCategory.ACCESSORIES,
      price: 380,
      stock: 35,
      description: "Adjustable nylon collar + 1.5m leash. Multiple sizes.",
    },
    {
      name: "Automatic Water Fountain",
      category: ProductCategory.ACCESSORIES,
      price: 1650,
      stock: 18,
      description: "2L circulating water fountain, keeps water fresh.",
    },
    {
      name: "Catnip Toy Bundle",
      category: ProductCategory.TOYS,
      price: 320,
      stock: 45,
      description: "Set of 5 catnip-filled toys for active cats.",
    },
    {
      name: "Vitamin & Supplement Drops",
      category: ProductCategory.MEDICINE,
      price: 480,
      stock: 55,
      description: "Daily multivitamin for dogs and cats. 30ml bottle.",
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({
      where: { name: p.name },
    });
    if (!existing) {
      await prisma.product.create({ data: { ...p, providerId: vet1.id } });
    }
  }

  // ── EVENTS ───────────────────────────────────────────────────
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

  const eventsData = [
    {
      title: "Pug Meetup at Ramna Park",
      category: EventCategory.MEETUP,
      location: "Ramna Park",
      city: "Dhaka",
      startDate: addDays(new Date(), 2),
      description:
        "Join fellow pug owners for a morning walk and play session. Bring treats!",
    },
    {
      title: "Cat Lovers Café Afternoon",
      category: EventCategory.MEETUP,
      location: "Café Purrfect, Gulshan 1",
      city: "Dhaka",
      startDate: addDays(new Date(), 5),
      description:
        "A cozy afternoon meetup for cat lovers. Share stories, photos, and tips.",
    },
    {
      title: "Free Vaccination Camp — Mirpur",
      category: EventCategory.VACCINATION_CAMP,
      location: "Mirpur 10 Community Hall",
      city: "Dhaka",
      startDate: addDays(new Date(), 12),
      description:
        "Free rabies and parvovirus vaccination for dogs and cats. First 200 pets free.",
      maxAttendees: 200,
    },
    {
      title: "Dog Training Workshop",
      category: EventCategory.TRAINING_WORKSHOP,
      location: "Uttara Sector 7 Park",
      city: "Dhaka",
      startDate: addDays(new Date(), 18),
      description:
        "Beginner-friendly dog obedience: sit, stay, recall. Certified trainer.",
      isFree: false,
      fee: 500,
    },
    {
      title: "Annual Pet Show 2026",
      category: EventCategory.PET_SHOW,
      location: "Bashundhara City Convention Hall",
      city: "Dhaka",
      startDate: addDays(new Date(), 30),
      description:
        "Bangladesh's biggest pet show! Competitions, prizes, vendor stalls.",
      isFree: false,
      fee: 200,
      maxAttendees: 500,
    },
  ];

  for (const e of eventsData) {
    const existing = await prisma.event.findFirst({
      where: { title: e.title },
    });
    if (!existing)
      await prisma.event.create({ data: { ...e, creatorId: eventUser.id } });
  }

  console.log("✅ Seeded successfully!");
  console.log("   • 4 vet clinics with timeslots");
  console.log("   • 3 grooming studios with timeslots");
  console.log("   • 3 daycare centers with timeslots");
  console.log("   • 2 rescue organizations");
  console.log("   • 12 shop products");
  console.log("   • 5 community events");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
