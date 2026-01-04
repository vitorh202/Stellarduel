"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Importando nossa config
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react"; // Ícones

export default function LoginPage() {
  const [characterName, setCharacterName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // TRUQUE: Cria um email falso baseado no nome para o Firebase aceitar
    // Removemos espaços e deixamos minúsculo para evitar erros de digitação
    const fakeEmail = `${characterName.trim().toLowerCase().replace(/\s+/g, '')}@stellar.duel`;

    try {
      await signInWithEmailAndPassword(auth, fakeEmail, password);
      // Se der certo, redireciona para a home (dashboard)
      router.push("/"); 
    } catch (err: any) {
      console.error(err);
      // Mensagens de erro amigáveis
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Acesso negado: Duelista não encontrado ou senha incorreta.");
      } else {
        setError("Erro ao conectar com o servidor central.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-900 text-white relative overflow-hidden">
      
      {/* Efeito de Fundo (Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-blue/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md p-8 bg-space-800/80 backdrop-blur-md border border-space-700 rounded-2xl shadow-2xl shadow-neon-blue/10">
        
        <div className="text-center mb-8">
          <img src={"img/Logo.png"} />
          <p className="text-space-400 text-sm mt-2 tracking-widest uppercase">
            Sistema de Identificação
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Input Personagem */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neon-blue uppercase tracking-wider ml-1">
              ID do Duelista
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-space-400 group-focus-within:text-neon-blue transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full bg-space-900/50 border border-space-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all placeholder-gray-600"
                placeholder="Ex: Code Master"
              />
            </div>
          </div>

          {/* Input Senha */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neon-blue uppercase tracking-wider ml-1">
              Código de Acesso
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-space-400 group-focus-within:text-neon-blue transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-space-900/50 border border-space-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all placeholder-gray-600"
                placeholder="••••••"
              />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-cyan-400 hover:to-purple-400 text-white font-bold py-3 rounded-lg shadow-lg shadow-neon-blue/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Autenticando..." : "INICIAR CONEXÃO"}
          </button>
        </form>
      </div>
    </div>
  );
}