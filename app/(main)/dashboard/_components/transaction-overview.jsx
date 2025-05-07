"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const colors = [
  "#059669", "#FFC107", "#FF5722", "#3F51B5", "#9C27B0",
  "#E91E63", "#673AB7", "#336B8A", "#FF9800", "#795548",
];

function DashboardOverview({ accounts, transactions }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((account) => account.isDefault?.id || accounts[0]?.id)
  );

  const filteredTransactions = transactions.filter(
    (transaction) => transaction.accountId === selectedAccountId
  );

  const recentTransactions = filteredTransactions
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  const currentDate = new Date();

  const currentMonthExpenses = filteredTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {});

  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Transactions */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-5 pt-2">
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No recent transactions
            </p>
          ) : (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="text-sm font-medium">
                    {transaction.description || "Untitled Transaction"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(transaction.date), "PP")}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex items-center text-sm font-semibold",
                    transaction.type === "EXPENSE" ? "text-red-500" : "text-green-600"
                  )}
                >
                  {transaction.type === "EXPENSE" ? (
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                  )}
                  ₹{transaction.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Expense Breakdown Pie Chart */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[320px]">
          {pieChartData.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No expense data available for this month
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardOverview;
