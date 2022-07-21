import { SerializedStaking } from '@/config/constants/types';
import { getStakingAddress } from '@/utils/addressHelpers';

const stakingConfig: SerializedStaking = {
  contractAddress: getStakingAddress(),
  stakingDuration: '90 Days',
}

export default stakingConfig;
