import React, { useState, useEffect } from "react";
import cERC20PoolABI from "../cERC20Pool.json";

// hooks and services
import { useStoreActions, useStoreState } from "../../store/globalStore";
import { AddressOfContract } from "../addresses";

// components, styles and UI
import { Button, Input } from "semantic-ui-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// interfaces
export interface WithdrawTokensProps {}

const WithdrawTokens: React.FunctionComponent<WithdrawTokensProps> = () => {
  const { web3, web3Static, connected, account, selectedToken } = useStoreState(
    (state) => state
  );

  const { setShouldUpdate } = useStoreActions((action) => action);

  const [value, setValue] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const [balance, setBalance] = useState<string>("0");

  useEffect(() => {
    if (connected) {
      checkBalance();
    }
    // eslint-disable-next-line
  }, [connected]);

  function cleanDecimal(num, power) {
    let MUL_DIV = 100;
    if (power || power === 0) {
      MUL_DIV = 10 ** power;
    } else {
      if (num < 0.01) MUL_DIV = 10 ** 6;
      if (num < 1) MUL_DIV = 10 ** 4;
    }
    return Math.floor(Number(num) * MUL_DIV) / MUL_DIV;
  }
  const checkBalance = async () => {
    let token = selectedToken ? selectedToken : "dai";
    var contractInstance = new web3Static.eth.Contract(
      cERC20PoolABI,
      AddressOfContract.ctokenPools[token.toLowerCase()]
    );
    let bal = await contractInstance.methods.balanceOf(account).call();
    bal = bal > 0 ? cleanDecimal(bal / 10 ** 8, 2) : 0;
    setBalance(bal);
  };

  const handleSubmit = () => {
    let token = selectedToken;
    if (!token) return Swal.fire("err...", "Please select token", "warning");
    if (!value) return Swal.fire("err...", "Please enter a value", "warning");
    if (!address)
      return Swal.fire(
        "err...",
        "Please enter a address to withdraw token",
        "warning"
      );
    var contractInstance = new web3.eth.Contract(
      cERC20PoolABI,
      AddressOfContract.ctokenPools[token.toLowerCase()]
    );
    let valueInWei = String((Number(value) * 10 ** 8).toFixed(0));
    contractInstance.methods
      .withdraw(valueInWei, address)
      .send({
        from: account,
      })
      .on("transactionHash", function (hash) {
        Swal.fire(
          "Tx pending",
          `view on <a target="_blank" rel = "noopener noreferrer" href='https://kovan.etherscan.io/tx/${hash}'>etherscan</a>`,
          "success"
        );
        setValue("");
      })
      .on("receipt", function (receipt) {
        setShouldUpdate(true);
        checkBalance();
        toast(`Transaction Confirmed (view)`, {
          onClick: () =>
            window.open(
              `https://kovan.etherscan.io/tx/${receipt.transactionHash}`
            ),
        });
      });
  };

  return (
    <div className="entry-form">
      <div className="balance">
        <h4>BALANCE</h4>
        <div className="balance-value">
          {balance} f{selectedToken.toUpperCase()}
        </div>
      </div>
      <h4>Withdraw cTokens</h4>
      <Input
        className="input-field"
        fluid
        placeholder="Amount"
        onChange={(e) => setValue(e.target.value)}
      />
      <br />
      <Input
        fluid
        placeholder="Address"
        onChange={(e) => setAddress(e.target.value)}
      />
      <br />
      <Button className="submit-button" fluid onClick={handleSubmit}>
        withdraw
      </Button>
    </div>
  );
};

export default WithdrawTokens;
