"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation"; // Para pegar o ID da URL
import { Navbar } from "@/components/Navbar";
import { Trophy, LayoutGrid } from "lucide-react";
import { AvatarRank } from "@/components/AvatarRank";

export default function PublicProfile() {
  const { id } = useParams(); // Pega o ID da URL (ex: /profile/XYZ123)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null); // Quem está vendo (eu)
  const [viewedProfile, setViewedProfile] = useState<any>(null); // Quem está sendo visto (outro jogador)
  const [loading, setLoading] = useState(true);

  const wins = Number(viewedProfile?.wins) || 0;
  const losses = Number(viewedProfile?.losses) || 0;
  const total = wins + losses;
  const winRate = total === 0 ? 0 : Math.round((wins / total) * 100);

  useEffect(() => {
    // 1. Verificar quem está logado (apenas para preencher a Navbar corretamente)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const myDoc = await getDoc(doc(db, "players", user.uid));
        if (myDoc.exists()) setCurrentUserProfile(myDoc.data());
      }
    });

    // 2. Buscar os dados do perfil público (baseado no ID da URL)
    const fetchPublicProfile = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "players", id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setViewedProfile(docSnap.data());
        }
      } catch (error) {
        console.error("Erro ao buscar perfil público:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
    return () => unsubscribe();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-space-900 flex items-center justify-center text-neon-blue animate-pulse">
      ACESSANDO DADOS DO SERVIDOR...
    </div>
  );

  if (!viewedProfile) return (
    <div className="min-h-screen bg-space-900 flex items-center justify-center text-white">
      Perfil não encontrado.
    </div>
  );

  return (
    <div className="min-h-screen bg-space-900 text-white pb-10">
      {/* Navbar mostra MEU perfil logado */}
      <Navbar userProfile={currentUserProfile} />

      <main className="container mx-auto px-4 pt-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Status & Profile */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card do Jogador (Público) */}
            <div className="relative bg-space-800/50 border border-space-700 p-6 rounded-xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-50 transition"> 
              <img src={viewedProfile.clanImage} className="w-full h-full object-cover" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <AvatarRank 
                    name={viewedProfile?.name} 
                    image={viewedProfile?.image} 
                    rank={viewedProfile?.rank} 
                />
                
                <div className="mt-6 flex items-center gap-3 bg-space-900/80 p-3 rounded-lg w-full border border-space-700">
                  <div className="w-8 h-8 bg-purple-900/50 rounded flex items-center justify-center">
                  <img src={viewedProfile.clanImage} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-space-400 uppercase">Clã</p>
                    <p className="text-sm font-semibold text-white">{viewedProfile.clanName || "Nenhum"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Hexagons */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-space-800/50 border border-green-500/30 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-green-500/10 transition cursor-default">
                  <span className="text-3xl font-bold text-green-400">{viewedProfile.wins || 0}</span>
                  <span className="text-xs uppercase tracking-widest text-space-400 mt-1">Vitórias</span>
               </div>
               <div className="bg-space-800/50 border border-red-500/30 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-red-500/10 transition cursor-default">
                  <span className="text-3xl font-bold text-red-400">{viewedProfile.losses || 0}</span>
                  <span className="text-xs uppercase tracking-widest text-space-400 mt-1">Derrotas</span>
               </div>
            </div>

             {/* Win Rate Bar */}
             
             <div className="bg-space-800/50 p-4 rounded-xl border border-space-700">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-space-400">Taxa de Sincronia</span>
                    <span className="text-neon-blue">{winRate}%</span>
                </div>
                <div className="h-2 bg-space-900 rounded-full overflow-hidden">
                    <div
                    className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                    style={{ width: `${winRate}%` }}
                    ></div>
                </div>
            </div>


          </div>

          {/* Center/Right Column: Deck Info (Apenas visualização) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-space-800/50 border border-space-700 rounded-xl p-1 relative overflow-hidden ">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50"></div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                      <LayoutGrid className="text-neon-purple" />
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider">Deck Principal</h3>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs text-space-400 uppercase mb-1">Arquétipo</p>
                    <div className="text-2xl font-mono text-neon-blue flex items-center gap-2">
                        {viewedProfile.deckName || "Deck Iniciante"}
                    </div>
                  </div>

                  {/* Visualização de Cartas (Seu Código) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((slot) => {
                        const cardKey = `card${slot}`;
                        const cardImage = viewedProfile?.[cardKey];

                        return (
                        <div
                            key={slot}
                            className="aspect-[2/3] bg-space-900/80 border border-space-700 rounded-lg flex items-center justify-center relative group hover:border-neon-blue transition"
                        >
                            {cardImage ? (
                            <img
                                src={cardImage}
                                alt={`Card ${slot}`}
                                className="w-full h-full object-cover rounded-lg"
                            />
                            ) : (
                            <span className="text-space-600 font-mono text-xs">
                                SLOT {slot}
                            </span>
                            )}
                        </div>
                        );
                    })}
                  </div>
                </div>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <div className="bg-gradient-to-br from-space-800 to-space-900 p-6 rounded-xl border border-space-700 flex flex-col justify-between hover:border-neon-blue/50 transition cursor-pointer group">
                    <div>
                        <div className="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center mb-4 text-neon-blue group-hover:scale-110 transition">
                            <Trophy />
                        </div>
                        <h4 className="text-lg font-bold mb-1">Ranking Global</h4>
                        <p className="text-sm text-space-400">Top duelista número: {viewedProfile?.global}</p>
                    </div>
                </div>
          </div>


          </div>

        </div>
      </main>
    </div>
  );
}