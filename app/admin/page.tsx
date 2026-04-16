"use client"

import { useRouter } from "next/navigation";



const AdminPage = () => {
  const router = useRouter();
  router.push("/admin/profile")
}

export default AdminPage;