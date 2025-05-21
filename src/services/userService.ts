import api from "./api";

interface NumeroRifa {
  numero: number;
  status: string;
}

interface ReservaNumeroRequest {
  numero: number;
  nome: string;
  email: string;
  telefone: string;
}

interface ReservaNumeroResponse {
  numero: number;
  status: string;
  nome: string;
  email: string;
  telefone: string;
  dataReserva: string;
}

export const userService = {
  // Função para obter todos os números de rifa disponíveis para visualização pública
  async getNumerosRifa(): Promise<NumeroRifa[]> {
    try {
      const response = await api.get<NumeroRifa[]>("/api/numeros");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar números da rifa:", error);
      throw error;
    }
  },

  // Função para reservar um número da rifa
  async reservarNumero(
    dados: ReservaNumeroRequest
  ): Promise<ReservaNumeroResponse> {
    try {
      const response = await api.post<ReservaNumeroResponse>(
        "/api/reservar-numero",
        dados
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao reservar número:", error);
      throw error;
    }
  },
};
