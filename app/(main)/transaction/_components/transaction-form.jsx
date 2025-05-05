"use client";

import { createTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar1Icon, Loader2Icon} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function formatDateToISOString(date) {
  if (!date) return "";
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(date + "T00:00:00").toISOString();
  }
  if (date instanceof Date) {
    return date.toISOString();
  }
  return date;
}

function TransactionForm({ accounts, categories }) {
  const router = useRouter();
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      accountId: accounts.find((acc) => acc.isDefault)?.id,
      isRecurring: false,
    },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
    error: transactionError,
  } = useFetch(createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const FilteredCategories = categories.filter(
    (category) => category.type === type
  );

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
      date: formatDateToISOString(data.date),
    };
    await transactionFn(formData);
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success("Transaction created successfully");
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Transaction Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Transaction Type
          </label>
          <Select
            onValueChange={(value) => setValue("type", value)}
            defaultValue={getValues("type")}
          >
            <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Select Type" className="text-gray-600" />
            </SelectTrigger>
            <SelectContent className="rounded-lg shadow-lg">
              <SelectItem value="EXPENSE" className="hover:bg-blue-50">
                <span className="text-red-500">EXPENSE</span>
              </SelectItem>
              <SelectItem value="INCOME" className="hover:bg-blue-50">
                <span className="text-green-500">INCOME</span>
              </SelectItem>
            </SelectContent>
          </Select>
          {transactionError?.type && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
             
              {transactionError?.type}
            </div>
          )}
        </div>

        {/* Amount & Account Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8 h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                {...register("amount")}
              />
            </div>
            {transactionError?.amount && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                {transactionError?.amount}
              </div>
            )}
          </div>

          {/* Account Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Account
            </label>
            <Select
              onValueChange={(value) => setValue("accountId", value)}
              defaultValue={getValues("accountId")}
            >
              <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-lg">
                {accounts.map((account) => (
                  <SelectItem
                    key={account.id}
                    value={account.id}
                    className="group hover:bg-blue-50"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>{account.name}{" "}</span>
                      <span className="text-gray-500 text-sm">
                        ₹{parseFloat(account.balance).toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                <CreateAccountDrawer>
                  <Button
                    variant="ghost"
                    className="w-full h-10 text-blue-600 hover:bg-blue-50 font-medium"
                  >
                    + New Account
                  </Button>
                </CreateAccountDrawer>
              </SelectContent>
            </Select>
            {transactionError?.accountId && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                {transactionError?.accountId}
              </div>
            )}
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Category
          </label>
          <Select
            onValueChange={(value) => setValue("category", value)}
            defaultValue={getValues("category")}
          >
            <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="rounded-lg shadow-lg">
              {FilteredCategories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="hover:bg-blue-50"
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {transactionError?.category && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              {transactionError?.category}
            </div>
          )}
        </div>

        {/* Date & Recurring Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Picker */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={
                    "w-full h-12 pl-4 text-left font-normal rounded-lg border-gray-300 hover:bg-gray-50"
                  }
                >
                  <Calendar1Icon className="mr-3 h-5 w-5 text-gray-500" />
                  {date ? format(date, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="rounded-lg shadow-lg">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => setValue("date", date)}
                  className="rounded-md"
                  classNames={{
                    day_selected: "bg-blue-500 hover:bg-blue-600",
                  }}
                  disabled = { date => date < new Date("1900-01-01") || date > new Date() }
                />
              </PopoverContent>
            </Popover>
            {transactionError?.date && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                {transactionError?.date}
              </div>
            )}
          </div>

          {/* Recurring Toggle */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Recurring
            </label>
            <div className="flex items-center h-12 px-4 rounded-lg border border-gray-300">
              <Switch
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
                className="data-[state=checked]:bg-blue-500"
              />
              <span className="ml-3 text-sm text-gray-600">
                {isRecurring ? "Recurring Transaction" : "One-time Transaction"}
              </span>
            </div>
          </div>
        </div>

        {/* Recurring Interval */}
        {isRecurring && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Recurring Interval
            </label>
            <Select
              onValueChange={(value) => setValue("recurringInterval", value)}
              defaultValue={getValues("recurringInterval")}
            >
              <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select Interval" />
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-lg">
                <SelectItem value="DAILY" className="hover:bg-blue-50">
                  Daily
                </SelectItem>
                <SelectItem value="WEEKLY" className="hover:bg-blue-50">
                  Weekly
                </SelectItem>
                <SelectItem value="MONTHLY" className="hover:bg-blue-50">
                  Monthly
                </SelectItem>
                <SelectItem value="YEARLY" className="hover:bg-blue-50">
                  Yearly
                </SelectItem>
              </SelectContent>
            </Select>
            {transactionError?.recurringInterval && (
              <div className="flex items-center mt-1 text-red-600 text-sm">
                {transactionError?.recurringInterval}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Description
          </label>
          <Input
            placeholder="Add note..."
            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
            {...register("description")}
          />
          {transactionError?.description && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              {transactionError?.description}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
            className="h-12 flex-1 rounded-lg border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={transactionLoading}
            className="h-12 flex-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors duration-200"
          >
            {transactionLoading ? (
              <div className="flex items-center">
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </div>
            ) : (
              "Add Transaction"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;