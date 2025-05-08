"use server";

import { db } from "@/lib/prisma";
// Custom request object for our simplified Arcjet implementation
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import aj from "@/lib/arcjet";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { syncUserWithDB } from "@/lib/syncUser";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => {
  return {
    ...obj,
    amount: obj.amount.toNumber(),
  };
};

function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return null;
  }
  return date;
}

export async function createTransaction(transactionData) {
  await syncUserWithDB();
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Arcjet to add rate limiting
    const req = {}; // Simple mock request object

    // check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    // check
    if (decision.isDenied()) {
      if (decision.reason && decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT",
          details: {
            remaining,
            resetInSecond: reset,
          },
        });

        throw new Error("Rate limit exceeded");
      }

      throw new Error("Request denied");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: {
        id: transactionData.accountId,
        userId: user.id,
      },
    });

    if (!account) throw new Error("Account not found");

    const balanceChange =
      transactionData.type === "EXPENSE"
        ? -transactionData.amount
        : transactionData.amount;
    const newbalance = account.balance.toNumber() + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...transactionData,
          userId: user.id,
          nextRecurringDate:
            transactionData.isRecurring && transactionData.recurringInterval
              ? calculateNextRecurringDate(
                  transactionData.date,
                  transactionData.recurringInterval
                )
              : null,
        },
      });

      await tx.account.update({
        where: {
          id: transactionData.accountId,
          userId: user.id,
        },
        data: {
          balance: newbalance,
        },
      });

      return {
        newTransaction,
      };
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transactionData.accountId}`);

    return {
      success: true,
      data: transaction,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // convert ArrayBuffer to base64
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // giving prompt
    const prompt = ` Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    // result
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = await response.text();
    const cleanText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        merchantName: data.merchantName,
        category: data.category,
      };
    } catch (parsedError) {
      console.log("Error parsing JSON response", parsedError);
      throw new Error("Invalid response Format from Gemini");
    }
  } catch (error) {
    console.log(error.message);
    throw new Error("Failed to process receipt");
  }
}

export async function getTransactions(id) {
  await syncUserWithDB();
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const transaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!transaction) throw new Error("Transaction not found");

    // Return with success flag and data format like other actions
    return {
      success: true,
      data: serializeAmount(transaction)
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function updateTransaction(id, data) {
  await syncUserWithDB();
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error("User not found");

  // Get orignal transaction to calculate balance change
  const originalTransaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
    include: {
      account: true,
    },
  });

  if (!originalTransaction) throw new Error("Transaction not found");

  // calculate balance change
  const oldBalanceChange =
    originalTransaction.type === "EXPENSE"
      ? -originalTransaction.amount
      : originalTransaction.amount;

  const newBalanceChange =
    data.type === "EXPENSE" ? -data.amount : data.amount;

  const balanceChange = newBalanceChange - oldBalanceChange;

  // update account balance  and transaction in a transaction

  const transaction = await db.$transaction(async (tx) => {
    const updated = await tx.transaction.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        ...data,
        nextRecurringDate:
          data.isRecurring && data.recurringInterval
            ? calculateNextRecurringDate(data.date, data.recurringInterval)
            : null,
      },
    });

    // update account balance

    await tx.account.update({
      where: { id: data.accountId },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    });

    return updated;
  });

  revalidatePath("/dashboard");
  revalidatePath(`/account/${data.accountId}`);

  return {
    success: true,
    data: serializeAmount(transaction),
  };
}
