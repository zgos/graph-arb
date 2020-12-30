import React, { useEffect } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";

// hooks and services
import { useStoreActions, useStoreState } from "../../store/globalStore";

// components, styles and UI
import { Button } from "semantic-ui-react";

// interfaces
export interface WalletInfoProps {}

const WalletInfo: React.FunctionComponent<WalletInfoProps> = () => {
  const {
    setAccount,
    setNetwork,
    setWeb3,
    setWeb3Static,
    setConnected,
  } = useStoreActions((actions) => actions);

  const { web3, account, network, connected } = useStoreState((state) => state);

  const providerOptions = {};
  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });

  const resetApp = async () => {
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await web3Modal.clearCachedProvider();
    setAccount("");
    setWeb3(null);
    setNetwork("");
    setConnected(false);
  };

  const subscribeProvider = async (provider: any) => {
    if (!provider.on) {
      return;
    }
    provider.on("close", () => resetApp());
    provider.on("accountsChanged", async (accounts: string[]) => {
      console.log("accountChange");
      await setAccount(accounts[0]);
    });
  };

  const onConnect = async () => {
    const provider = await web3Modal.connect();
    await subscribeProvider(provider);
    const web3: any = new Web3(provider);

    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];
    const network = await web3.eth.net.getNetworkType();

    await setWeb3(web3);
    await setAccount(address);
    await setNetwork("ethereum " + network);
    await setConnected(true);
  };

  useEffect(() => {
    let _webStatic = new Web3(
      new Web3.providers.HttpProvider(
        "https://poa-kovan.gateway.pokt.network/v1/5f92020ab90218002e9cea74"
      )
    );
    setWeb3Static(_webStatic);
    if (web3Modal.cachedProvider) {
      onConnect();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="wallet-connect">
      <div>
        <div className="wallet-network">{network}</div>
        <div className="wallet-address">
          {account ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://kovan.etherscan.io/address/${account}`}
            >
              {account}
            </a>
          ) : (
            "connect to ethereum wallet"
          )}
        </div>
      </div>
      <Button
        onClick={connected ? resetApp : onConnect}
        className="submit-button"
        size="tiny"
      >
        {connected ? "disconnect" : "connect wallet"}
      </Button>
    </div>
  );
};

export default WalletInfo;
