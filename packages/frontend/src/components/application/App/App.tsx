import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Content from "../Content/Content";
import FooterContainer from "../FooterContainer/FooterContainer";
import HeaderContainer from "../HeaderContainer/HeaderContainer";
import NavbarContainer from "../NavbarContainer/NavbarContainer";
import { AppContext } from "../../../contexts/AppContext";
import { initializeStockfish } from "../../../workers/stockfishWorker";
import useViewportHeight from "../../../hooks/useViewHeight";
import { getAuthConfig } from "../../../repository/auth/auth";
import { getAuthToken } from "../../../repository/apiClient";

const App: React.FC = (): React.ReactElement => {
  useViewportHeight();
  const [authEnabled, setAuthEnabled] = useState(false);
  const [allowDefaultUser, setAllowDefaultUser] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    initializeStockfish();
  }, []);

  useEffect(() => {
    let ignore = false;

    getAuthConfig()
      .then((config) => {
        if (!ignore) {
          setAuthEnabled(config.enabled);
          setAllowDefaultUser(config.allowDefaultUser);
          setAuthLoaded(true);
        }
      })
      .catch(() => {
        if (!ignore) {
          setAuthEnabled(false);
          setAuthLoaded(true);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (!authLoaded) {
    return <div className="p-6">Loading...</div>;
  }

  const authenticated = !authEnabled || Boolean(getAuthToken());

  return (
    <BrowserRouter>
      <AppContext>
        <div className="flex flex-col h-screen-dynamic">
          {authenticated ? <HeaderContainer authEnabled={authEnabled} /> : null}
          <div className="flex flex-col flex-grow overflow-auto h-full">
            {authenticated ? <NavbarContainer authEnabled={authEnabled} /> : null}
            <Content
              authEnabled={authEnabled}
              authenticated={authenticated}
              allowDefaultUser={allowDefaultUser}
            />
          </div>
          {authenticated ? <FooterContainer /> : null}
        </div>
      </AppContext>
    </BrowserRouter>
  );
};

export default App;
