"use client";

import { useEffect, useRef } from "react";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";
import { Button } from "@/components/ui/button";
import { Camera, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef();

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scanResult,
    error: scanError,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
          return;
    }

    await scanReceiptFn(file)

};

useEffect(() => {
    if(scanResult && !scanReceiptLoading){
        onScanComplete(scanResult)
        toast.success("Receipt scanned successfully")
    }
} , [scanReceiptLoading , scanResult]) 

  return (
    <div>
      <input
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handleReceiptScan(file);
        }}
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
      />

      <Button
        className={
          "w-full h-12  bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white cursor-pointer"
        }
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Camera className="mr-2 h-4 w-4" />
        )}
        Scan Receipt with AI
      </Button>
    </div>
  );
}

export default ReceiptScanner;
