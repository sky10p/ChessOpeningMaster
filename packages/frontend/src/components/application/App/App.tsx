import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Content from "../Content/Content";
import { AppContext } from "../../../contexts/AppContext";
import { initializeStockfish } from "../../../workers/stockfishWorker";
import useViewportHeight from "../../../hooks/useViewHeight";
import { getAuthConfig, getAuthSession } from "../../../repository/auth/auth";
import { AppShell } from "../AppShell/AppShell";

const App: React.FC = (): React.ReactElement => {
  useViewportHeight();
  const [authEnabled, setAuthEnabled] = useState(false);
  const [allowDefaultUser, setAllowDefaultUser] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    initializeStockfish();
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadAuthState = async () => {
      try {
        const config = await getAuthConfig();
        if (ignore) {
          return;
        }

        setAuthEnabled(config.enabled);
        setAllowDefaultUser(config.allowDefaultUser);

        if (!config.enabled) {
          setAuthenticated(true);
          setAuthLoaded(true);
          return;
        }

        const session = await getAuthSession();
        if (ignore) {
          return;
        }

        setAuthenticated(session.authenticated);
        setAuthLoaded(true);
      } catch {
        if (!ignore) {
          setAuthEnabled(false);
          setAuthenticated(true);
          setAuthLoaded(true);
        }
      }
    };

    loadAuthState();

    return () => {
      ignore = true;
    };
  }, []);

  if (!authLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <AppContext>
        <AppShell
          authEnabled={authEnabled}
          authenticated={authenticated}
          onLoggedOut={() => setAuthenticated(false)}
        >
          <Content
            authEnabled={authEnabled}
            authenticated={authenticated}
            allowDefaultUser={allowDefaultUser}
            onAuthenticated={() => setAuthenticated(true)}
          />
        </AppShell>
      </AppContext>
    </BrowserRouter>
  );
};

export default App;
