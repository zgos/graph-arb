import React from "react";
import "semantic-ui-css/semantic.min.css";
import "./App.css";

// hooks and services
import { createStore, StoreProvider } from "easy-peasy";
import globalStore, { IGlobalStore } from "./store/globalStore";

// components, styles and UI
import { Icon } from "semantic-ui-react";
import Stats from "./components/Stats/Stats";
import WalletInfo from "./components/Wallet/WalletInfo";
import TokenDropdown from "./components/InputFields/TokenDropdown";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FormTabs from "./components/InputFields/FormTabs";

const store = createStore<IGlobalStore>(globalStore);

function App() {
  return (
    <StoreProvider store={store}>
      <div className="App">
        <div className="form">
          <div className="form-title">
            <div className="app-title">
              EVO Markets
              <Icon name="lightning" color="yellow" />
            </div>
            <TokenDropdown />
          </div>

          {/* Input fields */}
          <FormTabs />

          <ToastContainer
            draggable={false}
            hideProgressBar
            position="bottom-right"
            autoClose={10000}
          />
        </div>

        {/* stats and wallet stuff */}
        <div className="right-pane">
          <WalletInfo />
          <Stats />
        </div>
      </div>
      <div className="tagline">
        Delegate your borrowing limit to earn more incentives
      </div>
    </StoreProvider>
  );
}

export default App;
