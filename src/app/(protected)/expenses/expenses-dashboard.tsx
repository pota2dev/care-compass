"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, parseISO } from "date-fns";
import { PetExpense, Pet, ExpenseCategory } from "@prisma/client";
import { PlusCircle, DollarSign, PieChart as PieChartIcon, Activity } from "lucide-react";
import { useState } from "react";
import { addPetExpense, deletePetExpense } from "@/actions/expenses";

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

type ExpensesDashboardProps = {
  expenses: (PetExpense & { pet: { name: string } })[];
  pets: Pet[];
};

export default function ExpensesDashboard({ expenses, pets }: ExpensesDashboardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group by Category for Pie Chart
  const categoryDataMap = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryDataMap).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);

  // Group by Month for Bar Chart
  const monthlyDataMap = expenses.reduce((acc, exp) => {
    const month = format(new Date(exp.date), "MMM yyyy");
    acc[month] = (acc[month] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(monthlyDataMap).map(([name, Total]) => ({
    name,
    Total,
  })); // already sorted by date due to actions sorting (asc)

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addPetExpense({
        amount: parseFloat(formData.get("amount") as string),
        category: formData.get("category") as ExpenseCategory,
        date: new Date(formData.get("date") as string),
        description: formData.get("description") as string,
        petId: formData.get("petId") as string,
      });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      await deletePetExpense(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-forest-50 flex items-center justify-center text-forest-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Spent (Year)</p>
            <h3 className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Number of Expenses</p>
            <h3 className="text-2xl font-bold text-gray-900">{expenses.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-forest-200 transition-colors" onClick={() => setIsAdding(!isAdding)}>
          <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Action</p>
            <h3 className="text-xl font-bold text-forest-600">Log New Expense</h3>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-forest-100 mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Log New Expense</h3>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Pet *</label>
              <select name="petId" required className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:ring-forest-500">
                <option value="">Select Pet...</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Amount ($) *</label>
              <input type="number" step="0.01" name="amount" required placeholder="0.00" className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:ring-forest-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Category *</label>
              <select name="category" required className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:ring-forest-500">
                {Object.values(ExpenseCategory).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Date *</label>
              <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:ring-forest-500 bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Description</label>
              <input type="text" name="description" placeholder="Optional" className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:ring-forest-500" />
            </div>
            <div className="lg:col-span-1">
              <button disabled={isSubmitting} type="submit" className="w-full h-10 bg-forest-600 hover:bg-forest-700 text-white font-medium rounded-md text-sm transition-colors disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Charts */}
      {expenses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-gray-500" />
              Spending by Category
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-500" />
              Monthly Spending
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Total']} />
                  <Bar dataKey="Total" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-500 flex flex-col items-center justify-center">
          <DollarSign className="w-12 h-12 mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Expenses Logged Yet</h3>
          <p>Add your first pet expense above to start tracking your spending.</p>
        </div>
      )}

      {/* Recent Expenses List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Pet</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions to display.</td>
                </tr>
              ) : (
                [...expenses].reverse().map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{format(new Date(exp.date), "MMM d, yyyy")}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{exp.pet.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {exp.category.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{exp.description || "-"}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">${exp.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(exp.id)} className="text-red-500 hover:text-red-700 text-xs font-medium hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
