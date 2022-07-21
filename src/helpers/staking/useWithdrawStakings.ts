import { DEFAULT_GAS_LIMIT } from '@/config'
import getGasPrice from '@/utils/getGasPrice'
import { useStaking } from '../useContract'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const withdraw = async (stakingContract) => {
  const gasPrice = getGasPrice()

  return stakingContract.withdraw({
    ...options,
    gasPrice,
  })
}


const useWithdrawStakings = () => {
  const stakingContract = useStaking()

  const handleWithdrawal = async () => {
    return withdraw(stakingContract)
  }

  return { onWithdraw: handleWithdrawal }
}

export default useWithdrawStakings
