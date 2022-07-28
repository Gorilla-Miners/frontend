import { DEFAULT_GAS_LIMIT } from '@/config'
import getGasPrice from '@/utils/getGasPrice'
import { useStaking } from '../useContract'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const harvestBusd = async (stakingContract) => {
  const gasPrice = getGasPrice()

  return stakingContract.harvest({
    ...options,
    gasPrice,
  })
}


const useHarvestStakings = () => {
  const stakingContract = useStaking()

  const handleHarvest = async () => {
    return harvestBusd(stakingContract)
  }

  return { onReward: handleHarvest }
}

export default useHarvestStakings
