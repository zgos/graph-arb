import React, { useState, useEffect } from 'react'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { useAddressBalance, useExchangeReserves } from '../../contexts/Balances'
import { useAddressAllowance } from '../../contexts/Allowances'
import { useWeb3React } from '../../hooks'
// import { amountFormatter, calculateGasMargin } from '../../utils'
import styled from 'styled-components'
import { Button } from '../../theme'
// import { ethers } from 'ethers'
import { amountFormatter, calculateGasMargin, isAddress, getContract } from '../../utils'
import * as constants from '../../constants'
import CANDYSTORE_ABI from '../../constants/abis/candyStore.json'
import CANDYARBER_ABI from '../../constants/abis/candyShopArber.json'
import { BigNumber } from '@uniswap/sdk'
import { ethers } from 'ethers'

const Row = styled.div`
  margin: 2rem 0 2rem 0;
  display: flex;
`

const Col = styled.div`
  width: 50%;
  margin: 0 1rem 0 1rem;
`

const Flex = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;

  button {
    max-width: 20rem;
  }
`
const TEN = new BigNumber(10)
const DECIMAL_FACTOR = TEN.pow(18)

let fetched = false
export default function Lottery({ params }) {
  const [candiesOwned, setCandiesOwned] = useState(0)
  const [candyPrice, setCandyPrice] = useState(0)
  const [drawPoolSize, setDrawPoolSize] = useState(0)
  const [committedPoolSize, setCommittedPoolSize] = useState(0)
  const [sponsorValue, setSponsorValue] = useState('')
  const [openDraw, setOpenDraw] = useState(0)
  const [outputError, setOutputError] = useState()
  const [showUnlock, setShowUnlock] = useState(false)


  const { library, account, active, chainId } = useWeb3React()
  const inputCurrency = constants.ropstenDAI
  const allowance = useAddressAllowance(account, inputCurrency, constants.CANDYSTORE_ADDRESS)
  const candyStore = getContract(constants.CANDYSTORE_ADDRESS, CANDYSTORE_ABI, library, account)
  // const candyArber = getContract(constants.CANDYARBER_ADDRESS, CANDYARBER_ABI, library)

  useEffect(() => {
    async function fetchOpenDraw() {
      const newOpenDraw = await candyStore.openDraw()
      if (newOpenDraw.toString(10) !== openDraw.toString(10)) {
        setOpenDraw(newOpenDraw)
      }
    }
    fetchOpenDraw()
  })

  const factor = ethers.utils.bigNumberify(10).pow(ethers.utils.bigNumberify(10))
  useEffect(() => {
    async function fetchDetails() {
      const [drawLottery, committedLottery, candiesOwned] = await Promise.all([
        candyStore.lottery(openDraw.toString(10)),
        candyStore.lottery((openDraw-1).toString(10)),
        candyStore.lotteryTickets(openDraw, account),
      ])

      const price = new BigNumber(drawLottery.candyPrice.toString())
      const drawPoolSize = new BigNumber(drawLottery.candyPrice.mul(drawLottery.totalCandy).toString())
      const committedPoolSize = new BigNumber(committedLottery.candyPrice.mul(committedLottery.totalCandy).toString())

      setCandiesOwned(candiesOwned)
      setCandyPrice(price.div(DECIMAL_FACTOR))
      setDrawPoolSize(drawPoolSize.div(DECIMAL_FACTOR))
      setCommittedPoolSize(committedPoolSize.div(DECIMAL_FACTOR))
    }
    fetchDetails()
  }, [openDraw])

  const inputBalance = useAddressBalance(account, inputCurrency)

  function formatBalance(value) {
    return `Balance: ${value}`
  }

  function onSponsorValueUpdate(newValue) {
    if (!sponsorValue || sponsorValue.toString(10) !== newValue.toString(10)) {
      setSponsorValue(newValue)
    }
  }

  useEffect(() => {
    if (sponsorValue && allowance) {
      if (allowance.lt(sponsorValue)) {
        setOutputError('Unlock')
        setShowUnlock(true)
      }
      return () => {
        setOutputError()
        setShowUnlock(false)
      }
    }
  }, [sponsorValue, allowance])

  async function onSponsor() {
    try {
      await candyStore.depositSponsor(
        inputCurrency,
        ethers.utils.bigNumberify(sponsorValue)
          .mul(ethers.utils.bigNumberify(10)
            .pow(ethers.utils.bigNumberify(18))
          )
      )
    } catch (e) {
      console.error('Error while sending transaction', e)
    }
  }

  return (
    <div>
      <Row>
        <Col>
          <CurrencyInputPanel
            title="Candies Owned"
            value={candiesOwned}
            disabled
            hideTokenSelect
          />
        </Col>
        <Col>
          <CurrencyInputPanel
            title="Candy Price"
            value={candyPrice}
            disabled
            selectedTokenAddress={inputCurrency}
            disableTokenSelect
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <CurrencyInputPanel
            title="Current Pool Size"
            value={drawPoolSize}
            disabled
            selectedTokenAddress={inputCurrency}
            disableTokenSelect
          />
        </Col>
        <Col>
          <CurrencyInputPanel
            title="Pool Size Committed for Interest"
            value={committedPoolSize}
            disabled
            selectedTokenAddress={inputCurrency}
            disableTokenSelect
          />
        </Col>
      </Row>
      <Row>
        <CurrencyInputPanel
          title="Sponsor Current Pool"
          value={sponsorValue}
          selectedTokenAddress={inputCurrency}
          disableTokenSelect
          extraText={inputBalance && formatBalance(amountFormatter(inputBalance, 18, 4))}
          onValueChange={onSponsorValueUpdate}
          showUnlock={showUnlock}
          sponsor={true}
        />
      </Row>
        <Flex>
          <Button onClick={onSponsor}>
            {'Sponsor'}
          </Button>
        </Flex>
    </div>
  )
}
