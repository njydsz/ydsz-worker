import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { MarketApp } from "./pages/MarketApp";
import { detectLocale, marketI18nResources } from "./i18n";
import "./styles/global.css";

i18n.use(initReactI18next).init({
  resources: marketI18nResources,
  lng: detectLocale(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const antdLocale = i18n.language.startsWith("zh") ? zhCN : enUS;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      }}
      locale={antdLocale}
    >
      <AntApp>
        <MarketApp />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);
