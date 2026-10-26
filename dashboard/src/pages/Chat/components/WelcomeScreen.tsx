import { useTranslation } from "react-i18next";
import { useWelcomeQuickCardsLayout } from "../hooks/useWelcomeQuickCardsLayout";
import WelcomeQuickCards, { WelcomeQuickCardProbe } from "./WelcomeQuickCards";
import styles from "../index.module.less";

export interface WelcomeQuickCard {
  title: string;
  description: string;
  prompt: string;
  color: string;
  icon_name?: string | null;
  icon_url?: string | null;
  expertName?: string;
}

interface WelcomeScreenProps {
  onPromptClick: (text: string, options?: { prefill?: boolean }) => void;
  agentName?: string | null;
  welcomeSuffix?: string | null;
  quickCards: WelcomeQuickCard[];
  isTeam?: boolean;
}

export default function WelcomeScreen({
  onPromptClick,
  agentName,
  welcomeSuffix,
  quickCards,
  isTeam = false,
}: WelcomeScreenProps) {
  const { t } = useTranslation();
  const {
    welcomeRef,
    headingRef,
    sectionTitleRef,
    probeRef,
    expanded,
    setExpanded,
    cards,
    showToggle,
  } = useWelcomeQuickCardsLayout(quickCards);

  return (
    <div className={styles.welcome} ref={welcomeRef}>
      <div className={styles.welcomeInner}>
        <div className={styles.welcomeHeading} ref={headingRef}>
          <h1 className={styles.welcomeTitle}>
            {isTeam
              ? t("chatWelcome.teamHeading", {
                  name: agentName?.trim() || t("chatWelcome.teamNameFallback"),
                })
              : t("chatWelcome.greeting")}
          </h1>
          <p className={styles.welcomeSubtitle}>
            {isTeam ? (
              <span className={styles.welcomeSubtitleText}>
                {welcomeSuffix ?? t("chatWelcome.descriptionWithTeamSuffix")}
              </span>
            ) : agentName ? (
              <>
                <span className={styles.welcomeAgentLine}>
                  <span className={styles.welcomeAgentMention}>
                    @{agentName}
                  </span>
                </span>
                <span className={styles.welcomeSubtitleText}>
                  {welcomeSuffix ?? t("chatWelcome.descriptionWithAgentSuffix")}
                </span>
              </>
            ) : (
              t("chatWelcome.description")
            )}
          </p>
        </div>

        {quickCards.length > 0 && (
          <WelcomeQuickCards
            cards={cards}
            showToggle={showToggle}
            expanded={expanded}
            onToggle={() => setExpanded((prev) => !prev)}
            onPromptClick={onPromptClick}
            sectionTitleRef={sectionTitleRef}
          />
        )}
      </div>

      {quickCards.length > 0 && <WelcomeQuickCardProbe probeRef={probeRef} />}
    </div>
  );
}
