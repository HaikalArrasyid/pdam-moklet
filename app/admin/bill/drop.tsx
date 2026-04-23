"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { getCookies } from "@/helper/cookies";

interface DropBillProps {
  billId: number;
  billInfo?: string;
  onDeleteSuccess: () => void;
}

export default function DropBill({ billId, billInfo = "", onDeleteSuccess }: DropBillProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus tagihan ${billInfo ? `"${billInfo}"` : "ini"}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = await getCookies("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/bills/${billId}`, {
        method: "DELETE",
        headers: {
          "app-key": process.env.NEXT_PUBLIC_APP_KEY || "",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Tagihan berhasil dihapus!");
        onDeleteSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData?.message || "Gagal menghapus tagihan");
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
      toast.error("Terjadi kesalahan saat menghapus tagihan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold whitespace-nowrap"
      aria-label={isDeleting ? "Menghapus..." : `Hapus tagihan ${billInfo || ""}`}
    >
      {isDeleting ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Hapus...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Hapus
        </>
      )}
    </button>
  );
}