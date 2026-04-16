"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface Service {
  id: number;
  name: string;
}

interface Customer {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  address: string;
  service_id: number;
  createdAt: string;
}

interface AddBillFormProps {
  services: Service[];
  customers: Customer[];
}

export default function AddBillForm({ services, customers }: AddBillFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customer_id: "",
    service_id: "",
    month: "",
    year: "",
    measurement_number: "",
    usage_value: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.customer_id) {
      setError("Silakan pilih customer.");
      setLoading(false);
      return;
    }

    if (!formData.service_id) {
      setError("Silakan pilih layanan (service).");
      setLoading(false);
      return;
    }

    try {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/bills`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_id: parseInt(formData.customer_id),
          service_id: parseInt(formData.service_id),
          month: parseInt(formData.month),
          year: parseInt(formData.year),
          measurement_number: formData.measurement_number,
          usage_value: parseInt(formData.usage_value),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gagal menambahkan bill");
      }

      // Redirect langsung ke halaman daftar bill
      router.push("/admin/bill");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Tambah Bill Baru</h1>
          </div>

          {/* Body Form */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} (ID: {customer.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Layanan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="service_id"
                    value={formData.service_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih layanan</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} (ID: {service.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bulan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="month"
                    min="1"
                    max="12"
                    value={formData.month}
                    onChange={handleChange}
                    required
                    placeholder="1-12"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    min="2000"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    placeholder="Tahun"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Measurement Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Meter <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="measurement_number"
                    value={formData.measurement_number}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: 118"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Usage Value */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Penggunaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="usage_value"
                    value={formData.usage_value}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: 20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Tambah Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
