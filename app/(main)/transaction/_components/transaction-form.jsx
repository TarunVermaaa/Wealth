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
import { Calendar1Icon, Loader2Icon, Receipt } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ReceiptScanner from "./receipt-scanner";

function TransactionForm({ accounts, categories }) {
  const router = useRouter();
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0], // ISO string as default
      accountId: accounts.length > 0 ? (accounts.find((acc) => acc.isDefault)?.id || accounts[0].id) : "",
      category: categories.filter(cat => cat.type === "EXPENSE").length > 0 ? 
               categories.filter(cat => cat.type === "EXPENSE")[0].id : "",
      isRecurring: false,
    },
  });

  const { fn: transactionFn } = useFetch(createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );
  
  // Update category when type changes
  useEffect(() => {
    // If current category doesn't match the current type, reset it
    const currentCategory = getValues("category");
    const categoryExists = filteredCategories.some(cat => cat.id === currentCategory);
    
    if (!categoryExists && filteredCategories.length > 0) {
      setValue("category", filteredCategories[0].id);
    }
  }, [type, filteredCategories, setValue, getValues]);

  const onSubmit = async (data) => {
    try {
      // Make sure we have valid accountId and category
      if (!data.accountId && accounts.length > 0) {
        data.accountId = accounts[0].id;
      }
      
      if (!data.category && filteredCategories.length > 0) {
        data.category = filteredCategories[0].id;
      }
      
      // Make sure date is in proper ISO format
      const formatFullISODate = (dateString) => {
        if (!dateString) return new Date().toISOString();
        // If it's just a date (YYYY-MM-DD), add the time part
        if (dateString.length === 10 && dateString.includes('-')) {
          return new Date(`${dateString}T00:00:00.000Z`).toISOString();
        }
        // If it's already a full ISO date
        if (dateString.includes('T')) {
          return dateString;
        }
        // Otherwise try to parse it
        return new Date(dateString).toISOString();
      };
      
      // Format data for submission
      const formData = {
        ...data,
        amount: parseFloat(data.amount),
        date: formatFullISODate(data.date),
      };
      
      console.log('Submitting form data:', formData);
      
      // Submit transaction
      const result = await createTransaction(formData);
      console.log('Transaction result:', result);
      
      if (result?.success) {
        toast.success("Transaction created successfully");
        reset();
        
        // Find accountId to redirect to
        let redirectAccountId = accounts[0]?.id; // Default fallback
        
        if (result.data?.newTransaction?.accountId) {
          redirectAccountId = result.data.newTransaction.accountId;
        } else if (result.data?.accountId) {
          redirectAccountId = result.data.accountId;
        } else if (formData.accountId) {
          redirectAccountId = formData.accountId;
        }
        
        console.log('Redirecting to account:', redirectAccountId);
        
        // Use window.location for hard redirect instead of router
        window.location.href = `/account/${redirectAccountId}`;
      } else {
        toast.error(result?.error || "Failed to create transaction");
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to create transaction');
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", scannedData.date); // Use string directly
      
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <ReceiptScanner onScanComplete={handleScanComplete} />

        {/* Transaction Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Transaction Type
          </label>
          <Select
            value={type}
            onValueChange={(value) => setValue("type", value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">EXPENSE</SelectItem>
              <SelectItem value="INCOME">INCOME</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount & Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8 h-12"
                {...register("amount")}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold">Account</label>
            <Select
              defaultValue={getValues("accountId")}
              onValueChange={(value) => {
                console.log('Setting accountId:', value);
                setValue("accountId", value);
              }}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex justify-between w-full">
                      <span>{account.name}</span>
                      <span>₹{account.balance.toFixed(2)}</span>
                    </div>
                  </SelectItem>
                ))}
                <CreateAccountDrawer>
                  <Button variant="ghost" className="w-full">
                    + New Account
                  </Button>
                </CreateAccountDrawer>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold">Category</label>
          <Select
            defaultValue={getValues("category")}
            onValueChange={(value) => {
              console.log('Setting category:', value);
              setValue("category", value);
            }}
          >
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
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
        </div>

        {/* Date & Recurring */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-12">
                  <Calendar1Icon className="mr-3 h-5 w-5" />
                  {date ? format(new Date(date), "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={date ? new Date(date) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setValue("date", date.toISOString().split('T')[0]);
                    }
                  }}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold">Recurring</label>
            <div className="flex items-center h-12 px-4 border rounded-lg">
              <Switch
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
              />
              <span className="ml-3">
                {isRecurring ? "Recurring" : "One-time"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold">Description</label>
          <Input
            placeholder="Add note..."
            className="h-12"
            {...register("description")}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
            className="h-12 flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="h-12 flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <Loader2Icon className="animate-spin mr-2" />
            ) : null}
            Add Transaction
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;