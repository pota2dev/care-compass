import { getMonthlyExpenses, getUserPets } from "@/actions/expenses";
import ExpensesDashboard from "./expenses-dashboard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ExpensesPage() {
  const expenses = await getMonthlyExpenses();
  const pets = await getUserPets();

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 inline-flex items-center gap-2 mb-6 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Pet Expense Tracker & Analytics</h1>
        <p className="text-gray-500 mt-2">Log and analyze your pet-related spending over time.</p>
      </div>

      <ExpensesDashboard expenses={expenses} pets={pets} />
    </div>
  );
}
