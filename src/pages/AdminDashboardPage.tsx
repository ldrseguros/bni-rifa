import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RaffleNumber, UserDetails, PaymentMethod } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  Users,
  Settings,
  DollarSign,
  Eye,
  EyeOff,
  PlusCircle,
  Trash2,
  Edit3,
  Undo,
  Filter,
  Copy,
} from "lucide-react";
import { authService } from "@/services/authService";
import { adminService } from "@/services/adminService";

const generateMockNumbers = (
  total: number,
  initialVisible: number,
  existingRegistrations: RaffleNumber[] = []
): RaffleNumber[] => {
  const numbers: RaffleNumber[] = [];
  const registeredMap = new Map(existingRegistrations.map((r) => [r.id, r]));

  for (let i = 1; i <= total; i++) {
    if (registeredMap.has(i)) {
      numbers.push(registeredMap.get(i)!);
    } else {
      numbers.push({
        id: i,
        status: i <= initialVisible ? "available" : "unavailable",
      });
    }
  }
  return numbers.sort((a, b) => a.id - b.id); // Ensure sorted by ID
};

type FilterStatus = RaffleNumber["status"] | "all";

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allRaffleNumbers, setAllRaffleNumbers] = useState<RaffleNumber[]>([]);
  const [showExtraNumbers, setShowExtraNumbers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  // Função para converter os dados do backend para o formato usado no frontend
  const convertBackendToFrontend = (
    backendData: Array<{
      numero: number;
      status: string;
      nome?: string;
      email?: string;
      telefone?: string;
      dataReserva?: string;
    }>
  ): RaffleNumber[] => {
    return backendData.map((item) => ({
      id: item.numero,
      status:
        item.status === "disponivel"
          ? "available"
          : item.status === "reservado"
          ? "selected"
          : item.status === "confirmado"
          ? "confirmed"
          : "unavailable",
      owner: item.nome
        ? {
            fullName: item.nome,
            email: item.email || "",
            phone: item.telefone || "",
          }
        : undefined,
    }));
  };

  // Função para recarregar os números e aplicar o filtro correto
  const reloadNumbersAndApplyFilter = async (newFilter?: FilterStatus) => {
    setIsLoading(true);
    try {
      // Recarregar os números
      const response = await adminService.getAllNumerosRifa();
      const convertedData = convertBackendToFrontend(response);
      setAllRaffleNumbers(convertedData);

      // Verificar se existem números extras (301-500) ativos
      setShowExtraNumbers(
        convertedData.some((n) => n.id > 300 && n.status !== "unavailable")
      );

      // Aplicar o filtro específico se fornecido, caso contrário manter o atual
      if (newFilter !== undefined) {
        updateFilter(newFilter);
      }
    } catch (error) {
      console.error("Erro ao recarregar números:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar os números da rifa do servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para verificar autenticação e carregar dados iniciais
  useEffect(() => {
    // Verificar autenticação usando o serviço de autenticação
    if (!authService.isAuthenticated()) {
      toast({
        title: "Acesso Negado",
        description: "Faça login para acessar o painel.",
        variant: "destructive",
      });
      navigate("/admin/login");
      return;
    }

    // Função para carregar os números da rifa na inicialização
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const response = await adminService.getAllNumerosRifa();
        const convertedData = convertBackendToFrontend(response);
        setAllRaffleNumbers(convertedData);

        // Verificar se existem números extras (301-500) ativos
        setShowExtraNumbers(
          convertedData.some((n) => n.id > 300 && n.status !== "unavailable")
        );

        // Iniciar com o filtro "all"
        setActiveFilter("all");
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        toast({
          title: "Erro ao carregar dados",
          description:
            "Não foi possível buscar os números da rifa do servidor.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Carregar os dados iniciais
    loadInitialData();
  }, [navigate, toast]);

  // Obtendo números filtrados - lógica reescrita para garantir melhor funcionamento
  const getFilteredNumbers = () => {
    // Definimos uma cópia dos números para manipular
    let filtered = [...allRaffleNumbers];

    // Aplicamos o filtro de busca (searchTerm)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (num) =>
          String(num.id).padStart(3, "0").includes(term) ||
          (num.owner?.fullName || "").toLowerCase().includes(term) ||
          (num.owner?.email || "").toLowerCase().includes(term) ||
          (num.owner?.phone || "").toLowerCase().includes(term) ||
          (num.status === "confirmed"
            ? "confirmado"
            : num.status === "selected"
            ? "reservado"
            : num.status === "available"
            ? "disponível"
            : "indisponível"
          )
            .toLowerCase()
            .includes(term)
      );
    }

    // Aplicamos o filtro de status (activeFilter)
    if (activeFilter !== "all") {
      filtered = filtered.filter((num) => num.status === activeFilter);
    }

    return filtered;
  };

  // Usamos a função para obter os números filtrados
  const filteredNumbers = getFilteredNumbers();

  // Efeito para verificar os dados quando o componente montar
  useEffect(() => {
    // Verifica se há números e se o filtro está funcionando corretamente
    if (allRaffleNumbers.length > 0) {
      const logInfo = {
        total: allRaffleNumbers.length,
        disponíveis: allRaffleNumbers.filter((n) => n.status === "available")
          .length,
        reservados: allRaffleNumbers.filter((n) => n.status === "selected")
          .length,
        confirmados: allRaffleNumbers.filter((n) => n.status === "confirmed")
          .length,
        indisponíveis: allRaffleNumbers.filter(
          (n) => n.status === "unavailable"
        ).length,
        filtroAtual: activeFilter,
        filtrados: filteredNumbers.length,
      };

      console.log("Diagnóstico de dados:", logInfo);

      // Verificar números específicos para debug
      if (activeFilter === "all") {
        // Verificar números específicos
        const numero54 = allRaffleNumbers.find((n) => n.id === 54);
        if (numero54) {
          console.log("Número 54 no allRaffleNumbers:", numero54);
          console.log(
            "Número 54 está no filteredNumbers:",
            filteredNumbers.some((n) => n.id === 54) ? "SIM" : "NÃO"
          );
        }
      }

      // Se estamos com o filtro "all" e os números filtrados não correspondem ao total
      if (
        activeFilter === "all" &&
        filteredNumbers.length !== allRaffleNumbers.length
      ) {
        console.error(
          "PROBLEMA DETECTADO: O filtro 'all' não está mostrando todos os números!"
        );
        console.error(
          "Números faltando:",
          allRaffleNumbers.length - filteredNumbers.length
        );

        // Forçar a recriação da lista filtrada
        setActiveFilter("all");
      }
    }
  }, [allRaffleNumbers, filteredNumbers, activeFilter]);

  // SOLUÇÃO GARANTIDA: Exibir todos os números independentemente
  // Esta abordagem garante que o filtro "all" inclua TODOS os números
  const displayedNumbers =
    activeFilter === "all"
      ? [...allRaffleNumbers].sort((a, b) => a.id - b.id)
      : filteredNumbers;

  const handleLogout = () => {
    // Usando o serviço de autenticação para fazer logout
    authService.logout();
    toast({ title: "Logout realizado." });
    navigate("/admin/login");
  };

  const toggleExtraNumbersVisibility = async (checked: boolean) => {
    try {
      setIsLoading(true);

      // Obter contagem antes
      const numerosCont = await adminService.getAllNumerosRifa();
      const numerosDisponiveisBefore = numerosCont.filter(
        (n) => n.numero >= 301 && n.numero <= 500 && n.status === "disponivel"
      ).length;
      const numerosIndisponiveisBefore = numerosCont.filter(
        (n) => n.numero >= 301 && n.numero <= 500 && n.status === "indisponivel"
      ).length;

      console.log("Diagnóstico antes da alteração:");
      console.log(`- Números extras disponíveis: ${numerosDisponiveisBefore}`);
      console.log(
        `- Números extras indisponíveis: ${numerosIndisponiveisBefore}`
      );

      if (checked) {
        // Ativar números extras (301-500)
        console.log("Ativando números extras (301-500)...");
        const resultado = await adminService.ativarMaisNumeros();
        console.log("Resposta da API:", resultado);
        toast({
          title: "Números adicionais ativados",
          description: "Os números de 301 a 500 foram ativados com sucesso.",
        });
      } else {
        // Desativar números extras (301-500)
        console.log("Desativando números extras (301-500)...");
        const resultado = await adminService.desativarNumerosExtras();
        console.log("Resposta da API:", resultado);
        toast({
          title: "Números adicionais desativados",
          description: "Os números de 301 a 500 foram desativados com sucesso.",
        });
      }

      // Aguardar um momento para que o banco de dados seja atualizado
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Recarregar os números com diagnóstico
      console.log("Recarregando números...");
      const response = await adminService.getAllNumerosRifa();
      const convertedData = convertBackendToFrontend(response);

      // Verificar contagens após a operação
      const numerosDisponiveisAfter = response.filter(
        (n) => n.numero >= 301 && n.numero <= 500 && n.status === "disponivel"
      ).length;
      const numerosIndisponiveisAfter = response.filter(
        (n) => n.numero >= 301 && n.numero <= 500 && n.status === "indisponivel"
      ).length;

      console.log("Diagnóstico após a alteração:");
      console.log(`- Números extras disponíveis: ${numerosDisponiveisAfter}`);
      console.log(
        `- Números extras indisponíveis: ${numerosIndisponiveisAfter}`
      );

      // Atualizar o estado com os novos dados
      setAllRaffleNumbers(convertedData);

      // Verificar se existem números extras (301-500) ativos
      const extrasAtivos = convertedData.some(
        (n) => n.id > 300 && n.status === "available"
      );
      console.log("Números extras ativos:", extrasAtivos);
      setShowExtraNumbers(extrasAtivos);

      // Definir o filtro para "all" para mostrar todos
      updateFilter("all");
    } catch (error) {
      console.error("Erro ao alternar visibilidade dos números extras:", error);
      toast({
        title: "Erro",
        description:
          "Não foi possível alterar a visibilidade dos números extras.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    numberId: number,
    newStatus: RaffleNumber["status"]
  ) => {
    try {
      setIsLoading(true);

      if (newStatus === "confirmed") {
        // Confirmar pagamento
        await adminService.confirmarPagamento(numberId);
      } else if (newStatus === "available") {
        // Estornar número
        await adminService.estornarNumero(numberId);
      } else if (newStatus === "selected" || newStatus === "unavailable") {
        // Para outros status, podemos adicionar novas funções no backend e no serviço
        toast({
          title: "Funcionalidade não implementada",
          description: `A mudança para o status "${newStatus}" ainda não está implementada.`,
          variant: "destructive",
        });
        return;
      }

      // Recarregar e manter o filtro atual
      await reloadNumbersAndApplyFilter();

      // Usando objeto para mapear status, evitando problemas de tipagem com switch
      const statusTranslations: Record<RaffleNumber["status"], string> = {
        available: "Disponível",
        selected: "Reservado",
        confirmed: "Confirmado",
        unavailable: "Indisponível",
      };

      const translatedStatus = statusTranslations[newStatus] || newStatus;

      toast({
        title: `Status Atualizado`,
        description: `Número ${String(numberId).padStart(
          3,
          "0"
        )} agora está ${translatedStatus}.`,
      });
    } catch (error) {
      console.error("Erro ao alterar status do número:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do número.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservation = async (numberId: number) => {
    try {
      setIsLoading(true);

      // Estornar número usando o serviço admin
      await adminService.estornarNumero(numberId);

      // Recarregar e manter o filtro atual
      await reloadNumbersAndApplyFilter();

      toast({
        title: `Reserva Cancelada/Estornada`,
        description: `Número ${String(numberId).padStart(
          3,
          "0"
        )} agora está disponível.`,
      });
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a reserva.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar o estado do filtro quando um número mudar de status
  useEffect(() => {
    // Este efeito força uma reavaliação da lista filtrada quando:
    // - Os números da rifa são carregados ou alterados (allRaffleNumbers)
    // - O termo de busca é alterado (searchTerm)
    // - O filtro é alterado (activeFilter)

    // Não precisamos fazer nada aqui, a variável filteredNumbers
    // será recalculada automaticamente quando qualquer dependência mudar

    // Se houvesse alguma lógica adicional para preparar os dados filtrados,
    // poderíamos implementá-la aqui

    // Mostrar informações de debug no console
    console.log(
      "Números disponíveis:",
      allRaffleNumbers.filter((n) => n.status === "available").length
    );
    console.log(
      "Números reservados:",
      allRaffleNumbers.filter((n) => n.status === "selected").length
    );
    console.log(
      "Números confirmados:",
      allRaffleNumbers.filter((n) => n.status === "confirmed").length
    );
    console.log(
      "Números indisponíveis:",
      allRaffleNumbers.filter((n) => n.status === "unavailable").length
    );
    console.log("Filtro ativo:", activeFilter);
  }, [allRaffleNumbers, searchTerm, activeFilter]);

  // Função para atualizar o filtro mantendo os números atualmente filtrados
  const updateFilter = (newFilter: FilterStatus) => {
    setActiveFilter(newFilter);
    // Após alterar o filtro, voltamos para o topo da lista
    const tableContainer = document.querySelector(".overflow-x-auto");
    if (tableContainer) {
      tableContainer.scrollTop = 0;
    }
  };

  const filterOptions: { label: string; value: FilterStatus }[] = [
    { label: "Todos", value: "all" },
    { label: "Disponíveis", value: "available" },
    { label: "Reservados", value: "selected" },
    { label: "Confirmados", value: "confirmed" },
    { label: "Indisponíveis", value: "unavailable" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 md:p-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center text-bni-red">
          <Settings className="mr-2" />
          Painel Administrativo RIFA ÉPICA
        </h1>
        <div className="mt-2 sm:mt-0">
          <Link
            to="/"
            className="mr-4 text-sm text-bni-red hover:underline transition-colors"
          >
            Ver Site Público
          </Link>
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className="bg-bni-red hover:bg-red-700 text-white"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-bni-red flex items-center">
            {showExtraNumbers ? (
              <EyeOff className="mr-2" />
            ) : (
              <Eye className="mr-2" />
            )}
            Gerenciar Visibilidade (301-500)
          </h2>
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="toggle-extra-numbers"
              checked={showExtraNumbers}
              onCheckedChange={toggleExtraNumbersVisibility}
              disabled={isLoading}
            />
            <Label htmlFor="toggle-extra-numbers" className="text-gray-700">
              {showExtraNumbers
                ? "Ocultar/Tornar Indisponíveis"
                : "Liberar/Tornar Disponíveis"}{" "}
              Números 301-500
            </Label>
          </div>
          <p className="text-xs text-gray-500">
            Controla a disponibilidade manual dos números 301-500. A liberação
            automática no site público ocorre quando os números 1-300 são
            vendidos. Se um número extra já estiver vendido/reservado, esta
            chave não alterará seu status.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
          <h2 className="text-lg font-semibold text-bni-red flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Lista de Números ({displayedNumbers.length} de{" "}
            {allRaffleNumbers.length})
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs h-8 text-sm"
              disabled={isLoading}
            />
            <Select
              value={activeFilter}
              onValueChange={(value) => updateFilter(value as FilterStatus)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full sm:w-[150px] h-8 text-sm">
                <Filter className="mr-2 h-3 w-3" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bni-red"></div>
            <p className="ml-3 text-bni-red">Carregando...</p>
          </div>
        ) : displayedNumbers.length > 0 ? (
          <div className="overflow-x-auto max-h-[calc(100vh-250px)]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-600 font-semibold text-xs p-2">
                    Número
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-xs p-2">
                    Nome
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-xs p-2">
                    Telefone
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-xs p-2">
                    Email
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-xs p-2">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-xs p-2">
                    Mudar Status
                  </TableHead>
                  <TableHead className="text-gray-600 font-semibold text-xs p-2">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedNumbers.map((num) => (
                  <TableRow
                    key={num.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell className="text-gray-700 text-xs p-2">
                      {String(num.id).padStart(3, "0")}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs p-2">
                      {num.owner?.fullName || "-"}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs p-2">
                      {num.owner?.phone || "-"}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs p-2">
                      {num.owner?.email || "-"}
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs p-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          num.status === "confirmed"
                            ? "bg-bni-red text-white"
                            : num.status === "selected"
                            ? "bg-yellow-400 text-yellow-800"
                            : num.status === "available"
                            ? "bg-sky-500 text-white"
                            : "bg-gray-400 text-white" // For 'unavailable'
                        }`}
                      >
                        {num.status === "confirmed"
                          ? "Confirmado"
                          : num.status === "selected"
                          ? "Reservado"
                          : num.status === "available"
                          ? "Disponível"
                          : "Indisponível"}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs p-2">
                      <Select
                        value={num.status}
                        onValueChange={(newStatus) =>
                          handleStatusChange(
                            num.id,
                            newStatus as RaffleNumber["status"]
                          )
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-[110px] text-xs h-7">
                          <SelectValue placeholder="Mudar status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponível</SelectItem>
                          <SelectItem value="selected">Reservado</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          {(num.id > 300 || num.status === "unavailable") && (
                            <SelectItem value="unavailable">
                              Indisponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-gray-700 text-xs p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelReservation(num.id)}
                        disabled={
                          isLoading ||
                          num.status === "available" ||
                          num.status === "unavailable"
                        }
                        className="text-orange-600 border-orange-500 hover:bg-orange-50 hover:text-orange-700 disabled:text-gray-400 disabled:border-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed text-xs"
                        title="Estornar / Cancelar Reserva"
                      >
                        <Undo className="mr-1 h-3 w-3" /> Estornar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-gray-500">
            Nenhum número encontrado com os critérios de busca e filtro.
          </p>
        )}
      </div>

      <footer className="text-center mt-12 text-xs text-gray-500">
        Painel de Administração RIFA ÉPICA. Para funcionalidades completas e
        persistência de dados, a integração com Supabase é altamente
        recomendada.
      </footer>
    </div>
  );
};

export default AdminDashboardPage;
