import * as React from "react";
import * as ReactDOM from "react-dom";
import { RepertoireList } from "./components/RepertoireList";
import { RepertoireActions } from "./components/RepertoireActions";
import { OpeningTable } from "./components/OpeningTable";
import "./styles.css";

const App: React.FC = (): React.ReactElement => {
  return (
    <div>
      <header>
        <h1>Chess Opening Master</h1>
      </header>
      <nav>
        <RepertoireList />
        <RepertoireActions />
      </nav>
      <main className="main">
        <OpeningTable />
      </main>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
