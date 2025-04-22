"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { useForm } from "react-hook-form";
import { accountSchema } from "@/app/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import { createAccount } from "@/actions/dashboard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const { userId, isLoaded } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    data: newAccount,
    error,
    fn: createAccountFn,
    loading: createAccountLoading,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    if (!userId || !isLoaded) {
      toast.error("Please sign in first!");
      return;
    }
    await createAccountFn(data);
  };

  useEffect(() => {
    if (userId && newAccount && !createAccountLoading) {
      toast.success("Account created successfully!");
      console.log("New Account", newAccount);
      console.log("User ID", userId);
      reset();
      setOpen(false);
    }
  }, [createAccountLoading, newAccount]);

  useEffect(() => {
    if (error) {
      console.log("[CLIENT] Error", error);
      toast.error(error.message || "Failed to create Account!");
    }
  }, [error]);

  useEffect(() => {
    if (isLoaded) {
      console.log("Current User ID:", userId); // Debug log
    }
  }, [isLoaded, userId]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold text-gray-800">
            Create New Account
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Account Name */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="name"
              >
                Account Name
              </label>
              <Input
                id="name"
                placeholder="Enter Account Name"
                className="w-full"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="type"
              >
                Account Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Initial Balance */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="balance"
              >
                Initial Balance
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-sm text-red-500">{errors.balance.message}</p>
              )}
            </div>

            {/* Default Account Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                  htmlFor="isDefault"
                >
                  Set as Default
                </label>
                <p className="text-sm text-gray-500">
                  This account will be used as the default for transactions.
                </p>
              </div>
              <Switch
                id="isDefault"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={createAccountLoading}
                >
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4 " /> Creating
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default CreateAccountDrawer;
