
import React from 'react';
import { RaffleNumber } from '@/types';
import NumberGridItem from './NumberGridItem';

interface NumberGridProps {
  numbers: RaffleNumber[];
  onNumberSelect: (numberId: number) => void;
  selectedNumberId?: number | null; 
}

const NumberGrid: React.FC<NumberGridProps> = ({ numbers, onNumberSelect, selectedNumberId }) => {
  // Display all numbers passed; their status will control appearance and clickability
  const displayNumbers = numbers;

  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 md:gap-3 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg shadow">
      {displayNumbers.map((numberInfo) => (
        <NumberGridItem
          key={numberInfo.id}
          numberInfo={numberInfo}
          onClick={() => onNumberSelect(numberInfo.id)}
          isSelectedTemporary={selectedNumberId === numberInfo.id && numberInfo.status === 'available'}
        />
      ))}
    </div>
  );
};

export default NumberGrid;

