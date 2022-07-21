import { ChainId } from '../config/constants/types'
import addresses from '../config/constants/contracts'
import { Address } from '../config/constants/types'
import { CHAIN_ID } from '@/config/constants/networks'
import { serializeTokens } from '@/config/constants/tokens';

const serializedTokens = serializeTokens()

export const getAddress = (address: Address): string => {
  return address[CHAIN_ID] ? address[CHAIN_ID] : address[ChainId.MAINNET]
}

export const getBusdAddress = () => {
  return serializedTokens.busd.address;
}

export const getStakingAddress = () => {
  return getAddress(addresses.staking)
}

export const getMulticallAddress = () => {
  return getAddress(addresses.multiCall);
}

