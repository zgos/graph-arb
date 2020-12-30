import React, { useEffect, useState } from "react";
import statsABI from "../statsABI.json";
// import cERC20PoolABI from "../cERC20Pool.json";
import flashLoadTestABI from "../flashLoadTestABI.json";

// hooks and services
import { useStoreState, useStoreActions } from "../../store/globalStore";
import { AddressOfContract } from "../addresses";

// components, styles and UI
import { Icon, Loader } from "semantic-ui-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// interfaces
export interface StatsProps {}

const Stats: React.FunctionComponent<StatsProps> = () => {
  const { web3, web3Static, connected, account, shouldUpdate } = useStoreState(
    (state) => state
  );

  const { setShouldUpdate } = useStoreActions((action) => action);

  const [lockedAssets, setLockedAssets] = useState<string>("00.00");
  const [earnings, setEarnings] = useState<string>("");
  const [poolFee, setPoolFee] = useState<string>("");
  const [avgApy, setAvgApy] = useState<string>("");
  const [flashloanAvailable, setFlashloanAvailable] = useState<string>("");

  const handleTakeLoan = () => {
    var contractInstance = new web3.eth.Contract(
      flashLoadTestABI,
      AddressOfContract.flashloanTest
    );
    let valueInWei = "1000000000";
    contractInstance.methods
      .borrow(AddressOfContract.ctokens.dai, valueInWei, "0x")
      .send({
        from: account,
      })
      .on("transactionHash", function (hash) {
        Swal.fire(
          "Flashloan Tx pending",
          `view on <a target="_blank" rel = "noopener noreferrer" href='https://kovan.etherscan.io/tx/${hash}'>etherscan</a>`,
          "success"
        );
      })
      .on("receipt", function (receipt) {
        updateValues();
        toast(`Flashloan Transaction Confirmed (view)`, {
          onClick: () =>
            window.open(
              `https://kovan.etherscan.io/tx/${receipt.transactionHash}`
            ),
        });
      });
  };

  const updateValues = async () => {
    await getStats();
    setPoolFee("0.03%");
  };

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

  const getStats = async () => {
    let initalExchangeRate = 10 ** 18;
    let noOfBlocksInYear = 7885000;
    var contractInstance = new web3Static.eth.Contract(
      statsABI,
      AddressOfContract.stats
    );

    // var testContractInstance = new web3Static.eth.Contract(
    //   flashLoadTestABI,
    //   AddressOfContract.flashloanTest
    // );

    let pools = Object.values(AddressOfContract.ctokenPools);
    let ctokens = Object.values(AddressOfContract.ctokens);
    let data = await contractInstance.methods.getStats(pools, ctokens, AddressOfContract.flashloanTest).call();
    // let feeData = await testContractInstance.methods.feeVariable().call();
    let tlv = 0;
    let allAPY = 0;
    let fee = 0;
    // let percentage = 0.0448354
    data.forEach((a) => {
      let bal = a[1];
      let price = a[2];
      let feeData = a[5];
      tlv += (bal / 10 ** 18) * (price / 10 ** 18);
      // fee += percentage * (bal / 10 ** 18) * (price / 10 ** 18);
      fee += (feeData / 1e8) * (price / 10 ** 18);
      let diffRate = (a[0] - initalExchangeRate) / initalExchangeRate;
      let diffBlocks = a[3] - a[4];
      allAPY += (diffRate / diffBlocks) * noOfBlocksInYear;
    });
    allAPY = allAPY / data.length
    if (allAPY > 10000) {allAPY = allAPY / 1000}
    else if (allAPY > 1000) {allAPY =allAPY / 100}
    else if (allAPY > 100) {allAPY = allAPY / 10}
    setLockedAssets(String(cleanDecimal(tlv, 2)));
    setFlashloanAvailable(String(cleanDecimal(tlv * 0.75, 2)));
    setAvgApy(String(cleanDecimal(allAPY, 2)));
    setEarnings(String(cleanDecimal(fee, 4)));
  };

  useEffect(() => {
    if (connected) {
      updateValues();
    }
    // eslint-disable-next-line
  }, [connected]);

  useEffect(() => {
    if (shouldUpdate) {
      updateValues();
      setShouldUpdate(false);
    }
    // eslint-disable-next-line
  }, [shouldUpdate]);

  return (
    <div className="stats">
      <div className="stats-card">
        <div className="stat-title">
          Locked Assets
          <Icon name="lock" color="orange" />
        </div>
        <div className="stat-value">
          ${lockedAssets || <Loader inline active />}
        </div>
      </div>

      <div className="stats-card">
        <div className="stat-title">
          Earnings
          <Icon name="line graph" color="green" />
        </div>
        <div className="stat-value">
          ${earnings || <Loader inline active />}
        </div>
      </div>

      <div className="stats-card">
        <div className="stat-title">
          Pool Fee
          <Icon name="money bill alternate outline" color="blue" />
        </div>
        <div className="stat-value">{poolFee || <Loader inline active />}</div>
      </div>

      <div className="stats-card">
        <div className="stat-title">
          Avg Apy
          <Icon name="exchange" color="olive" />
        </div>
        <div className="stat-value">{avgApy || <Loader inline active />}%</div>
      </div>

      <div className="stats-card">
        <div className="stat-title">
          Flashloan avl
          <Icon name="handshake outline" color="grey" />
        </div>
        <div className="stat-value">
          ${flashloanAvailable || <Loader inline active />}
        </div>
      </div>

      <div className="stats-card takeloan" onClick={handleTakeLoan}>
        Take FlashLoan <Icon name="check" />
      </div>
    </div>
  );
};

export default Stats;
