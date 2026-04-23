import { deleteCookies } from "../helper/cookies";
import { SidebarMenuButton } from "./ui/sidebar";
import { LogOut } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialog
} from "./ui/alert-dialog";

export function LogoutButton() {
  const handleLogout = () => {
    deleteCookies("token");
    window.location.href = "/signin";
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <SidebarMenuButton className="text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </SidebarMenuButton>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Yaking ingin logout?</AlertDialogTitle>
          <AlertDialogDescription>
            Kamu akan keluar dari akunmu.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>
            Ya,Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
