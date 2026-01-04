"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { Navbar } from "@/components/Navbar";
import { PACKS_DB, CardData } from "@/lib/gameData"; // Importa nossa config
import { Box, Sparkles, X } from "lucide-react";
import clsx from "clsx";

export default function PacksPage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Estado da animação de abertura
  const [isOpening, setIsOpening] = useState(false);
  const [openedCards, setOpenedCards] = useState<CardData[] | null>(null);

  // Carrega dados do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;
      setUser(currentUser);
      loadProfile(currentUser.uid);
    });
    return () => unsubscribe();
  }, []);

  const loadProfile = async (uid: string) => {
    const docRef = doc(db, "players", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) setUserProfile(snap.data());
  };

  // Lógica de Abrir Pacote
  const handleOpenPack = async (packId: string) => {
    if (isOpening || !user) return;
    
    // 1. Verifica se tem pacotes
    const currentPacks = userProfile?.packs?.[packId] || 0;
    if (currentPacks <= 0) {
      alert("Você não possui este pacote!");
      return;
    }

    setIsOpening(true);

    try {
      // 2. Sorteia 2 cartas (Lógica simples de RNG)
      const packData = PACKS_DB[packId];
      const pulledCards: CardData[] = [];
      
      // 2. Cria uma CÓPIA da lista de cartas disponíveis
      // Usamos uma cópia para poder remover itens dela sem estragar o banco de dados original
      let availableCardsPool = [...packData.cards];

      // Quantidade de cartas a abrir (no seu exemplo estava 2, mas geralmente são 5)
      const amountToPull = 2; 

      for (let i = 0; i < amountToPull; i++) {
        // Segurança: Se o pacote tiver menos cartas cadastradas que a quantidade de saque
        if (availableCardsPool.length === 0) break;

        // Sorteia um índice baseado no tamanho da piscina ATUAL (que diminui a cada loop)
        const randomIndex = Math.floor(Math.random() * availableCardsPool.length);
        
        // Pega a carta sorteada
        const selectedCard = availableCardsPool[randomIndex];
        pulledCards.push(selectedCard);
        
        // O PULO DO GATO: Remove a carta sorteada da piscina temporária
        // O 'splice' remove 1 item na posição 'randomIndex'
        availableCardsPool.splice(randomIndex, 1);
      }

      // 3. Atualiza Firebase
      // Decrementa pacote e Adiciona cartas ao inventário
      // inventory será um Objeto: { "card_id": quantidade }
      const playerRef = doc(db, "players", user.uid);
      
      // Prepara update do inventário (incrementa quantidade se já tiver)
      // Nota: Firestore não permite atualizar chaves dinâmicas de mapas aninhados facilmente sem ler antes
      // Para simplificar, vamos ler o inventário atual, modificar e salvar tudo.
      
      // Atualizar localmente primeiro para UX rápida
      const newInventory = { ...(userProfile.inventory ?? {}) };
      pulledCards.forEach(card => {
        newInventory[card.id] = (newInventory[card.id] || 0) + 1;
      });

      await updateDoc(playerRef, {
        [`packs.${packId}`]: increment(-1),
        inventory: newInventory
      });

      // 4. Finaliza e Mostra animação
      // Delay artificial para dar suspense
      setTimeout(() => {
        setOpenedCards(pulledCards);
        setIsOpening(false);
        loadProfile(user.uid); // Recarrega dados atualizados
      }, 1500);

    } catch (error) {
      console.error("Erro ao abrir pacote:", error);
      setIsOpening(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-900 text-white pb-10">
      <Navbar userProfile={userProfile} />

      <main className="container mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Box className="text-neon-blue" />
          ESTAÇÃO DE SUPRIMENTOS
        </h1>
        <p className="text-space-400 mb-8">Abra pacotes para expandir seu deck e dominar o jogo.</p>

        {/* Grid de Pacotes Disponíveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(PACKS_DB).map((pack) => {
            const quantity = userProfile?.packs?.[pack.id] || 0;

            return (
              <div key={pack.id} className={clsx(
                "relative bg-space-800 border-2 rounded-xl p-6 transition-all group overflow-hidden",
                quantity > 0 ? "border-neon-blue hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] cursor-pointer" : "border-space-700 opacity-50 grayscale"
              )}>
                
                {/* Visual do Pacote */}
                <div className="h-48 bg-space-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden border border-space-700 group-hover:border-neon-blue/50 transition-colors">
                    
                    {/* Se tiver imagem de capa, mostra ela */}
                    {pack.coverImage ? (
                    <img 
                        src={`/img/packs/${pack.coverImage}`} 
                        alt={pack.name}
                        className=" h-full scale-100 group-hover:scale-120 transition-transform duration-500"
                    />
                    ) : (
                    /* Caso NÃO tenha imagem, mostra o ícone padrão com fundo geométrico */
                    <>
                        <div className="absolute inset-0 bg-[url('/img/pattern.png')] opacity-20"></div>
                        <Box size={64} className={clsx("relative z-10", quantity > 0 ? "text-neon-blue" : "text-space-600")} />
                    </>
                    )}

                    {/* Um efeito de brilho por cima da imagem para ficar futurista */}
                    <div className="absolute inset-0 bg-gradient-to-t from-space-900 via-transparent to-transparent opacity-60"></div>
                </div>

                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{pack.name}</h3>
                    <span className={clsx("px-2 py-1 rounded text-xs font-bold", quantity > 0 ? "bg-neon-blue text-black" : "bg-space-700 text-space-400")}>
                        x{quantity}
                    </span>
                </div>
                
                <p className="text-sm text-space-400 mb-6 h-10">{pack.description}</p>

                <button 
                  onClick={() => handleOpenPack(pack.id)}
                  disabled={quantity === 0 || isOpening}
                  className="w-full py-3 rounded-lg font-bold uppercase tracking-widest transition-all bg-gradient-to-r from-neon-blue to-neon-purple hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOpening ? "Sincronizando..." : "ABRIR PACOTE"}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* OVERLAY DE ANIMAÇÃO / RESULTADO */}
      {(isOpening || openedCards) && (
        <div className="fixed inset-0 z-[100] bg-space-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          
          {isOpening && (
             <div className="text-center animate-pulse">
                <Box size={100} className="text-neon-blue animate-bounce mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white tracking-widest">DESCRIPTOGRAFANDO DADOS...</h2>
             </div>
          )}

          {!isOpening && openedCards && (
            <div className="w-full max-w-5xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
                        NOVOS DADOS ADQUIRIDOS
                    </h2>
                    <button onClick={() => setOpenedCards(null)} className="p-2 bg-space-800 rounded-full hover:bg-red-500/20 hover:text-red-500 transition">
                        <X size={32} />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {openedCards.map((card, idx) => (
                        <div key={idx} className="group relative aspect-[2/3] perspective-1000">
                             {/* Card Container */}
                             <div className="w-full h-full bg-space-800 rounded-lg border border-space-600 overflow-hidden relative shadow-2xl hover:scale-105 transition-transform duration-300">
                                {/* Imagem da Carta */}
                                <img 
                                    // Monta o caminho: /img/starter/guerreiro.jpg
                                    src={`/img/${Object.values(PACKS_DB).find(p => p.cards.find(c => c.id === card.id))?.folder}/${card.image}`} 
                                    alt={card.name}
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Info Overlay (Raridade) */}
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-3 pt-10">
                                    <p className={clsx(
                                        "text-xs font-bold uppercase mb-1",
                                        card.rarity === 'lendaria' ? "text-yellow-400" :
                                        card.rarity === 'epica' ? "text-purple-400" :
                                        card.rarity === 'rara' ? "text-blue-400" : "text-gray-400"
                                    )}>
                                        {card.rarity}
                                    </p>
                                    <p className="text-sm font-bold text-white leading-tight">{card.name}</p>
                                </div>

                                {/* Efeito de Brilho se for rara+ */}
                                {['lendaria', 'epica'].includes(card.rarity) && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                )}
                             </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => setOpenedCards(null)}
                    className="mt-10 mx-auto block bg-space-800 border border-neon-blue text-neon-blue px-8 py-3 rounded-full font-bold hover:bg-neon-blue hover:text-black transition"
                >
                    CONFIRMAR RECEBIMENTO
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}