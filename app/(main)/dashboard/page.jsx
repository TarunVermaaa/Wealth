import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React, { Suspense } from "react";
import AccountCard from "./_components/account-card";
import { getCurrentBudget } from "@/actions/budget";
import BudgetProgress from "./_components/budget-progress";
import { toast } from "sonner";
import DashboardOverview from "./_components/transaction-overview";

async function DashboardPage() {
  const response = await getUserAccounts();

  const defaultAccount = response.data.find((account) => account.isDefault);
  console.log('Default account found:', defaultAccount);

  let budgetData = null;

  const transactions = await getDashboardData()

  if (defaultAccount) {
    // Make sure we're passing the correct accountId
    console.log('Calling getCurrentBudget with accountId:', defaultAccount.id);
    budgetData = await getCurrentBudget(defaultAccount.id);
    console.log('Budget data fetched:', budgetData);
  }

  if (!response.success || !response.data) {
    return <div>No accounts found</div>;
  }

  const accounts = response.data;

  return (
    <div className="px-5">
      {/* Budget progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* overview */}
      <Suspense fallback={"Loading Overview..."} >
        <DashboardOverview  accounts={accounts} transactions={transactions || [] } />
      </Suspense>

      {/* Account Grid */}
      <div className="grid gap-4  md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts.map((account) => {
            return <AccountCard key={account.id} account={account} />;
          })}
      </div>
    </div>
  );
}

export default DashboardPage;
