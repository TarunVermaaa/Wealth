"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget (Default Account)</CardTitle>

        <CardDescription>Track your budget progress</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}

export default BudgetProgress;
