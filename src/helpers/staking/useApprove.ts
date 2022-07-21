import { Contract } from '@ethersproject/contracts'
import { MaxUint256 } from '@ethersproject/constants'
import { useCallWithGasPrice } from '../useCallWithGasPrice'
import { getStakingAddress } from '@/utils/addressHelpers'

export const useApproveStaking = (busdContract: Contract) => {
  const { callWithGasPrice } = useCallWithGasPrice()

  const handleApprove = async () => {
    return callWithGasPrice(busdContract, 'approve', [getStakingAddress(), MaxUint256])
  }

  return { handleApprove }
}