"use client";

import { endOfDay, startOfDay, subDays, format } from "date-fns";
import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last 1 Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  All: { label: "All Time", days: 365 * 50 },
};

const AccountChart = ({ transactions }) => {
  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();

    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(now);

    const filtered = transactions.filter(
      (transaction) =>
        new Date(transaction.date) >= startDate &&
        new Date(transaction.date) <= endOfDay(now)
    );

    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "PP");
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }
      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-7">
        <CardTitle className="text-2xl font-bold">
          Transaction Overview
        </CardTitle>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Income</p>
            <p className="text-lg font-bold text-green-500">
              ₹ {totals.income.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Total Expense</p>
            <p className="text-lg font-bold text-red-500">
              ₹ {totals.expense.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Net Balance</p>
            <p
              className={`text-lg font-bold ${
                totals.income - totals.expense >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              ₹ {(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="h-[300px] flex items-center justify-center">
          {filteredData.length === 0 ? (
            <div className="text-center w-full text-muted-foreground text-lg">
              <span role="img" aria-label="No Data">🕸️</span> No transaction yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹ ${value.toFixed(2)}`}
                />
                <Tooltip formatter={value => [`₹${value.toFixed(2)}` , undefined]} />
                <Legend />
                <Bar dataKey="income" fill="#4CBB17" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#FF5733" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountChart;
