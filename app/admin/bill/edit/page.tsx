"use client";

import { getCookies } from "@/helper/cookies";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Customer {
  id: number;
  name: string;
  customer_number: string;
  phone: string;
  address: string;
}

interface Service {
  id: number;
  name: string;
  min_usage: number;
  max_usage: number;
  price: number;
}

interface Bill {
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
}

export default function EditBillPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [originalBill, setOriginalBill] = useState<Bill | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [formData, setFormData] = useState({
    customer_id: "",
    month: 1,
    year: new Date().getFullYear(),
    measurement_number: "",
    usage_value: "",
    service_id: "",
    paid: false,
  });

  useEffect(() => {
    if (billId) {
      fetchBillData();
      fetchCustomers();
      fetchServices();
    }
  }, [billId]);

  const fetchBillData = async () => {
    try {
      const token = await getCookies("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/bills/${billId}`, {
        method: "GET",
        headers: {
          "app-key": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const bill = result.data;
        setOriginalBill(bill);
        
        setFormData({
          customer_id: bill.customer_id.toString(),
          month: bill.month,
          year: bill.year,
          measurement_number: bill.measurement_number,
          usage_value: bill.usage_value.toString(),
          service_id: bill.service_id.toString(),
          paid: bill.paid,
        });
        
        const serviceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/services/${bill.service_id}`, {
          method: "GET",
          headers: {
            "app-key": process.env.NEXT_PUBLIC_APP_KEY || "",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (serviceResponse.ok) {
          const serviceResult = await serviceResponse.json();
          setSelectedService(serviceResult.data);
          setCalculatedAmount(bill.amount);
        }
      } else {
        toast.error("Gagal mengambil data tagihan");
        router.push("/admin/bill");
      }
    } catch (error) {
      console.error("Error fetching bill:", error);
      toast.error("Terjadi kesalahan saat mengambil data");
      router.push("/admin/bill");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = await getCookies("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/customers`, {
        method: "GET",
        headers: {
          "app-key": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCustomers(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const token = await getCookies("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/services`, {
        method: "GET",
        headers: {
          "app-key": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setServices(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    setFormData({ ...formData, service_id: serviceId });
    const service = services.find(s => s.id === parseInt(serviceId));
    setSelectedService(service || null);
    
    if (formData.usage_value && service) {
      const usage = parseFloat(formData.usage_value);
      const amount = usage * service.price;
      setCalculatedAmount(amount);
    }
  };

  const handleUsageChange = (usage: string) => {
    setFormData({ ...formData, usage_value: usage });
    if (selectedService && usage) {
      const usageValue = parseFloat(usage);
      const amount = usageValue * selectedService.price;
      setCalculatedAmount(amount);
    } else {
      setCalculatedAmount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalBill) {
      toast.error("Data tagihan tidak ditemukan");
      return;
    }
    
    setLoading(true);

    try {
      const token = await getCookies("token");
      
      // Buat object hanya untuk field yang berubah
      const updates: any = {};
      
      if (parseInt(formData.customer_id) !== originalBill.customer_id) {
        updates.customer_id = parseInt(formData.customer_id);
      }
      if (parseInt(formData.month.toString()) !== originalBill.month) {
        updates.month = parseInt(formData.month.toString());
      }
      if (parseInt(formData.year.toString()) !== originalBill.year) {
        updates.year = parseInt(formData.year.toString());
      }
      if (formData.measurement_number !== originalBill.measurement_number) {
        updates.measurement_number = formData.measurement_number;
      }
      if (parseFloat(formData.usage_value) !== originalBill.usage_value) {
        updates.usage_value = parseFloat(formData.usage_value);
        updates.amount = calculatedAmount; // Update amount juga
      }
      if (parseInt(formData.service_id) !== originalBill.service_id) {
        updates.service_id = parseInt(formData.service_id);
      }
      if (formData.paid !== originalBill.paid) {
        updates.paid = formData.paid;
      }
      
      // Jika tidak ada perubahan
      if (Object.keys(updates).length === 0) {
        toast.info("Tidak ada perubahan yang dilakukan");
        router.push("/admin/bill");
        return;
      }
      
      console.log("Updating fields:", updates);
      
      // Kirim hanya field yang berubah dengan method PATCH
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/bills/${billId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "app-key": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast.success("Tagihan berhasil diperbarui!");
        router.push("/admin/bill");
      } else {
        const error = await response.json();
        console.error("Update failed:", error);
        
        if (error.message?.includes("already exist") || error.message?.includes("already exists")) {
          toast.error(`Gagal: Tagihan untuk periode ini sudah ada. Silakan pilih periode yang berbeda.`);
        } else {
          toast.error(error.message || "Gagal memperbarui tagihan");
        }
      }
    } catch (error) {
      console.error("Error updating bill:", error);
      toast.error("Terjadi kesalahan saat memperbarui tagihan");
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[month - 1];
  };

  if (initialLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin/bill"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Daftar Tagihan
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Tagihan</h1>
            <p className="text-gray-600">Perbarui informasi tagihan pelanggan</p>
            <p className="text-xs text-gray-500 mt-2">* Hanya field yang diubah akan diperbarui</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pilih Pelanggan *
              </label>
              <select
                required
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Pilih Pelanggan</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.customer_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pilih Layanan *
              </label>
              <select
                required
                value={formData.service_id}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Pilih Layanan</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} (Min: {service.min_usage} m³, Max: {service.max_usage} m³, Rp {service.price.toLocaleString("id-ID")}/m³)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bulan *
                </label>
                <select
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={m}>{getMonthName(m)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tahun *
                </label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  min={2020}
                  max={2030}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nomor Meter *
              </label>
              <input
                type="text"
                required
                value={formData.measurement_number}
                onChange={(e) => setFormData({ ...formData, measurement_number: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="Contoh: 343224"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pemakaian (m³) *
              </label>
              <input
                type="number"
                required
                value={formData.usage_value}
                onChange={(e) => handleUsageChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status Pembayaran
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!formData.paid}
                    onChange={() => setFormData({ ...formData, paid: false })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Belum Bayar</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.paid}
                    onChange={() => setFormData({ ...formData, paid: true })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Lunas</span>
                </label>
              </div>
            </div>

            {calculatedAmount > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-1">Total Tagihan</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {calculatedAmount.toLocaleString("id-ID")}
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Menyimpan..." : "Perbarui Tagihan"}
              </button>
              
              <Link
                href="/admin/bill"
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 text-center"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}