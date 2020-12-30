import React, { useState } from "react";
import AddTokens from "./AddTokens";
import AddUnderlyingTokens from "./AddUnderlyingTokens";
import WithdrawTokens from "./WithdrawTokens";

// hooks and services

// components, styles and UI

// interfaces
export interface FormTabsProps {}

const FormTabs: React.FunctionComponent<FormTabsProps> = () => {
  const [activeTab, selectActiveTab] = useState<string>("deposit");

  return (
    <>
      <div className="tabs-holder">
        <div className="tabs">
          <div
            className={`tab ${activeTab === "deposit" && "tab-active"}`}
            onClick={() => selectActiveTab("deposit")}
          >
            Add cTokens
          </div>
          <div
            className={`tab ${
              activeTab === "depositUnderlying" && "tab-active"
            }`}
            onClick={() => selectActiveTab("depositUnderlying")}
          >
            Add Underlying
          </div>
          <div
            className={`tab ${activeTab === "withdraw" && "tab-active"}`}
            onClick={() => selectActiveTab("withdraw")}
          >
            Withdraw
          </div>
        </div>
      </div>

      {activeTab === "deposit" ? (
        <AddTokens />
      ) : activeTab === "depositUnderlying" ? (
        <AddUnderlyingTokens />
      ) : (
        <WithdrawTokens />
      )}
    </>
  );
};

export default FormTabs;
