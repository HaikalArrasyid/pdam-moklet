"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("User");

  // Fungsi untuk pengecekan keamanan (Protected Route)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Kalau tidak ada token, tendang balik ke halaman login
    if (!token) {
      router.push("/signin"); // Pastikan url loginmu sesuai (/signin atau /auth/signin)
    } else {
      // Kalau ada, simpan data ke state buat ditampilkan
      setUserRole(role || "GUEST");
      // Opsional: Kamu bisa decode token JWT disini kalau mau ambil username asli
    }
  }, [router]);

  const handleLogout = () => {
    // Hapus semua data sesi
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Redirect ke login
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans">
      {/* --- NAVBAR DENGAN EFEK GLASSMORPHISM --- */}
      <nav className="sticky top-0 z-20 bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-md opacity-70"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                </div>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                DashboardKu
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Badge user dengan efek */}
              <div className="hidden sm:flex items-center gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-inner">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    Admin
                  </p>
                  <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">
                    {userRole}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="group relative bg-white/60 backdrop-blur-sm text-gray-700 hover:text-red-600 border border-gray-200/50 hover:border-red-200 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section dengan animasi dan ilustrasi */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-xl p-8 md:p-10 mb-10 text-white group">
          {/* Dekorasi abstrak */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-300/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-4xl animate-wave">👋</span>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Welcome back!
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Selamat, kamu berhasil masuk ke sistem. Token kamu valid dan
                tersimpan di Local Storage.
              </p>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-white">
                Session Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid (Contoh Widget) dengan ikon dan efek hover */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1 - Total Revenue */}
          <div className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
                +12%
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Total Revenue
            </p>
            <p className="text-3xl font-bold text-gray-800">Rp 12.500.000</p>
          </div>

          {/* Card 2 - User Role */}
          <div className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              </div>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                Active
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">User Role</p>
            <p className="text-3xl font-bold text-gray-800">{userRole}</p>
          </div>

          {/* Card 3 - Pending Tasks */}
          <div className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 hover:shadow-xl hover:border-orange-100 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Urgent
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Pending Tasks
            </p>
            <p className="text-3xl font-bold text-gray-800">5 Tasks</p>
          </div>
        </div>

        {/* Content Area Kosong - lebih interaktif */}
        <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl shadow-sm border border-white/50 p-10 min-h-[300px] flex flex-col items-center justify-center text-center overflow-hidden group hover:shadow-lg transition-shadow">
          {/* Dekorasi latar */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-100/30 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Mulai Kelola Datamu
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Ini adalah template dashboard. Silakan tambahkan tabel, chart,
              atau fitur lainnya di sini.
            </p>
            <div className="mt-8 flex justify-center">
              <span className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium bg-indigo-50 px-4 py-2 rounded-full border border-indigo-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Tambahkan widget pertama
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}