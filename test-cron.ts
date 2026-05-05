import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log("🚀 Starting Automated Test for Vaccination Reminders API...");

  // 1. Create a valid temporary user to act as the pet owner so email delivers
  const user = await prisma.user.create({
    data: {
      clerkId: "test_clerk_id_" + Date.now(),
      email: "mahdinoorhasan@gmail.com",
      name: "Mahdi Noor Hasan",
      role: "PET_OWNER"
    }
  });

  console.log(`👤 Created temporary user ${user.email} (ID: ${user.id})`);

  let tempPetId = null;
  let tempUserId = user.id;

  try {
    // 2. Create a temporary Pet
    const pet = await prisma.pet.create({
      data: {
        ownerId: user.id,
        name: "Test automated Pet",
        species: "Dog",
        gender: "MALE",
      }
    });
    tempPetId = pet.id;
    console.log(`🐶 Created temporary Pet: ${pet.name} (ID: ${pet.id})`);

    // 3. Create a recurring Vaccination record due TOMORROW
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const record = await prisma.healthRecord.create({
      data: {
        petId: pet.id,
        type: "VACCINATION",
        title: "Rabies Test Vaccine",
        description: "Automated test description",
        date: new Date(),
        nextDueDate: tomorrow
      }
    });
    console.log(`💉 Created temporary HealthRecord due on: ${tomorrow.toLocaleDateString()}`);

    // 4. Trigger the Cron API
    console.log("🌐 Triggering Cron API endpoint...");
    const response = await fetch("http://localhost:1206/api/cron/vaccination-reminders");
    const json = await response.json();

    console.log("\n📦 API Response:");
    console.log(json);

    if (response.ok && json.success) {
      console.log(`\n✅ Automated Test Passed! Found ${json.found} records, successfully sent ${json.sent} emails.`);
      if (json.sent === 0) {
         console.warn("⚠️ Warning: 0 emails sent. Please ensure EMAIL_USER and EMAIL_PASS are correctly configured in .env.local!");
      }
    } else {
      console.error("\n❌ Automated Test Failed! API returned an error.");
    }

  } catch (err) {
    console.error("❌ Error during test:", err);
  } finally {
    // 5. Cleanup
    if (tempPetId) {
      console.log("🧹 Cleaning up temporary test data...");
      await prisma.pet.delete({
        where: { id: tempPetId }
      });
      console.log("✨ Cleanup complete.");
    }
    if (tempUserId) {
      await prisma.user.delete({
        where: { id: tempUserId }
      });
    }
    await prisma.$disconnect();
  }
}

runTest();
