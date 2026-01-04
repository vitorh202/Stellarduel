"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Navbar } from "@/components/Navbar";
import { PACKS_DB, PackData, CardData } from "@/lib/gameData";
import { Layers, Grid, Diamond, Filter } from "lucide-react";
import clsx from "clsx";

export default function CollectionPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activePackId, setActivePackId] = useState<string>(Object.keys(PACKS_DB)[0]); // Começa na primeira coleção
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;
      
      const docRef = doc(db, "players", currentUser.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setUserProfile(snap.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Helpers de Estilo por Raridade
  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case "lendaria": return "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] text-yellow-400";
      case "epica": return "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-purple-400";
      case "rara": return "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] text-cyan-400";
      default: return "border-space-600 text-space-400"; // Comum
    }
  };

  // Lógica para processar as cartas da aba ativa
  const getProcessedCards = () => {
    const pack = PACKS_DB[activePackId];
    if (!pack) return [];

    // Clona as cartas para não alterar o original e ORDENA POR RARIDADE
    // Ordem: Lendária > Épica > Rara > Comum
    const rarityOrder = { lendaria: 4, epica: 3, rara: 2, comum: 1 };
    
    return [...pack.cards].sort((a, b) => {
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    });
  };

  const activePack = PACKS_DB[activePackId];
  const processedCards = getProcessedCards();

  // Cálculo de Progresso (Quantas cartas únicas eu tenho dessa coleção?)
  const collectedCount = processedCards.filter(c => (userProfile?.inventory?.[c.id] || 0) > 0).length;
  const totalCards = processedCards.length;
  const progressPercent = Math.round((collectedCount / totalCards) * 100);

  if (loading) return <div className="min-h-screen bg-space-900 flex items-center justify-center text-neon-blue">CARREGANDO ARQUIVOS...</div>;

  return (
    <div className="min-h-screen bg-space-900 text-white pb-20">
      <Navbar userProfile={userProfile} />

      <main className="container mx-auto px-4 pt-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
            <Layers className="text-neon-blue" size={32} />
            <h1 className="text-3xl font-bold tracking-wide">BANCO DE DADOS (STAPLES)</h1>
        </div>

        {/* Tabs de Seleção de Pacote */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-space-700 pb-4">
            {Object.values(PACKS_DB).map((pack) => (
                <button
                    key={pack.id}
                    onClick={() => setActivePackId(pack.id)}
                    className={clsx(
                        "px-6 py-2 rounded-t-lg font-bold transition-all relative top-[1px] border-t border-x",
                        activePackId === pack.id 
                            ? "bg-space-800 border-space-600 text-neon-blue border-b-space-800" 
                            : "bg-transparent border-transparent text-space-400 hover:text-white"
                    )}
                >
                    {pack.name}
                </button>
            ))}
        </div>

        {/* Info da Coleção Atual + Barra de Progresso */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold text-white mb-1">{activePack.name}</h2>
                <p className="text-sm text-space-400">{activePack.description}</p>
            </div>
            
            <div className="bg-space-800 p-4 rounded-lg border border-space-700 w-full md:w-64">
                <div className="flex justify-between text-xs mb-2 font-bold">
                    <span className="text-space-400">COLEÇÃO COMPLETADA</span>
                    <span className="text-neon-blue">{collectedCount}/{totalCards}</span>
                </div>
                <div className="h-2 bg-space-900 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>

        {/* Grid de Cartas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {processedCards.map((card) => {
                const qty = userProfile?.inventory?.[card.id] || 0;
                const isOwned = qty > 0;
                const rarityStyle = getRarityStyles(card.rarity);

                return (
                    <div key={card.id} className="relative group perspective-1000">
                        {/* Card Container */}
                        <div className={clsx(
                            "relative aspect-[2/3] rounded-lg border-2 transition-all duration-300 overflow-hidden bg-space-800",
                            isOwned ? `${rarityStyle} hover:-translate-y-2 hover:shadow-2xl` : "border-space-700 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                        )}>
                            
                            {/* Imagem */}
                            <img 
                                src={`/img/${activePack.folder}/${card.image}`} 
                                alt={card.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay de Quantidade (Badge) */}
                            {isOwned && (
                                <div className="absolute top-2 right-2 bg-space-900/90 border border-space-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                                    x{qty}
                                </div>
                            )}

                            {/* Info Overlay (Só aparece no hover ou se não tiver a carta para saber qual é) */}
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-space-900 via-space-900/80 to-transparent p-3 pt-8 translate-y-full group-hover:translate-y-0 transition-transform">
                                <p className={clsx("text-[10px] font-bold uppercase mb-0.5", rarityStyle.split(' ')[2])}>
                                    {card.rarity}
                                </p>
                                <p className="text-sm font-bold text-white leading-tight">{card.name}</p>
                            </div>

                            {/* Overlay "Não Possui" (Cadeado opcional ou apenas visual escuro) */}
                            {!isOwned && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <span className="text-xs font-bold bg-black/80 px-2 py-1 rounded text-white border border-space-600">NÃO OBTIDA</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </main>
    </div>
  );
}