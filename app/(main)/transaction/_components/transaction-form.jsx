"use client";

import { createTransaction } from "@/actions/transaction";
import { updateTransaction } from "@/actions/transaction";
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
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ReceiptScanner from "./receipt-scanner";

function TransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();

  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

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
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            date: initialData.date.toISOString().split("T")[0],
            accountId: initialData.accountId,
            category: initialData.category,
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            date: new Date().toISOString().split("T")[0], // ISO string as default
            accountId:
              accounts.length > 0
                ? accounts.find((acc) => acc.isDefault)?.id || accounts[0].id
                : "",
            category:
              categories.filter((cat) => cat.type === "EXPENSE").length > 0
                ? categories.filter((cat) => cat.type === "EXPENSE")[0].id
                : "",
            isRecurring: false,
          },
  });

  const {
    fn: transactionFn,
    loading: transactionLoading,
    data: transactionResult,
    error: transactionError,
  } = useFetch(editMode ? updateTransaction : createTransaction);

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
    const categoryExists = filteredCategories.some(
      (cat) => cat.id === currentCategory
    );

    if (!categoryExists && filteredCategories.length > 0) {
      setValue("category", filteredCategories[0].id);
    }
  }, [type, filteredCategories, setValue, getValues]);

  // Format date for ISO
  const formatDateForISO = (dateString) => {
    if (!dateString) return new Date().toISOString();
    
    // If just date string (YYYY-MM-DD), add time component
    if (dateString.length === 10 && dateString.includes('-')) {
      return `${dateString}T00:00:00.000Z`;
    }
    
    // Already has time component
    if (dateString.includes('T')) {
      return dateString;
    }
    
    // Try to parse as date
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return new Date().toISOString();
    }
  };

  const onSubmit = async (formData) => {
    try {
      // Make sure we have required fields
      if (!formData.accountId && accounts.length > 0) {
        formData.accountId = accounts[0].id;
      }

      if (!formData.category && filteredCategories.length > 0) {
        formData.category = filteredCategories[0].id;
      }

      // Format the data properly
      const finalFormData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formatDateForISO(formData.date),
      };
      
      console.log('Submitting transaction...', finalFormData);
      
      // Direct server action calls
      let result;
      
      if (editId) {
        // Update transaction
        console.log('Updating transaction:', editId);
        result = await updateTransaction(editId, finalFormData);
      } else {
        // Create new transaction
        console.log('Creating new transaction');
        result = await createTransaction(finalFormData);
      }
      
      console.log('Server response:', result);
      
      if (result && result.success) {
        toast.success(editId ? 'Transaction updated!' : 'Transaction created!');
        
        // Get account ID to redirect to
        let accountId = finalFormData.accountId;
        
        if (result.data?.accountId) {
          accountId = result.data.accountId;
        } else if (result.data?.newTransaction?.accountId) {
          accountId = result.data.newTransaction.accountId;
        }
        
        console.log('Redirecting to account:', accountId);
        
        // Instead of router.push, use window.location for reliable redirect
        setTimeout(() => {
          window.location.href = `/account/${accountId}`;
        }, 500);
      } else {
        // Handle error
        const errorMessage = result?.error || 'Failed to process transaction';
        console.error('Transaction error:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      if (scannedData.date) {
        // Ensure date is in YYYY-MM-DD format for the form
        const dateObj = new Date(scannedData.date);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        setValue("date", `${yyyy}-${mm}-${dd}`);
      }

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
        {!editMode &&   <ReceiptScanner onScanComplete={handleScanComplete} />}

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
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                ₹
              </span>
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
                console.log("Setting accountId:", value);
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
              console.log("Setting category:", value);
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
                      setValue("date", date.toISOString().split("T")[0]);
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
            onClick={ handleSubmit(onSubmit) }
            disabled={isSubmitting}
            className="h-12 flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <Loader2Icon className="animate-spin mr-2" /> 
            ) : null}
            {editMode ? "Update Transaction" : "Add Transaction"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;
