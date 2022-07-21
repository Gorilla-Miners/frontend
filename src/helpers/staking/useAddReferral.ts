import { DEFAULT_GAS_LIMIT } from '@/config'
import getGasPrice from '@/utils/getGasPrice'
import { useStaking } from '../useContract'

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

const useAddReferral = () => {
  const stakingContract = useStaking()

  const handleAddReferrer = async (user: string, referrer: string) => {
    return refer(stakingContract, user, referrer)
  }

  return { onRefer: handleAddReferrer }
}

export default useAddReferral
