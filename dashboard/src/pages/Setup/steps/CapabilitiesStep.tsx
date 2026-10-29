/**
 * Setup wizard step 3/5: recommend capability packs (experts, plugins,
 * connectors) by role so new users land in a ready-to-use workspace.
 */

import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Space,
  Tag,
  Typography,
  Tooltip,
  App,
} from "antd";
import {
  Code,
  Database,
  LineChart,
  Palette,
  Briefcase,
  PenTool,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plug,
  Users as UsersIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

interface RolePack {
  key: string;
  labelKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  color: string;
  experts: string[];
  plugins: string[];
  connectors: string[];
  suggested: boolean;
}

interface Props {
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
}

const ROLE_PACKS: RolePack[] = [
  {
    key: "developer",
    labelKey: "wizard.capabilities.roleDeveloper",
    descriptionKey: "wizard.capabilities.roleDeveloperDesc",
    icon: <Code size={28} />,
    color: "#3B82F6",
    experts: ["code-reviewer", "api-designer", "devops-engineer", "security-arch"],
    plugins: ["web-search", "habit-tracker"],
    connectors: ["github", "jira", "slack"],
    suggested: true,
  },
  {
    key: "product",
    labelKey: "wizard.capabilities.roleProduct",
    descriptionKey: "wizard.capabilities.roleProductDesc",
    icon: <Briefcase size={28} />,
    color: "#F59E0B",
    experts: ["project-manager", "data-analyst", "marketing-copywriter"],
    plugins: ["weekly-report", "habit-tracker"],
    connectors: ["notion-deep", "jira", "slack"],
    suggested: false,
  },
  {
    key: "data",
    labelKey: "wizard.capabilities.roleData",
    descriptionKey: "wizard.capabilities.roleDataDesc",
    icon: <Database size={28} />,
    color: "#10B981",
    experts: ["data-analyst", "api-designer"],
    plugins: ["web-search", "stock-watch"],
    connectors: ["google-sheets", "github", "google-workspace"],
    suggested: false,
  },
  {
    key: "designer",
    labelKey: "wizard.capabilities.roleDesigner",
    descriptionKey: "wizard.capabilities.roleDesignerDesc",
    icon: <Palette size={28} />,
    color: "#8B5CF6",
    experts: ["tech-writer", "api-designer"],
    plugins: ["color-palette", "web-search"],
    connectors: ["figma", "notion-deep", "slack"],
    suggested: false,
  },
  {
    key: "marketing",
    labelKey: "wizard.capabilities.roleMarketing",
    descriptionKey: "wizard.capabilities.roleMarketingDesc",
    icon: <PenTool size={28} />,
    color: "#EC4899",
    experts: ["marketing-copywriter", "legal-assistant", "data-analyst"],
    plugins: ["web-search", "daily-quote"],
    connectors: ["slack", "google-calendar"],
    suggested: false,
  },
  {
    key: "general",
    labelKey: "wizard.capabilities.roleGeneral",
    descriptionKey: "wizard.capabilities.roleGeneralDesc",
    icon: <Rocket size={28} />,
    color: "#6366F1",
    experts: ["ai-coding-coach", "data-analyst", "tech-writer"],
    plugins: ["web-search", "habit-tracker", "daily-english", "daily-quote"],
    connectors: ["google-workspace", "slack"],
    suggested: true,
  },
];

export default function CapabilitiesStep({ onBack, onContinue, onSkip }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const selectedPack = useMemo(
    () => ROLE_PACKS.find((p) => p.key === selectedKey) ?? null,
    [selectedKey],
  );

  const displayedPacks = expanded ? ROLE_PACKS : ROLE_PACKS.filter((p) => p.suggested);

  const handleContinue = () => {
    if (selectedPack) {
      // Persist role preference to backend preferences (fire-and-forget)
      // This is informational; experts/plugins/connectors are user-installed later.
      message.success(t("wizard.capabilities.packApplied"), 2);
    }
    onContinue();
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 8px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "#fff",
          }}
        >
          <Sparkles size={28} />
        </div>
        <Typography.Title level={4} style={{ marginBottom: 8 }}>
          {t("wizard.capabilities.title")}
        </Typography.Title>
        <Text type="secondary">{t("wizard.capabilities.subtitle")}</Text>
      </div>

      <Space
        direction="vertical"
        size={12}
        style={{ width: "100%", marginBottom: 20 }}
      >
        {displayedPacks.map((pack) => {
          const isActive = selectedKey === pack.key;
          return (
            <Card
              key={pack.key}
              hoverable
              onClick={() => setSelectedKey(pack.key)}
              style={{
                borderRadius: 14,
                border: isActive
                  ? `2px solid ${pack.color}`
                  : "1px solid var(--fn-border, #e2e8f0)",
                background: isActive
                  ? `color-mix(in srgb, ${pack.color} 6%, var(--fn-bg-card, #fff))`
                  : "var(--fn-bg-card, #fff)",
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
              styles={{ body: { padding: "16px 18px" } }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `color-mix(in srgb, ${pack.color} 14%, transparent)`,
                    color: pack.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {pack.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <Text strong style={{ fontSize: 15 }}>
                      {t(pack.labelKey)}
                    </Text>
                    {pack.suggested && (
                      <Tag color={pack.color} style={{ fontSize: 11 }}>
                        {t("wizard.capabilities.recommended")}
                      </Tag>
                    )}
                    {isActive && (
                      <CheckCircle2 size={16} color={pack.color} />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--fn-text-secondary, #64748b)",
                      lineHeight: 1.5,
                    }}
                  >
                    {t(pack.descriptionKey)}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </Space>

      {!expanded && (
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Button
            type="link"
            icon={<LineChart size={14} />}
            onClick={() => setExpanded(true)}
          >
            {t("wizard.capabilities.showAllRoles")}
          </Button>
        </div>
      )}

      {selectedPack && (
        <div
          style={{
            background: "var(--fn-bg-elevated, #f8fafc)",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 20,
            border: "1px solid var(--fn-border, #e2e8f0)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <Plug size={14} color={selectedPack.color} />
            <Text strong style={{ fontSize: 13 }}>
              {t("wizard.capabilities.includes")}
            </Text>
          </div>
          <Space size={[6, 6]} wrap>
            {selectedPack.experts.slice(0, 4).map((e) => (
              <Tooltip key={e} title={t(`wizard.capabilities.expert_${e}`, e)}>
                <Tag icon={<UsersIcon size={11} />} color="blue" style={{ fontSize: 11 }}>
                  {e}
                </Tag>
              </Tooltip>
            ))}
            {selectedPack.plugins.slice(0, 3).map((p) => (
              <Tooltip key={p} title={t(`wizard.capabilities.plugin_${p}`, p)}>
                <Tag icon={<Sparkles size={11} />} color="geekblue" style={{ fontSize: 11 }}>
                  {p}
                </Tag>
              </Tooltip>
            ))}
            {selectedPack.connectors.slice(0, 3).map((c) => (
              <Tooltip key={c} title={t(`wizard.capabilities.conn_${c}`, c)}>
                <Tag icon={<Plug size={11} />} color="purple" style={{ fontSize: 11 }}>
                  {c}
                </Tag>
              </Tooltip>
            ))}
          </Space>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Button
          icon={<ArrowLeft size={14} />}
          onClick={onBack}
          size="middle"
        >
          {t("wizard.back")}
        </Button>
        <Space>
          <Button onClick={onSkip} size="middle">
            {t("wizard.capabilities.skip")}
          </Button>
          <Button
            type="primary"
            icon={<ArrowRight size={14} />}
            onClick={handleContinue}
            size="middle"
          >
            {t("wizard.capabilities.continue")}
          </Button>
        </Space>
      </div>
    </div>
  );
}
