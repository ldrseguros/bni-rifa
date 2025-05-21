import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/authService";

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.login({
        email: email,
        senha: password,
      });

      toast({
        title: "Login Bem-sucedido",
        description: "Redirecionando para o painel...",
      });

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      let errorMessage = "Email ou senha inválidos.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Falha no Login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Link
        to="/"
        className="absolute top-4 left-4 text-bni-red hover:underline"
      >
        &larr; Voltar para Rifa
      </Link>
      <Card className="w-full max-w-md shadow-xl bg-white">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-bni-red" />
          <CardTitle className="text-2xl font-bold text-bni-red mt-2">
            Acesso Administrativo
          </CardTitle>
          <CardDescription>Faça login para gerenciar a rifa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base md:text-sm"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base md:text-sm pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-bni-red"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-bni-red hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-gray-500 text-center flex-col space-y-1 pt-4">
          <p>Sistema de autenticação para administradores da rifa.</p>
          <p>
            Não tem conta?{" "}
            <Link to="/admin/register" className="text-bni-red hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
