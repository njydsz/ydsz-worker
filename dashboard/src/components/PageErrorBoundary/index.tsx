import { Component, type ReactNode } from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import i18n from "../../i18n";

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Wrap each route in MainLayout so one bad page (malformed lazy chunk,
 * unhandled render crash) only blanks that page — not the whole shell.
 * Shows a fallback with back-home and retry actions; sidebar/nav stay intact.
 */
class PageErrorBoundaryInner extends Component<
  Props & { navigate: ReturnType<typeof useNavigate> },
  State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `[PageErrorBoundary:${this.props.pageName ?? ""}]`,
      error,
      info.componentStack,
    );
  }

  handleBackHome = () => {
    this.props.navigate("/chat", { replace: true });
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            padding: 24,
          }}
        >
          <Result
            status="warning"
            title={i18n.t("errors.pageCrashed")}
            subTitle={i18n.t("errors.pageCrashedSubtitle")}
            extra={
              <>
                <Button type="primary" onClick={this.handleBackHome}>
                  {i18n.t("errors.backHome")}
                </Button>
                <Button onClick={this.handleRetry} style={{ marginLeft: 8 }}>
                  {i18n.t("errors.retry")}
                </Button>
              </>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PageErrorBoundary({ children, pageName }: Props) {
  const navigate = useNavigate();
  return (
    <PageErrorBoundaryInner navigate={navigate} pageName={pageName}>
      {children}
    </PageErrorBoundaryInner>
  );
}
