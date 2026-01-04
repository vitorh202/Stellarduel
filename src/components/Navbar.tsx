"use client";

import { useState, useEffect } from "react";
import { Search, LogOut  } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth"; 
import { auth } from "@/lib/firebase"; // seu setup do firebase

export function Navbar({ userProfile }: { userProfile: any }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // redireciona para a página de login
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  

  // Função de busca
  useEffect(() => {
    const fetchPlayers = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Busca jogadores cujo nome começa com o termo digitado
        // O caractere '\uf8ff' é um truque do Firebase para "range search" de strings
        function capitalizeFirst(str: string) {
            if (!str) return "";
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
          }
          
          const formattedSearch = capitalizeFirst(searchTerm);
          
          const q = query(
            collection(db, "players"),
            where("name", ">=", formattedSearch),
            where("name", "<=", formattedSearch + "\uf8ff")
          );
          

        const querySnapshot = await getDocs(q);
        const results: any[] = [];
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
        setSearchResults(results);
      } catch (error) {
        console.error("Erro na busca:", error);
      } finally {
        setIsSearching(false);
      }
    };

    // Pequeno delay para não buscar a cada letra instantaneamente (Debounce simples)
    const timeoutId = setTimeout(() => {
      fetchPlayers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <nav className="w-full h-20 bg-space-900/80 backdrop-blur-md border-b border-space-700 flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* Logo Area */}
      <Link href="/" className="flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded rotate-45 flex items-center justify-center">
          <div className="w-4 h-4 bg-space-900 rotate-[-45deg]" />
        </div>
        <span className="text-xl font-bold tracking-widest text-white hidden md:block">
          STELLAR<span className="text-neon-blue">DUEL</span>
        </span>
      </Link>

      {/* Search Bar com Dropdown */}
      <div className="flex-1 max-w-xl mx-4 relative group z-50">
        <div className="relative flex items-center bg-space-800 rounded-lg border border-space-700 focus-within:border-neon-blue transition-colors">
          <Search className="w-5 h-5 text-space-400 ml-3" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar Duelista..." 
            className="w-full bg-transparent border-none text-white px-4 py-2 focus:ring-0 placeholder-space-400 outline-none"
          />
        </div>

        {/* Dropdown de Resultados */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-2 bg-space-800 border border-space-700 rounded-lg shadow-2xl shadow-neon-blue/10 overflow-hidden flex flex-col">
            {searchResults.map((player) => (
              <div 
                key={player.id}
                onClick={() => {
                    setSearchResults([]); // Limpa a busca ao clicar
                    setSearchTerm("");
                    router.push(`/profile/${player.id}`);
                }}
                className="flex items-center gap-3 p-3 hover:bg-space-700 cursor-pointer transition border-b border-space-700/50 last:border-0"
              >
                {/* Miniatura da Imagem */}
                <div className="w-10 h-10 rounded bg-space-900 border border-space-600 overflow-hidden">
                    {player.image ? (
                        <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neon-blue font-bold text-xs">
                            {player.name.charAt(0)}
                        </div>
                    )}
                </div>
                {/* Infos */}
                <div>
                    <p className="text-sm font-bold text-white">{player.name}</p>
                    <p className="text-xs text-neon-blue">{player.rank || "Sem Rank"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Info (Logado) */}
      <div className="flex items-center gap-4">
        <button onClick={handleLogout} className="p-2 text-space-400 hover:text-white transition cursor-pointer">
          <LogOut size={20} />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-space-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{userProfile?.name || "..."}</p>
            <p className="text-xs text-neon-blue uppercase tracking-wider">{userProfile?.rank || "..."}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-neon-blue bg-space-700 overflow-hidden">
             {userProfile?.image ? (
                <img src={userProfile.image} alt="Me" className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full bg-space-800" />
             )}
          </div>
        </div>
      </div>
    </nav>
  );
}