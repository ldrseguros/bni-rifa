import api from "./api";

interface NumeroRifaAdmin {
  id: number;
  numero: number;
  status: string;
  nome?: string;
  email?: string;
  telefone?: string;
  dataReserva?: string;
}

export const adminService = {
  // Obter todos os números da rifa (com detalhes administrativos)
  async getAllNumerosRifa(): Promise<NumeroRifaAdmin[]> {
    try {
      const response = await api.get<NumeroRifaAdmin[]>("/admin/numeros");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar números da rifa:", error);
      throw error;
    }
  },

  // Confirmar pagamento de um número de rifa
  async confirmarPagamento(numeroId: number): Promise<NumeroRifaAdmin> {
    try {
      const response = await api.patch<NumeroRifaAdmin>(
        `/admin/numeros/${numeroId}/confirmar-pagamento`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      throw error;
    }
  },

  // Estornar um número de rifa (devolver para disponível)
  async estornarNumero(numeroId: number): Promise<NumeroRifaAdmin> {
    try {
      const response = await api.patch<NumeroRifaAdmin>(
        `/admin/numeros/${numeroId}/estornar`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao estornar número:", error);
      throw error;
    }
  },

  // Ativar mais números de rifa (301 a 500)
  async ativarMaisNumeros(): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        "/admin/numeros/ativar-mais"
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao ativar mais números:", error);
      throw error;
    }
  },

  // Desativar números extras de rifa (301 a 500)
  async desativarNumerosExtras(): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(
        "/admin/numeros/desativar-extras"
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao desativar números extras:", error);
      throw error;
    }
  },
};
