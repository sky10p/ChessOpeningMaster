import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import Content from "../Content/Content";
import FooterContainer from "../FooterContainer/FooterContainer";
import HeaderContainer from "../HeaderContainer/HeaderContainer";
import NavbarContainer from "../NavbarContainer/NavbarContainer";
import { AppContext } from "../../../contexts/AppContext";
import { initializeStockfish } from "../../../workers/stockfishWorker";

const App: React.FC = (): React.ReactElement => {
  useEffect(() => {
    initializeStockfish();
  }, []);
  return (
    <BrowserRouter>
      <AppContext>
        <div className="flex flex-col h-screen">
          <HeaderContainer />
          <div className="flex flex-col flex-grow overflow-auto h-full">
            <NavbarContainer />
            <Content />
          </div>
          <FooterContainer />
        </div>
      </AppContext>
    </BrowserRouter>
  );
};

export default App;
