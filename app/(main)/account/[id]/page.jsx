import { getAccountsWithTransactions } from "@/actions/account";
import React from "react";
import { notFound } from "next/navigation";

const AccountsPage = async ({ params }) => {
  const accountData = await getAccountsWithTransactions(params.id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5 flex gap-4  items-end justify-between">
      <div>
        <h1 className="text-5xl capitalize sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-500 to-purple-600 bg-clip-text text-transparent ">
          {account.name}
        </h1>
        <p className="text-muted-foreground">
          {account.type.charAt(0).toUpperCase() +
            account.type.slice(1).toLowerCase()}{" "}
          Account
        </p>
      </div>

      <div className="text-right pb-2">
        <div className="text-xl sm:text-2xl font-bold">₹{parseFloat(account.balance).toFixed(2)}</div>
        <p className="text-muted-foreground text-sm">{account._count.transactions || 0} Transactions</p>
      </div>

      {/* Chart Table */}

      {/* Transaction Table */}
    </div>
  );
};

export default AccountsPage;
