"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { syncUserWithDB } from "@/lib/syncUser";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };

  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }

  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};

export async function updateDefaultAccount(accountId) {
  await syncUserWithDB();
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where: { id: accountId, userId: user.id },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");

    return { success: true, account: serializeAccount(account) };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

export async function getAccountsWithTransactions(accountId) {
  await syncUserWithDB();
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const account = await db.account.findUnique({
    where: { id: accountId, userId: user.id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) throw new Error("Account not found");

  return {
    success: true,
    ...serializeTransaction(account),
    transactions: account.transactions.map(serializeTransaction),
  };
}

export async function bulkDeleteTransactions(transactionId ) {
  await syncUserWithDB();
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionId },
        userId: user.id,
      },
    });

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete the transaction and update the account balance
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where : {
          id : { in : transactionId },
          userId : user.id
        }
      })


      for( const [accountId , balanceChange ] of  Object.entries(accountBalanceChanges)){
        await tx.account.update({
          where : {id : accountId},
          data : {
            balance: {
              increment : balanceChange
            }
          }
        })
      }
    })

    revalidatePath(`/account/${accountId}`)

    return { success : true }

  } catch (error) {
    console.log(error);
    return { success : false , error : error.message }
  }
}
