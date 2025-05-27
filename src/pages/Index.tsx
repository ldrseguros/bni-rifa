import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import NumberGrid from "@/components/NumberGrid";
import RegistrationModal from "@/components/RegistrationModal";
import PrizeBanner from "@/components/PrizeBanner";
import { RaffleNumber, UserDetails, PaymentMethod } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Info, Send, Copy, Smartphone } from "lucide-react"; // Added Copy and Smartphone icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert components
import { userService } from "@/services/userService";

const TOTAL_NUMBERS = 500;
const INITIAL_VISIBLE_NUMBERS = 300; // This now defines the first batch of numbers

// Updated PIX key and instruction
const PIX_KEY = "dd73882f-7d6f-4ce9-81f1-98d39ed0157d";
const PIX_INSTRUCTION =
  "Utilize esta chave Pix para realizar o pagamento da sua rifa.";

const initialPaymentMethods: PaymentMethod[] = [
  {
    id: "pix",
    name: "PIX",
    details: `Chave PIX: ${PIX_KEY}\n${PIX_INSTRUCTION}`,
    isActive: true,
  },
  {
    id: "boleto",
    name: "Boleto Bancário",
    details: "Solicitar via WhatsApp após reserva.",
    isActive: false,
  },
];

// WhatsApp details
const WHATSAPP_NUMBER = "5562991712017";
const WHATSAPP_PRESET_MESSAGE =
  "Olá, acabei de realizar o pagamento da RIFA para o sorteio ÉPICO!! Vou te enviar o comprovante para confirmar a reserva do meu número!!";

const statusMap: Record<
  string,
  "available" | "selected" | "confirmed" | "unavailable"
> = {
  disponivel: "available",
  reservado: "selected",
  confirmado: "confirmed",
};

