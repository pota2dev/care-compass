import { PrismaClient, ExpenseCategory, PetGender } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = "mahdihasan535@gmail.com"
  const clerkId = "user_3BRuXUq2CYNTX21WZrXTffBUtbI"

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        clerkId,
        name: "Mahdi Hasan",
      }
    })
    console.log(`Created user ${user.id}`)
  } else {
    if (user.clerkId !== clerkId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { clerkId }
      })
    }
  }

  // Get or create pet
  let pet = await prisma.pet.findFirst({
    where: { ownerId: user.id }
  })

  if (!pet) {
    pet = await prisma.pet.create({
      data: {
        ownerId: user.id,
        name: "Buddy",
        species: "Dog",
        breed: "Golden Retriever",
        gender: "MALE" as PetGender,
      }
    })
    console.log(`Created pet ${pet.id}`)
  }

  const currentDate = new Date()

  // Generate some expenses
  const expensesToCreate = [
    {
      userId: user.id,
      petId: pet.id,
      amount: 45.99,
      category: "FOOD" as ExpenseCategory,
      date: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      description: "Premium Dog Food - 10kg",
    },
    {
      userId: user.id,
      petId: pet.id,
      amount: 120.50,
      category: "MEDICAL" as ExpenseCategory,
      date: new Date(currentDate.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      description: "Annual Checkup and Vaccines",
    },
    {
      userId: user.id,
      petId: pet.id,
      amount: 25.00,
      category: "TOYS" as ExpenseCategory,
      date: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      description: "Chew toys and ropes",
    },
    {
      userId: user.id,
      petId: pet.id,
      amount: 65.00,
      category: "GROOMING" as ExpenseCategory,
      date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      description: "Full grooming session",
    },
    {
      userId: user.id,
      petId: pet.id,
      amount: 15.75,
      category: "OTHER" as ExpenseCategory,
      date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      description: "Dog park entry fee",
    },
    {
      userId: user.id,
      petId: pet.id,
      amount: 80.00,
      category: "FOOD" as ExpenseCategory,
      date: new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      description: "Large bag of dry food + treats",
    }
  ]

  // Clear existing if any
  const deleted = await prisma.petExpense.deleteMany({
    where: { userId: user.id, petId: pet.id }
  })
  console.log(`Deleted ${deleted.count} old expenses for this user and pet`)

  const expenses = await prisma.petExpense.createMany({
    data: expensesToCreate
  })

  console.log(`Successfully seeded ${expenses.count} expenses for user ${user.email} and pet ${pet.name}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
