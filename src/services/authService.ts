import api from "./api";

interface LoginCredentials {
  email: string;
  senha: string;
}

interface LoginResponse {
  token: string;
}

interface CadastroResponse {
  message: string;
  token: string;
}

// Função para verificar se o token JWT está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    // Extrai a payload do token
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));

    // Verifica se o token expirou
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Erro ao verificar expiração do token:", error);
    return true; // Considera expirado em caso de erro
  }
};

export const authService = {
  // Função para fazer login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      // Armazena o token no localStorage para uso futuro
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  },

  // Função para cadastrar novo administrador
  async cadastrar(credentials: LoginCredentials): Promise<CadastroResponse> {
    try {
      const response = await api.post<CadastroResponse>(
        "/auth/cadastrar",
        credentials
      );
      // Armazena o token no localStorage para uso futuro
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      throw error;
    }
  },

  // Função para fazer logout
  logout() {
    localStorage.removeItem("token");
  },

  // Verifica se o usuário está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");

    // Retorna false se não houver token
    if (!token) return false;

    // Verifica se o token expirou
    if (isTokenExpired(token)) {
      // Remove o token expirado
      localStorage.removeItem("token");
      return false;
    }

    return true;
  },
};
