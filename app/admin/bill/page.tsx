import { getCookies } from "@/helper/cookies"

export interface Bill {
  customer_id: number
  service_id: number
  month: number
  year: number
  measurement_number: string
  usage_value: number
}

export interface BillResponse {
  success: boolean
  message: string
  data: Bill[]
  count?: number
}

export async function getBills(): Promise<BillResponse> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/bills`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        "Authorization": `Bearer ${await getCookies("token")}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to fetch bills" }))
      return {
        success: false,
        message: errorData?.message || "Failed to load bills",
        data: [],
      }
    }

    return (await response.json()) as BillResponse
  } catch (error) {
    console.error("getBills error:", error)
    return {
      success: false,
      message: "Network error. Please check your connection.",
      data: [],
    }
  }
}

export async function addBill(billData: Bill): Promise<{ success: boolean; message: string; data?: Bill }> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/bills`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        "Authorization": `Bearer ${await getCookies("token")}`,
      },
      body: JSON.stringify(billData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to add bill" }))
      return {
        success: false,
        message: errorData?.message || "Failed to add bill",
      }
    }

    const result = await response.json()
    return {
      success: true,
      message: "Bill added successfully",
      data: result.data || result,
    }
  } catch (error) {
    console.error("addBill error:", error)
    return {
      success: false,
      message: "Network error. Please check your connection.",
    }
  }
}

export default async function BillsPage() {
  const { success, message, data } = await getBills()

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Bills Management</h1>
        <a
          href="/admin/bill/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Add New Bill
        </a>
      </div>

      {!success ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{message}</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Bills</h2>
          </div>
          <div className="overflow-x-auto">
            {data.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No bills found. <a href="/admin/bill/add" className="text-blue-600 hover:underline">Add your first bill</a>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Measurement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((bill, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.customer_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.service_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.month}/{bill.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.measurement_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.usage_value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}