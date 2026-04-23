import { getCookies } from "@/helper/cookies";
import { cookies } from "next/headers";
import Link from "next/link";

export interface ResponseCustomerProfile {
  success: boolean;
  message: string;
  data: Customer;
}

export interface Customer {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
}

async function getCustomerProfile(): Promise<Customer | null> {
  try {
    // 1. Ambil token dari cookie (cara server-side Next.js)
    const cookieStore = cookies();
    const token = (await cookies()).get('token')?.value; // ✅ Next.js 15/16+

    // Debug: biar kita tahu token terbaca atau tidak
    console.log("=== DEBUG PROFILE ===");
    console.log("Token ada?", !!token);
    console.log("API URL:", process.env.NEXT_PUBLIC_BASE_URL);

    // Kalau token nggak ada, langsung return null
    if (!token) {
      console.error("❌ Token tidak ditemukan di cookie");
      return null;
    }

    // 2. Fetch ke backend
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/customers/me`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        "Authorization": `Bearer ${token}`, // ← Token dikirim di header
      },
    });

    const responseData: ResponseCustomerProfile = await response.json();
    
    // 3. Cek response
    if (!response.ok) {
      console.error("❌ Failed to fetch customer profile:", responseData.message);
      return null;
    }
    
    if (!responseData.data) {
      console.warn("⚠️ Response ok tapi data null:", responseData);
      return null;
    }
    
    console.log("✅ Customer profile loaded:", responseData.data.name);
    return responseData.data;
    
  } catch (error) {
    console.error("💥 Error fetching customer profile:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const customerProfile = await getCustomerProfile();

  if (!customerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-white/50 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't load your customer profile. Please sign in again.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Ambil inisial dari nama untuk avatar
  const initials = customerProfile.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 md:p-8">
      {/* Container dengan animasi muncul */}
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Breadcrumb / Navigasi halus */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            href="/customer/dashboard"
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
          >
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-700">Profile</span>
        </div>

        {/* Profile Card Utama */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden mb-8 border border-white/50 transition-all hover:shadow-2xl">
          {/* Header dengan gradient dan avatar */}
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 md:px-10 py-8 md:py-10 text-white overflow-hidden">
            {/* Dekorasi latar belakang */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-300/20 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar besar dengan inisial */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-xl" />
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center shadow-2xl">
                  <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {initials}
                  </span>
                </div>
                {/* Badge online / role */}
                <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 border-2 border-white rounded-full shadow-lg" />
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {customerProfile.name}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    @{customerProfile.user.username}
                  </span>
                  <span className="bg-blue-100/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium capitalize flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    {customerProfile.user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Informasi */}
          <div className="p-6 md:p-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
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
              Profile Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="group bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-2xl border border-gray-200/60 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                </div>
                <p className="text-xl font-semibold text-gray-800 pl-12">
                  {customerProfile.name}
                </p>
              </div>

              {/* Phone Number */}
              <div className="group bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-2xl border border-gray-200/60 hover:border-green-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    Phone Number
                  </p>
                </div>
                <p className="text-xl font-semibold text-gray-800 pl-12">
                  {customerProfile.phone}
                </p>
              </div>

              {/* Username */}
              <div className="group bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-2xl border border-gray-200/60 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Username</p>
                </div>
                <p className="text-xl font-semibold text-gray-800 pl-12">
                  @{customerProfile.user.username}
                </p>
              </div>

              {/* Role */}
              <div className="group bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-2xl border border-gray-200/60 hover:border-purple-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                </div>
                <p className="text-xl font-semibold text-gray-800 capitalize pl-12">
                  {customerProfile.user.role}
                </p>
              </div>

              {/* Member Since */}
              <div className="group bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 rounded-2xl border border-gray-200/60 hover:border-amber-200 hover:shadow-md transition-all duration-200 md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    Member Since
                  </p>
                </div>
                <p className="text-xl font-semibold text-gray-800 pl-12">
                  {new Date(customerProfile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Kartu Aksi Cepat */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kelola Customers */}
          <Link
            href="/customer/dashboard"
            className="group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 md:p-8 border border-white/50 overflow-hidden transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-200/40 transition-colors" />
            <div className="relative flex items-start gap-5">
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Kelola Customers
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Lihat, tambah, edit, atau hapus data customer dengan mudah.
                </p>
                <div className="mt-4 flex items-center text-green-600 font-medium text-sm">
                  <span>Buka halaman Customers</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Kelola Services */}
          <Link
            href="/customer/services"
            className="group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 md:p-8 border border-white/50 overflow-hidden transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-200/40 transition-colors" />
            <div className="relative flex items-start gap-5">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-purple-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Kelola Services
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Lihat, tambah, edit, atau hapus layanan yang ditawarkan.
                </p>
                <div className="mt-4 flex items-center text-purple-600 font-medium text-sm">
                  <span>Buka halaman Services</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}