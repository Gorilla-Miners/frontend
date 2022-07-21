import { DEFAULT_GAS_LIMIT, DEFAULT_TOKEN_DECIMAL } from '@/config'
import { BIG_TEN } from '@/utils/bigNumber'
import getGasPrice from '@/utils/getGasPrice'
import BigNumber from 'bignumber.js'
import { useStaking } from '../useContract'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const stake = async (stakingContract, amount, decimals = 18) => {
  const gasPrice = getGasPrice()
  const depositAmount = new BigNumber(amount).times(BIG_TEN.pow(decimals)).toString(10)

  return stakingContract.invest(depositAmount, {
    ...options,
    gasPrice,
  })
}

const useBUSDStaking = () => {
  const stakingContract = useStaking()

  const handleStake = async (amount: string, decimals: number) => {
    return stake(stakingContract, amount, decimals)
  }

  return { onStake: handleStake }
}

export default useBUSDStaking
