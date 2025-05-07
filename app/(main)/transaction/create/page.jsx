import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import React from "react";
import TransactionForm from "../_components/transaction-form";
import { getTransactions } from "@/actions/transaction";

async function AddTransactionPage({ searchParams }) {
  const accounts = await getUserAccounts();
  console.log(accounts);

  const editId = searchParams?.edit;

  console.log("editId is here", editId);

  let initialData = null;

  if (editId) {
    const transaction = await getTransactions(editId);
    initialData = transaction.data;
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold mb-5 ">
        {editId ? "Edit Transaction" : "Add Transaction"}
      </h1>

      <TransactionForm
        accounts={accounts.data}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}

export default AddTransactionPage;
