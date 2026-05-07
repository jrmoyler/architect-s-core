import { GameProvider, useGame } from "@/store/GameStore";
import { TitleScreen } from "@/components/game/TitleScreen";
import { IntroScreen } from "@/components/game/IntroScreen";
import { HubScreen } from "@/components/game/HubScreen";
import { DivisionScreen } from "@/components/game/DivisionScreen";
import { BattleScreen } from "@/components/game/BattleScreen";
import { InventoryScreen } from "@/components/game/InventoryScreen";
import { PartyScreen } from "@/components/game/PartyScreen";
import { SettingsScreen } from "@/components/game/SettingsScreen";
import { CodexScreen } from "@/components/game/CodexScreen";
import { VictoryScreen, DefeatScreen } from "@/components/game/ResultScreens";

function Router() {
  const { state } = useGame();
  switch (state.screen) {
    case "title": return <TitleScreen />;
    case "intro": return <IntroScreen />;
    case "hub": return <HubScreen />;
    case "division": return <DivisionScreen />;
    case "battle": return <BattleScreen />;
    case "inventory": return <InventoryScreen />;
    case "party": return <PartyScreen />;
    case "settings": return <SettingsScreen />;
    case "codex": return <CodexScreen />;
    case "victory": return <VictoryScreen />;
    case "defeat": return <DefeatScreen />;
    default: return <TitleScreen />;
  }
}

const Index = () => (
  <GameProvider>
    <main className="min-h-screen">
      <Router />
    </main>
  </GameProvider>
);

export default Index;
