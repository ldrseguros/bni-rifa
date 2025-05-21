import React from 'react';
import { RaffleNumber } from '@/types';
import { cn } from '@/lib/utils';

interface NumberGridItemProps {
  numberInfo: RaffleNumber;
  onClick: () => void;
  isSelectedTemporary?: boolean; // For UI feedback before confirmation
}

const NumberGridItem: React.FC<NumberGridItemProps> = ({ numberInfo, onClick, isSelectedTemporary }) => {
  const { id, status } = numberInfo;

  const baseClasses = "w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border rounded-lg shadow-sm text-base md:text-lg font-semibold cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105";
  
  let statusClasses = "";
  let isClickable = false;
  let statusPt = "indisponível";

  switch (status) {
    case 'available':
      statusClasses = "bg-bni-white text-bni-red border-bni-red hover:bg-red-50 dark:bg-neutral-700 dark:text-red-400 dark:border-red-500 dark:hover:bg-neutral-600";
      isClickable = true;
      statusPt = "disponível";
      break;
    case 'selected': // Reserved
      statusClasses = "bg-yellow-400 text-yellow-800 border-yellow-500 cursor-not-allowed dark:bg-yellow-500 dark:text-yellow-900 dark:border-yellow-600";
      statusPt = "reservado";
      break;
    case 'confirmed': // Confirmed - Now Red
      statusClasses = "bg-bni-red text-white border-red-700 dark:border-red-800 cursor-not-allowed"; // Using bni-red for background, text-white for universal white text. Border adjusted.
      statusPt = "confirmado";
      break;
    case 'unavailable': 
      // This state will primarily be seen in the admin dashboard, or if a number somehow becomes unavailable after being public.
      // Public page Index.tsx filters these out.
      statusClasses = "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-70 dark:bg-neutral-800 dark:text-neutral-500 dark:border-neutral-700";
      statusPt = "indisponível";
      break;
    default:
      statusClasses = "bg-gray-100 dark:bg-neutral-700";
  }

  if (isSelectedTemporary && status === 'available') {
    statusClasses = "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300 dark:bg-blue-600 dark:border-blue-700";
  }
  
  const handleClick = () => {
    if (isClickable) {
      onClick();
    }
  };

  const title = status === 'available' ? `Selecionar número ${String(id).padStart(3, '0')}` : `Número ${String(id).padStart(3, '0')} está ${statusPt}`;

  return (
    <div
      className={cn(baseClasses, statusClasses)}
      onClick={handleClick}
      title={title}
      aria-label={title}
      role="button"
      tabIndex={isClickable ? 0 : -1}
    >
      {String(id).padStart(3, '0')}
    </div>
  );
};

export default NumberGridItem;
