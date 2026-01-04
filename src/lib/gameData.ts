export interface CardData {
    id: string;
    name: string;
    rarity: "comum" | "rara" | "epica" | "lendaria";
    image: string; // Nome do arquivo na pasta
  }
  
  // Define a estrutura de um pacote
  export interface PackData {
    id: string;
    name: string;
    folder: string; // Pasta dentro de public/img/
    description: string;
    coverImage?: string;
    cards: CardData[]; // Lista de cartas possíveis nesse pacote
  }
  
  // BANCO DE DADOS DE CARTAS E PACOTES
  export const PACKS_DB: Record<string, PackData> = {
    starter: {
      id: "starter",
      name: "Starter Pack",
      folder: "starter", // As imagens devem estar em public/img/starter/
      description: "O pacote essencial para iniciar sua jornada.",
      coverImage: "starter-cover.png",
      cards: [
        { id: "st_001", name: "Augury", rarity: "rara", image: "Augury.png" },
        { id: "st_002", name: "Normal Summon", rarity: "comum", image: "Normal_Summon.png" },
        { id: "st_003", name: "Double Strike", rarity: "epica", image: "Double_Strike.png" },
        { id: "st_004", name: "Quick Thinking", rarity: "rara", image: "Quick_Thinking.png" },
        { id: "st_005", name: "Invocation damage", rarity: "epica", image: "Invocation_damage.png" },
        { id: "st_006", name: "Magic Weapon", rarity: "epica", image: "Magic_Weapon.png" },
        { id: "st_007", name: "Weak Summon", rarity: "comum", image: "Weak_Summon.png" },
        { id: "st_008", name: "Monster reborn", rarity: "lendaria", image: "Monster_reborn.png" },
        // Adicione mais cartas aqui conforme suas imagens reais...
      ]
    },
    expansion1: {
      id: "expansion1",
      name: "Nebulosa Sombria",
      folder: "nebulosa", // public/img/nebulosa/
      description: "Invoque criaturas poderosas e destrua seus inimigos.",
      coverImage: "nebulosa-cover.png",
      cards: [
        { id: "nb_001", name: "Destroy", rarity: "rara", image: "Destroy.png" },
        { id: "nb_002", name: "Pot of Greed", rarity: "epica", image: "Pot_of_greed.png" },
        { id: "nb_003", name: "Heal", rarity: "comum", image: "Heal.png" },
        { id: "nb_004", name: "Reconsider", rarity: "rara", image: "Reconsider.png" },
        { id: "nb_005", name: "Silence", rarity: "lendaria", image: "Silence.png" },
        { id: "nb_006", name: "Strong Summon", rarity: "epica", image: "Strong_Summon.png" },
        { id: "nb_007", name: "Magical hats", rarity: "comum", image: "Magical_hats.png" },
        // ...
      ]
    }
  };