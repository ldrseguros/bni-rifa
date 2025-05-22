import React from "react";
import { Link } from "react-router-dom";
import { Ticket, ShieldCheck } from "lucide-react";
import LogoBNI from "@/assets/Logo_BNI_Branca.svg";

const Header: React.FC = () => {
  return (
    <header className="bg-bni-red text-bni-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
          <Ticket size={30} />
          <img src={LogoBNI} alt="Logo BNI" className="w-12 h-12" />
        </Link>
        <nav>
          <Link
            to="/admin/login"
            className="hover:bg-bni-red text-bni-red px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
          >
            <ShieldCheck size={18} />
            <span>Admin</span> {/* Kept as Admin, common term */}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
