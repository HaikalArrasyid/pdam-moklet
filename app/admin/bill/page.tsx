"use client";

import { getCookies } from "@/helper/cookies";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useSearchParams, useRouter } from "next/navigation";
import DropBill from "./drop";

export interface BillResponse {
  success: boolean;
  message: string;
  data: BillType[];
  count: number;
}

export interface BillType {
  id: number;
  customer_id: number;
  admin_id: number;
  month: number;
  year: number;
  measurement_number: string;
  usage_value: number;
  price: number;
  service_id: number;
  paid: boolean;
  amount: number;
  createdAt: string;
  updatedAt: string;
  service: {
    id: number;
    name: string;
    min_usage: number;
    max_usage: number;
    price: number;
  };
  customer: {
    id: number;
    name: string;
    customer_number: string;
    phone: string;
    address: string;
  };
  admin: {
    id: number;
    name: string;
    phone: string;
  };
}

export default function BillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const customerId = searchParams.get("customerId") || "";
  
  const [data, setData] = useState<BillType[]>([]);
  const [success, setSuccess] = useState(true);
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [keyword, setKeyword] = useState(search);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      
      let url = `${process.env.NEXT_PUBLIC_BASE_URL}/bills`;
      const params = new URLSearchParams();
      
      if (search) {
        params.append("search", search);
      }
      if (customerId) {
        params.append("customerId", customerId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          cache: "no-store",
          "app-key": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${await getCookies("token")}`,
        },
      });

      if (!response.ok) {
        const responseData: BillResponse = await response.json();
        setSuccess(false);
        setMessage(responseData?.message || "Failed to fetch bills");
        setData([]);
        setCount(0);
        setTotalAmount(0);
        return;
      }

      const result: BillResponse = await response.json();
      setSuccess(result.success);
      setData(result.data || []);
      setCount(result.count || 0);
      setMessage(result.message);
      
      const total = (result.data || []).reduce((sum, bill) => sum + (bill.amount || 0), 0);
      setTotalAmount(total);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching bills:", error);
      setSuccess(false);
      setMessage("Failed to fetch bills");
      setData([]);
      setCount(0);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, [search, customerId]);

  // Auto refresh setiap 30 detik
  useEffect(() => {
    fetchBills();
    
    const interval = setInterval(() => {
      fetchBills();
    }, 30000); // 30 detik
    
    return () => clearInterval(interval);
  }, [fetchBills]);

  const handleRefresh = useCallback(async () => {
    await fetchBills();
    toast.info("Data tagihan diperbarui");
  }, [fetchBills]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(window.location.search);
      
      if (keyword.trim() === "") {
        params.delete("search");
      } else {
        params.set("search", keyword.trim());
      }
      
      router.push(`/admin/bill${params.toString() ? "?" + params.toString() : ""}`);
    }
  };

  const handleClearSearch = () => {
    setKeyword("");
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    router.push(`/admin/bill${params.toString() ? "?" + params.toString() : ""}`);
  };

  const getMonthName = (month: number) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[month - 1];
  };

  const getStatusBadge = (paid: boolean) => {
    if (paid) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Lunas
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Belum Bayar
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Memuat data tagihan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-20 w-32 h-32 bg-indigo-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-cyan-400 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-blue-500 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative p-6">
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
            Kelola Tagihan PDAM
          </h1>
          <p className="text-lg text-blue-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Sistem Informasi Tagihan Air Minum Modern & Terpercaya
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">
                Daftar Tagihan
              </h2>
              <p className="text-sm text-slate-500">
                {search ? `Hasil pencarian untuk: "${search}"` : "List of all billing records"}
                {customerId && ` - Customer ID: ${customerId}`}
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
              <div className="w-full max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-10 p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyUp={handleSearch}
                    placeholder="Cari tagihan berdasarkan nama pelanggan..."
                  />
                  {keyword && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="hidden md:block w-4"></div>
              
              <Link
                href="/admin/bill/add"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 font-semibold whitespace-nowrap w-full md:w-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Tagihan
              </Link>
            </div>
          </div>

          {success && count > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Tagihan</p>
                    <p className="text-3xl font-bold mt-2">{count}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Nominal</p>
                    <p className="text-3xl font-bold mt-2">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Tagihan Belum Bayar</p>
                    <p className="text-3xl font-bold mt-2">
                      {data.filter(bill => !bill.paid).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!success && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full mb-6 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Peringatan</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => fetchBills()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {success && count === 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full mb-6 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.98-5.812-2.708a6 6 0 1110.624 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {search ? "Hasil pencarian tidak ditemukan" : "Belum ada tagihan"}
              </h2>
              <p className="text-blue-600 font-medium mb-4">
                {search ? "Coba kata kunci lain atau hapus pencarian" : "Tambahkan tagihan pertama Anda dengan tombol di atas"}
              </p>
              {search && (
                <button
                  onClick={() => {
                    setKeyword("");
                    const params = new URLSearchParams(window.location.search);
                    params.delete("search");
                    router.push(`/admin/bill${params.toString() ? "?" + params.toString() : ""}`);
                  }}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                >
                  Hapus Pencarian
                </button>
              )}
            </div>
          )}

          {/* Enhanced Table */}
          {success && count > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
              {/* Table Summary with Refresh Button */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="text-sm text-blue-700 font-medium flex items-center gap-2">
                    <span>Menampilkan <span className="font-bold">{count}</span> tagihan</span>
                    <span className="text-xs text-gray-500">
                      Last updated: {lastUpdated.toLocaleTimeString("id-ID")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Tombol Refresh */}
                    <button
                      onClick={handleRefresh}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      title="Refresh data"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                    
                    {/* Tombol Hapus Filter (jika ada search) */}
                    {search && (
                      <button
                        onClick={() => {
                          setKeyword("");
                          const params = new URLSearchParams(window.location.search);
                          params.delete("search");
                          router.push(`/admin/bill${params.toString() ? "?" + params.toString() : ""}`);
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 px-3 py-1.5 bg-red-50 rounded-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Hapus filter
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Pelanggan</th>
                      <th className="px-6 py-4 text-left font-semibold">Periode</th>
                      <th className="px-6 py-4 text-left font-semibold">No. Meter</th>
                      <th className="px-6 py-4 text-left font-semibold">Pemakaian (m³)</th>
                      <th className="px-6 py-4 text-left font-semibold">Tagihan</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-center font-semibold">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.map((bill) => (
                      <tr
                        key={`keyBill-${bill.id}`}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                      >
                        <td className="px-6 py-4 font-medium text-slate-700">
                          #{bill.id}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-700">{bill.customer.name}</p>
                            <p className="text-xs text-slate-500">{bill.customer.customer_number}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {getMonthName(bill.month)} {bill.year}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-600">
                          {bill.measurement_number}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {bill.usage_value.toLocaleString("id-ID")} m³
                        </td>
                        <td className="px-6 py-4 font-semibold text-blue-600">
                          Rp {bill.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(bill.paid)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <Link
                              href={`/admin/bill/edit/${bill.id}`}
                              className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs font-semibold whitespace-nowrap"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </Link>
                            <DropBill 
                              billId={bill.id}
                              billInfo={`${bill.customer.name} - ${getMonthName(bill.month)} ${bill.year}`}
                              onDeleteSuccess={fetchBills}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PDAM</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              © 2026 PDAM - Sistem Informasi Modern & Terpercaya
            </p>
            <div className="mt-3 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}