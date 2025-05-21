
import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ShieldCheck } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-bni-red text-bni-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
          <Ticket size={32} />
          <span>RIFA BNI</span> {/* Changed from BNI Raffle */}
        </Link>
        <nav>
          <Link to="/admin/login" className="hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1">
            <ShieldCheck size={18} />
            <span>Admin</span> {/* Kept as Admin, common term */}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

