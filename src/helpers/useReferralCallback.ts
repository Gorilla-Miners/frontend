import { DEFAULT_GAS_LIMIT } from '@/config'
import getGasPrice from '@/utils/getGasPrice'
import { useStaking } from './useContract'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const refer = async (stakingContract, user: string, referrer: string) => {
  const gasPrice = getGasPrice()
  return stakingContract.recordReferral(user, referrer, {
    ...options,
    gasPrice,
  })
}

const useReferralCallback = () => {
  const stakingContract = useStaking()

  const handleRefer = async (user: string, referrer: string) => {
    return refer(stakingContract, user, referrer)
  }

  return { onReferUser: handleRefer }
}

export default useReferralCallback
