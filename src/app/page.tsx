// Ranks disponiveis para jogadores e personagens : iniciante, regular, promissor, épico , lenda, ícone, Fabula

/*
Informações necessaria para o cadastro no site:

Adicione os campos abaixo (respeite os tipos):

name (string): Nome do seu Personagem (ex: Kael).

rank (string): Lenda (ou o que quiser).

wins (number): 10.

losses (number): 2.

clanName (string): Dragon Slayers.

deckName (string): Constelação Sombria.

image (string): (Deixe em branco por enquanto ou coloque uma URL de imagem da internet).

clanImage (string): (Mesma coisa, URL ou branco). 
https://zukan.inazuma.jp/en/item/emblem/?page=2

card1 a card4 Link das cartas do deck do jogador ou Desconhecida caso não tenha aparecido ainda. 

https://i.imgur.com/5dPIrk2.png

global: Tomar cuidado só para não por numero igual. 

packs = tipo Map Dentro desse mapa, adicione:

starter: 1 (Number) -> Significa que você tem 1 pacotes do tipo Starter.

expansion1: 1 (Number).

*/

"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Layers, Swords, Trophy, Zap, LayoutGrid } from "lucide-react";
import { AvatarRank } from "@/components/AvatarRank";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null); // Dados do Auth
  const [profile, setProfile] = useState<any>(null); // Dados do Firestore
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const wins = Number(profile?.wins) || 0;
  const losses = Number(profile?.losses) || 0;
  const total = wins + losses;
  const winRate = total === 0 ? 0 : Math.round((wins / total) * 100);

  const totalPacks = profile?.packs 
  ? Object.values(profile.packs).reduce((sum: any, qty: any) => sum + (Number(qty) || 0), 0) 
  : 0;

// Se estiver carregando, mostra "..." ou 0
  const packDisplay  = loading ? "..." : String(totalPacks);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Buscar dados detalhados no Firestore
      try {
        const docRef = doc(db, "players", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          console.log("Perfil não encontrado no banco!");
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-space-900 flex items-center justify-center text-neon-blue animate-pulse">
      CONECTANDO AO SISTEMA...
    </div>
  );


  return (
    <div className="min-h-screen bg-space-900 text-white pb-10">
      <Navbar userProfile={profile} />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-8">
        
        {/* Grid Layout inspirado na imagem */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Status & Profile (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card Principal do Jogador */}
            <div className="relative bg-space-800/50 border border-space-700 p-6 rounded-xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-50 transition">
              <img src={profile.clanImage} className="w-full h-full object-cover" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
              <AvatarRank 
                  name={profile?.name} 
                  image={profile?.image} 
                  rank={profile?.rank} 
                />
                              
                {/* Clan Info */}
                <div className="mt-6 flex items-center gap-3 bg-space-900/80 p-3 rounded-lg w-full border border-space-700">
                  <div className="w-8 h-8 bg-purple-900/50 rounded flex items-center justify-center">
                  <img src={profile.clanImage} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-space-400 uppercase">Clã</p>
                    <p className="text-sm font-semibold text-white">{profile?.clanName || "Nenhum"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Hexagons (Simplificado para Cards por enquanto) */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-space-800/50 border border-green-500/30 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-green-500/10 transition cursor-default">
                  <span className="text-3xl font-bold text-green-400">{profile?.wins || 0}</span>
                  <span className="text-xs uppercase tracking-widest text-space-400 mt-1">Vitórias</span>
               </div>
               <div className="bg-space-800/50 border border-red-500/30 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-red-500/10 transition cursor-default">
                  <span className="text-3xl font-bold text-red-400">{profile?.losses || 0}</span>
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

          {/* Center/Right Column: Deck Info & Actions (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Deck Principal Section */}
            <div className="bg-space-800/50 border border-space-700 rounded-xl p-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50"></div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-2">
                        <LayoutGrid className="text-neon-purple" />
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Deck Atual</h3>
                     </div>
                      
                  </div>

                        {/* Nome do Deck */}
                        <div className="mb-6">
                          <p className="text-xs text-space-400 uppercase mb-1">Arquétipo</p>
                          <div className="text-2xl font-mono text-neon-blue flex items-center gap-2">
                              {profile?.deckName || "Deck Iniciante"}
                          </div>
                        </div>

                     {/* Visualização de Cartas (Placeholder Futurista) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((slot) => {
                        const cardKey = `card${slot}`; // monta a chave dinamicamente
                        const cardImage = profile?.[cardKey]; // acessa profile.card1, card2, etc.

                        return (
                          <div
                            key={slot}
                            className="aspect-[2/3] bg-space-900/80 border border-space-700 rounded-lg flex items-center justify-center relative group cursor-pointer hover:border-neon-blue transition"
                          >
                            <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition"></div>
                            
                            {cardImage ? (
                              <img
                                src={cardImage}
                                alt={`Card ${slot}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-space-600 font-mono text-xs group-hover:text-neon-blue">
                                SLOT {slot}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                         
                </div>
            </div>

            {/* Next Steps / Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => router.push("/packs")} className="bg-gradient-to-br from-space-800 to-space-900 p-6 rounded-xl border border-space-700 flex flex-col justify-between hover:border-neon-purple/50 transition cursor-pointer group">
                    <div>
                        <div className="w-10 h-10 bg-neon-purple/20 rounded-lg flex items-center justify-center mb-4 text-neon-purple group-hover:scale-110 transition">
                            <Zap />
                        </div>
                        <h4 className="text-lg font-bold mb-1">Abrir Pacotes</h4>
                        <p className="text-sm text-space-400">Você tem {packDisplay} pacotes disponíveis.</p>
                    </div>
                </div>


                <div 
                  onClick={() => router.push("/collection")} // <--- Link para a coleção
                  className="bg-gradient-to-br from-space-800 to-space-900 p-6 rounded-xl border border-space-700 flex flex-col justify-between hover:border-neon-blue/50 transition cursor-pointer group"
              >
                  <div>
                      <div className="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center mb-4 text-neon-blue group-hover:scale-110 transition">
                          <Layers />  
                      </div>
                      <h4 className="text-lg font-bold mb-1">Galeria de Staples</h4>
                      <p className="text-sm text-space-400">Gerencie sua coleção.</p>
                  </div>
              </div>

                <div className="bg-gradient-to-br from-space-800 to-space-900 p-6 rounded-xl border border-space-700 flex flex-col justify-between hover:border-neon-blue/50 transition cursor-pointer group">
                    <div>
                        <div className="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center mb-4 text-neon-blue group-hover:scale-110 transition">
                            <Trophy />
                        </div>
                        <h4 className="text-lg font-bold mb-1">Ranking Global</h4>
                        <p className="text-sm text-space-400">Top duelista número: {profile?.global}</p>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}