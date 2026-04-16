import { getCookies } from "@/helper/cookies";
import AddCustomerForm from "./form";

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

async function getServices(): Promise<Service[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/services`;
    const response = await fetch(url, {
      headers: {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        Authorization: `Bearer ${await getCookies("token")}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Gagal mengambil data service:", result.message);
      return [];
    }
    return result.data || [];
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

async function getCustomers(): Promise<Customer[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/customers`;
    const response = await fetch(url, {
      headers: {
        "APP-KEY": process.env.NEXT_PUBLIC_APP_KEY || "",
        Authorization: `Bearer ${await getCookies("token")}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Gagal mengambil data customer:", result.message);
      return [];
    }
    return result.data || [];
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export default async function AddCustomerPage() {
  const services = await getServices();
  const customers = await getCustomers();
  return <AddCustomerForm services={services} customers={customers} />;
}