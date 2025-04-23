
"use client"

import React, { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { updateDefaultAccount } from "@/actions/account";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

const AccountCard = ({ account }) => {
  const {
    data: updatedAccount,
    error,
    fn: updateDefaultAccountFn,
    loading: updateDefaultAccountLoading,
  } = useFetch(updateDefaultAccount);

  const handleSwitchChange = async (event) => {
    event.preventDefault();

    if (account.isDefault) {
      toast.error("You need to have atleast one default account");
      return; // This will prevent the default account from being updated
    }

    await updateDefaultAccountFn(account.id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount, updateDefaultAccountLoading]);


  useEffect(()=> {
    if(error){
      toast.error(error || "Failed to update default account")
    }
  } , [error])


  return (
    <Link href={`/account/${account.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 border border-gray-100 rounded-xl overflow-hidden group">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {account.name}
              </CardTitle>
              <Badge
                variant="outline"
                className={`mt-1 ${
                  account.type === "SAVINGS"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-blue-50 text-blue-600 border-blue-200"
                }`}
              >
                {account.type}
              </Badge>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Switch
                checked={account.isDefault}
                onClick={handleSwitchChange}
                disabled={updateDefaultAccountLoading}
              />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <p className="text-3xl font-bold text-gray-900">
            ₹{account.balance.toLocaleString("en-IN")}
          </p>
          {account.isDefault && (
            <p className="text-xs text-green-600 mt-1">★ Default Account</p>
          )}
        </CardContent>

        <CardFooter className="flex justify-between text-sm text-gray-500 border-t pt-3">
          <div className="flex items-center">
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            <span>Income</span>
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            <span>Expenses</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default AccountCard;
