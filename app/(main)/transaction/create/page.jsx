import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import React from "react";
import TransactionForm from "../_components/transaction-form";

async function AddTransactionPage() {
  const accounts = await getUserAccounts();
  console.log(accounts);
  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold mb-5 ">
        Add Transaction
      </h1>

      <TransactionForm
        accounts={accounts.data}
        categories={defaultCategories}
      />
    </div>
  );
}

export default AddTransactionPage;