const Index: React.FC = () => {
  const [raffleNumbers, setRaffleNumbers] = useState<RaffleNumber[]>([]);
  const [visibleRaffleNumbers, setVisibleRaffleNumbers] = useState<
    RaffleNumber[]
  >([]);
  const [selectedNumber, setSelectedNumber] = useState<RaffleNumber | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [paymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);

  // Função para carregar os números da rifa do backend
  const fetchRaffleNumbers = async () => {
    try {
      setIsLoading(true);
      const numerosRifa = await userService.getNumerosRifa();

      // Mapeando os dados do backend para o formato usado no frontend
      const numbers: RaffleNumber[] = [];

      for (let i = 1; i <= TOTAL_NUMBERS; i++) {
        // Procura o número no resultado do backend
        const numeroBackend = numerosRifa.find((n) => n.numero === i);

        if (numeroBackend) {
          // Se encontrou no backend, usa o status retornado
          const frontendStatus =
            numeroBackend.status === "disponivel"
              ? "available"
              : numeroBackend.status === "reservado"
              ? "selected"
              : numeroBackend.status === "confirmado"
              ? "confirmed"
              : "unavailable";

          numbers.push({
            id: i,
            status: frontendStatus,
          });
        } else {
          // Se não encontrou no backend, considera indisponível
          numbers.push({
            id: i,
            status: i <= INITIAL_VISIBLE_NUMBERS ? "available" : "unavailable",
          });
        }
      }

      setRaffleNumbers(numbers);
    } catch (error) {
      console.error("Erro ao buscar números da rifa:", error);
      toast({
        title: "Erro ao carregar dados",
        description:
          "Não foi possível carregar os números da rifa. Tente novamente mais tarde.",
        variant: "destructive",
      });

      // Fallback para dados locais em caso de erro
      const fallbackNumbers: RaffleNumber[] = [];
      for (let i = 1; i <= TOTAL_NUMBERS; i++) {
        fallbackNumbers.push({
          id: i,
          status: i <= INITIAL_VISIBLE_NUMBERS ? "available" : "unavailable",
        });
      }
      setRaffleNumbers(fallbackNumbers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffleNumbers();
  }, []);

  useEffect(() => {
    if (raffleNumbers.length === 0) {
      setVisibleRaffleNumbers([]);
      return;
    }

    const initialNumbers = raffleNumbers.filter(
      (n) => n.id <= INITIAL_VISIBLE_NUMBERS
    );
    const allInitialSoldOrSelected =
      initialNumbers.length > 0 &&
      initialNumbers.every(
        (n) => n.status === "selected" || n.status === "confirmed"
      );

    let currentRaffleNumbers = [...raffleNumbers]; // Operate on a copy

    if (allInitialSoldOrSelected) {
      const extraNumbersWereUnlocked = currentRaffleNumbers.some(
        (n) => n.id > INITIAL_VISIBLE_NUMBERS && n.status === "available"
      );
      let madeChanges = false;

      currentRaffleNumbers = currentRaffleNumbers.map((n) => {
        if (n.id > INITIAL_VISIBLE_NUMBERS && n.status === "unavailable") {
          madeChanges = true;
          return { ...n, status: "available" }; // Unlock them
        }
        return n;
      });

      if (madeChanges && !extraNumbersWereUnlocked) {
        // Only toast if they weren't already available
        toast({
          title: "Novos Números Liberados!",
          description: `Os números de ${
            INITIAL_VISIBLE_NUMBERS + 1
          } a ${TOTAL_NUMBERS} agora estão disponíveis.`,
        });
      }
      // If numbers were changed from 'unavailable' to 'available', update the main state
      // This comparison avoids an infinite loop if no actual change in status happened.
      if (madeChanges) {
        setRaffleNumbers(currentRaffleNumbers);
      }
    }

    // Filter for public view: only show numbers that are not 'unavailable'
    setVisibleRaffleNumbers(
      currentRaffleNumbers.filter((n) => n.status !== "unavailable")
    );
  }, [raffleNumbers, toast]);

  const handleNumberSelect = (numberId: number) => {
    // Find from the original raffleNumbers state as visibleRaffleNumbers is filtered
    const num = raffleNumbers.find((n) => n.id === numberId);
    if (num) {
      if (num.status === "available") {
        // The logic to check if extra numbers can be selected (i.e., initial batch sold)
        // is now implicitly handled because 'unavailable' extra numbers are not shown
        // until they become 'available'. So, if it's clickable, it's selectable.
        setSelectedNumber(num);
        setIsModalOpen(true);
      } else {
        let statusPt = "indisponível";
        if (num.status === "selected") statusPt = "reservado";
        else if (num.status === "confirmed") statusPt = "confirmado";
        // 'unavailable' numbers shouldn't be clickable on public page as they are hidden.
        // This toast might still be relevant if state changes rapidly or for edge cases.
        toast({
          title: "Número Indisponível",
          description: `O número ${String(num.id).padStart(
            3,
            "0"
          )} já está ${statusPt}.`,
          variant: "default",
        });
      }
    }
  };

  const handleRegistrationSubmit = async (userDetails: UserDetails) => {
    if (!selectedNumber) return;

    try {
      // Enviando a requisição para o backend
      await userService.reservarNumero({
        numero: selectedNumber.id,
        nome: userDetails.fullName,
        email: userDetails.email,
        telefone: userDetails.phone,
      });

      // Atualizando o estado local após a reserva bem-sucedida
      setRaffleNumbers((prevNumbers) =>
        prevNumbers.map((n) =>
          n.id === selectedNumber.id
            ? { ...n, status: "selected", owner: userDetails }
            : n
        )
      );

      toast({
        title: "Reserva Confirmada!",
        description: `Número ${String(selectedNumber.id).padStart(
          3,
          "0"
        )} reservado para ${
          userDetails.fullName
        }. Siga as instruções de pagamento. Envie o comprovante ao responsável do seu grupo épico. Em caso de dúvidas, fale com ele diretamente.`,
        duration: 7000,
        action: (
          <Button variant="outline" size="sm" onClick={handleWhatsAppRedirect}>
            <Smartphone className="mr-2 h-4 w-4" />
            Contatar via WhatsApp
          </Button>
        ),
      });

      setIsModalOpen(false);
      setSelectedNumber(null);

      // Recarregar os números após a reserva para garantir dados atualizados
      await fetchRaffleNumbers();
    } catch (error) {
      console.error("Erro ao reservar número:", error);
      toast({
        title: "Erro na Reserva",
        description:
          "Não foi possível reservar o número. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const activePaymentMethods = paymentMethods.filter((pm) => pm.isActive);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      toast({
        title: "Chave PIX Copiada!",
        description: "A chave PIX foi copiada para sua área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao Copiar",
        description: "Não foi possível copiar a chave PIX. Tente manualmente.",
        variant: "destructive",
      });
      console.error("Failed to copy PIX key: ", err);
    }
  };

  const handleWhatsAppRedirect = () => {
    const encodedMessage = encodeURIComponent(WHATSAPP_PRESET_MESSAGE);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-neutral-900">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 pb-24 md:pb-28">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-bni-red mb-2">
            Rifa Digital Épica
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300">
            Escolha seus números da sorte e participe!
          </p>
        </div>

        <PrizeBanner />

        <div className="bg-white dark:bg-neutral-800 p-4 md:p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-2xl font-semibold text-bni-red mb-4">
            Números Disponíveis
          </h2>
          <NumberGrid
            numbers={visibleRaffleNumbers}
            onNumberSelect={handleNumberSelect}
            selectedNumberId={selectedNumber?.id}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            <Info size={16} className="inline mr-1" />
            Números em{" "}
            <span className="font-semibold text-yellow-500">amarelo</span> estão
            reservados (aguardando pagamento). Números em{" "}
            <span className="font-semibold text-bni-red dark:text-red-400">
              vermelho
            </span>{" "}
            já foram confirmados.
          </p>
        </div>

        {activePaymentMethods.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 p-4 md:p-6 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-semibold text-bni-red mb-4">
              Instruções de Pagamento
            </h2>
            <div className="space-y-3">
              {activePaymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="p-3 border border-gray-200 dark:border-neutral-700 rounded-md"
                >
                  <p className="text-lg font-bold text-bni-red mb-4 md:text-xl">
                    Valor da Rifa: R$ 15,00
                  </p>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    {pm.name}
                  </h3>
                  {pm.id === "pix" ? (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Chave PIX:{" "}
                        <span className="font-mono bg-gray-100 dark:bg-neutral-700 px-1 rounded">
                          {PIX_KEY}
                        </span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPix}
                        className="mt-2 text-xs"
                      >
                        <Copy size={14} className="mr-2" />
                        Copiar Chave PIX
                      </Button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                        {PIX_INSTRUCTION}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {pm.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Após a reserva, realize o pagamento e envie o comprovante ao
              responsável do seu grupo épico. Em caso de dúvidas, fale com ele
              diretamente.
            </p>
          </div>
        )}

        {/* New WhatsApp communication section */}
        <div className="bg-white dark:bg-neutral-800 p-4 md:p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-2xl font-semibold text-bni-red mb-4">
            Confirme sua Participação
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Realize o pagamento na chave Pix informada e envie o comprovante
            junto com o número escolhido.
          </p>
          <Alert className="mb-4 border-bni-red/50 dark:border-bni-red/70">
            <Info className="h-5 w-5 text-bni-red" />
            <AlertTitle className="text-bni-red font-semibold">
              Atenção!
            </AlertTitle>
            <AlertDescription className="text-gray-700 dark:text-gray-300">
              Após escolher seu número, realize o pagamento via Pix na chave
              indicada acima. Em seguida, envie o comprovante e seu número
              reservado para o responsável pelo seu grupo épico via Whatsapp,
              clique no botão a seguir!!
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleWhatsAppRedirect}
            className="w-full md:w-auto bg-bni-red text-white hover:bg-bni-red/90"
            size="lg"
          >
            <Smartphone className="mr-2 h-5 w-5" />
            Enviar Comprovante via WhatsApp
          </Button>
        </div>

        {selectedNumber && (
          <RegistrationModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedNumber(null);
            }}
            selectedNumber={selectedNumber}
            onSubmit={handleRegistrationSubmit}
          />
        )}
      </main>
      <footer className="text-center p-4 bg-gray-800 dark:bg-neutral-950 text-white text-sm fixed bottom-0 left-0 right-0 z-50">
        Em caso de dúvidas, entre em contato com o responsável do seu grupo
        ÉPICO.
        <br />© {new Date().getFullYear()} Equipe Rifa Épica. Todos os direitos
        reservados.
      </footer>
    </div>
  );
};

export default Index;
