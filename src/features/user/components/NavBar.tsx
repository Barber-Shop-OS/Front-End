import { CiBellOn } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import userProfile from "@/assets/UserNavbar/user-profile.png";
import { IoIosSearch } from "react-icons/io";

function NavBar() {
  return (
    <nav className="flex flex-row items-center justify-between p-2">
      <div className="flex flex-row items-center gap-4">
        <h1 className="text-1xl font-bold text-[#004AC6]">BarberOS</h1>
        <div className="relative">
          <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434655]" />
          <input
            type="text"
            placeholder="Buscar barbearias ou serviços..."
            className="w-[600px] rounded-[6px] border-none bg-[#F1F3FF] py-2 pl-10 pr-4 text-[#434655] placeholder-[#434655] focus:outline-none focus:ring-0 focus:ring-[#6B7280]"
          />
        </div>
      </div>

      <div className="flex flex-row items-center gap-4">
        <CiBellOn className="text-[#434655] text-2xl" />
        <IoSettingsOutline className="text-[#434655] text-2xl" />
        <img
          src={userProfile}
          alt="Avatar"
          className="h-10 w-10 rounded-full"
        />
      </div>
    </nav>
  );
}

export default NavBar;
