
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

// Using a placeholder image from Unsplash. You can replace this URL with an uploaded image.
const PRIZE_IMAGE_URL = "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=1200&q=80&h=450";

const PrizeBanner: React.FC = () => {
  return (
    <Card className="mb-8 shadow-xl overflow-hidden border-2 border-amber-400/50 bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 dark:from-neutral-800/30 dark:via-neutral-900/30 dark:to-neutral-800/30">
      <div className="md:flex md:items-center">
        <div className="md:w-2/5">
          <img
            src={PRIZE_IMAGE_URL}
            alt="Prêmio: Projeto arquitetônico de uma sala"
            className="object-cover w-full h-60 md:h-72" // Adjusted height for better visibility
          />
        </div>
        <div className="md:w-3/5 p-6 py-8 md:p-8">
          <CardHeader className="p-0 pb-3 md:pb-4">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-bni-red flex items-center">
              <Award className="mr-2 md:mr-3 h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 text-amber-500" />
              <span>Prêmio Destaque!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-200">
              Projeto arquitetônico completo de uma sala – feito por especialistas.
            </p>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2">
              Transforme seu ambiente com um design exclusivo e profissional!
            </p>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default PrizeBanner;
