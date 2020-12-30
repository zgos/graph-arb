import React, { useState, useEffect } from "react";
import cERC20PoolABI from "../cERC20Pool.json";
// import flashLoadModuleABI from "../flashLoadModule.json";

// hooks and services
import { useStoreState, useStoreActions } from "../../store/globalStore";
import { AddressOfContract } from "../addresses";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// components, styles and UI
import { Button, Input } from "semantic-ui-react";

// interfaces
export interface AddTokensProps {}

const AddTokens: React.FunctionComponent<AddTokensProps> = () => {
  const { web3, web3Static, connected, account, selectedToken } = useStoreState(
    (state) => state
  );

  const { setShouldUpdate } = useStoreActions((action) => action);

  const [value, setValue] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  // eslint-disable-next-line
  const [isApprovedShow, setIsApprovedShow] = useState<boolean>(false);

  const handleApprove = async () => {
    let maxValue =
      "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    let token = selectedToken ? selectedToken : "dai";
    var contractInstance = new web3.eth.Contract(
      cERC20PoolABI,
      AddressOfContract.ctokens[token.toLowerCase()]
    );
    contractInstance.methods
      .approve(AddressOfContract.ctokenPools[token.toLowerCase()], maxValue)
      .send({
        from: account,
      })
      .on("transactionHash", function (hash) {
        checkAllowance();
        Swal.fire(
          "Allowance tx pending",
          `view on <a target="_blank" rel = "noopener noreferrer" href='https://kovan.etherscan.io/tx/${hash}'>etherscan</a>`,
          "success"
        );
      })
      .on("receipt", function (receipt) {
        checkAllowance();
        setIsAllowed(true);
        toast(`Allowance Transaction Confirmed (view)`, {
          onClick: () =>
            window.open(
              `https://kovan.etherscan.io/tx/${receipt.transactionHash}`
            ),
        });
      });
  };

  useEffect(() => {
    if (connected) {
      checkBalance();
      checkAllowance();
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
      AddressOfContract.ctokens[token.toLowerCase()]
    );
    let bal = await contractInstance.methods.balanceOf(account).call();
    bal = bal > 0 ? cleanDecimal(bal / 10 ** 8, 2) : 0;
    setBalance(bal);
  };
  const checkAllowance = async () => {
    let token = selectedToken ? selectedToken : "dai";
    var contractInstance = new web3Static.eth.Contract(
      cERC20PoolABI,
      AddressOfContract.ctokens[token.toLowerCase()]
    );
    let allowance = await contractInstance.methods
      .allowance(account, AddressOfContract.ctokenPools[token.toLowerCase()])
      .call();
    if (allowance > 0) {
      setIsApproved(true);
      setIsAllowed(true);
    } else {
      setIsApproved(false);
      setIsAllowed(false);
    }
  };

  const handleSubmit = () => {
    let token = selectedToken;
    if (!token) return Swal.fire("err...", "Please select token", "warning");
    if (!value) return Swal.fire("err...", "Please enter a value", "warning");
    var contractInstance = new web3.eth.Contract(
      cERC20PoolABI,
      AddressOfContract.ctokenPools[token.toLowerCase()]
    );
    let valueInWei = String((Number(value) * 10 ** 8).toFixed(0));
    contractInstance.methods
      .deposit(valueInWei)
      .send({
        from: account,
      })
      .on("transactionHash", function (hash) {
        checkAllowance();
        Swal.fire(
          "Tx pending",
          `view on <a target="_blank" rel = "noopener noreferrer" href='https://kovan.etherscan.io/tx/${hash}'>etherscan</a>`,
          "success"
        );
        setValue("");
      })
      .on("receipt", function (receipt) {
        checkBalance();
        checkAllowance();
        setShouldUpdate(true);
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
          {balance} c{selectedToken.toUpperCase()}
        </div>
      </div>
      <h4>Deposit cTokens</h4>
      <Input
        fluid
        placeholder="Amount"
        onChange={(e) => {
          setValue(e.target.value);
          if (e.target.value !== "" && e.target.value !== String(0))
            setIsApprovedShow(true);
          else setIsApprovedShow(false);
        }}
      />

      {!isApproved && (
        <>
          <br />
          <Button className="submit-button" fluid onClick={handleApprove}>
            approve cToken
          </Button>
        </>
      )}

      <br />
      <Button
        className="submit-button"
        disabled={!isAllowed}
        fluid
        onClick={handleSubmit}
      >
        deposit
      </Button>
    </div>
  );
};

export default AddTokens;
