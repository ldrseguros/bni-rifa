import React, { useState } from "react";
import { UserDetails, RaffleNumber } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumber: RaffleNumber | null;
  onSubmit: (details: UserDetails) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  selectedNumber,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNumber) return;

    if (!fullName || !phone || !email) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Email Inválido",
        description: "Por favor, insira um endereço de email válido.",
        variant: "destructive",
      });
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      toast({
        title: "Telefone Inválido",
        description: "Por favor, insira um número de telefone válido com DDD.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({ fullName, phone, email });
    setFullName("");
    setPhone("");
    setEmail("");
  };

  if (!selectedNumber) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-bni-red">
            Registrar Número {String(selectedNumber.id).padStart(3, "0")}
          </DialogTitle>
          <DialogDescription>
            Preencha seus dados para reservar o número. Após a reserva, siga as
            instruções de pagamento e envie o comprovante ao responsável do seu
            grupo épico.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Nome Completo
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="col-span-3"
                placeholder="Seu nome completo"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Telefone (WhatsApp)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="seuemail@exemplo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-bni-red hover:bg-red-700">
              Confirmar Reserva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationModal;
