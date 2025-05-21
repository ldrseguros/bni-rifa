
export interface RaffleNumber {
  id: number;
  status: 'available' | 'selected' | 'confirmed' | 'unavailable'; // unavailable for numbers > 300 initially
  owner?: UserDetails;
}

export interface UserDetails {
  fullName: string;
  phone: string;
  email: string;
}

export interface PaymentMethod {
  id: string;
  name: string; // e.g., "Pix", "Boleto Bancário"
  details: string; // e.g., "Chave Pix: email@example.com" or bank details
  isActive: boolean;
}
