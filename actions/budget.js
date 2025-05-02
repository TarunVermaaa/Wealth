"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    console.log('Querying transactions with:', {
      userId: user.id,
      accountId,
      startOfMonth,
      endOfMonth
    });

    // First, let's check if we have any transactions at all
    const allTransactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
      },
      select: {
        id: true,
        amount: true,
        accountId: true,
        date: true,
      }
    });
    
    console.log('All transactions found:', allTransactions);

    // Now query with the filters
    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        // Make sure accountId is properly converted to match the database type
        // If your accountId in the database is a string, we need to ensure it's compared as string
        accountId: accountId ? String(accountId) : undefined,
      },
      _sum: {
        amount: true,
      },
    });
    
    console.log('Expenses result:', expenses);

    // Get the actual expenses - make sure we handle null values properly
    const expenseAmount = expenses._sum.amount ? expenses._sum.amount.toNumber() : 0;
    
    // Check if we're getting the right accountId
    console.log('Final query results:', {
      accountId,
      expenseAmount,
      budgetAmount: budget?.amount?.toNumber()
    });
    
    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses: expenseAmount,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount: amount,
      },
      create: {
        userId: user.id,
        amount: amount,
      },
    });

    revalidatePath("/dashboard");

    return { ...budget, amount: budget.amount.toNumber() || 0, success: true };
  } catch (error) {
    console.log("Error updating budget:", error);
    return null;
  }
}
