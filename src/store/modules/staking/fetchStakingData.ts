import stakingConfig from '@/config/constants/staking';
import multicall from '@/utils/multicall';
import stakingABI from '@/config/abis/staking.json';
import erc20ABI from '@/config/abis/erc20.json';
import BigNumber from 'bignumber.js';
import { serializeTokens } from '@/config/constants/tokens';

const serializedTokens = serializeTokens()

const poolInfoCalls = [{
  address: stakingConfig.contractAddress,
  name: 'totalInvestments',
  params: [],
}, {
  address: stakingConfig.contractAddress,
  name: 'totalParticipants',
  params: [],
}, {
  address: stakingConfig.contractAddress,
  name: 'contractInitializedAt',
  params: [],
}, {
  address: stakingConfig.contractAddress,
  name: 'totalPayouts',
  params: [],
}]

export const fetchStakingData = async () => {
  const poolInfo = await multicall(stakingABI, poolInfoCalls)
  const calls = [{
    address: serializedTokens.busd.address,
    name: 'balanceOf',
    params: [stakingConfig.contractAddress],
  }]
  const contractBalanceRaw = await multicall(erc20ABI, calls)
  return {
    totalInvestments: new BigNumber(poolInfo[0].toString()),
    totalParticipants: new BigNumber(poolInfo[1].toString()).toJSON(),
    contractInitializedAt: new BigNumber(poolInfo[2].toString()).toJSON(),
    totalPayouts: new BigNumber(poolInfo[3].toString()),
    contractBalance: new BigNumber(contractBalanceRaw),
  }
}

const userDetailsCalls = (account: string) => [{
  address: stakingConfig.contractAddress,
  name: 'getUserDetails',
  params: [account]
}, {
  address: stakingConfig.contractAddress,
  name: 'getReferralRewards',
  params: [account]
}, {
  address: stakingConfig.contractAddress,
  name: 'referralsCount',
  params: [account]
}, {
  address: stakingConfig.contractAddress,
  name: 'totalReferralCommissions',
  params: [account]
}];

export const fetchUserStaked = async (account) => {
  const result = await multicall(stakingABI, userDetailsCalls(account));
  const [info, reward] = result[0];

  return new BigNumber(info.amount.toString())
}

export const fetchUserDetails = async (account) => {
  const result = await multicall(stakingABI, userDetailsCalls(account));

  const [info, reward] = result[0];
  const referralReward = result[1];
  const referralsCount = result[2];
  const totalReferralCommissions = result[3];
  return {
    totalReferrals: new BigNumber(referralsCount.toString()).toJSON(),
    referralDebt: new BigNumber(info.referralDebt.toString()),
    currentLeadershipPosition: new BigNumber(info.currentLeadershipPosition.toString()).toJSON(),
    totalInvestments: new BigNumber(info.totalInvestments.toString()),
    amount: new BigNumber(info.amount.toString()),
    debt: new BigNumber(info.debt.toString()),
    totalWithdrawal: new BigNumber(info.totalWithdrawal.toString()),
    reinvestmentDeadline: new BigNumber(info.reinvestmentDeadline.toString()).toJSON(),
    lockEndTime: new BigNumber(info.lockEndTime.toString()).toJSON(),
    leadershipScore: new BigNumber(info.leadershipScore.toString()),
    totalReward: new BigNumber(reward.toString()),
    referralReward: new BigNumber(referralReward.toString()),
    referralCommission: new BigNumber(totalReferralCommissions.toString()),
  }
}

export const fetchStakingAllowance = async (account: string) => {
  const calls = [{
    address: serializedTokens.busd.address,
    name: 'allowance',
    params: [account, stakingConfig.contractAddress],
  }]

  const allowance = await multicall(erc20ABI, calls)
  return new BigNumber(allowance);
}

export const fetchUserBalances = async (account: string) => {
  const calls = [{
    address: serializedTokens.busd.address,
    name: 'balanceOf',
    params: [account],
  }]
  const tokenBalancesRaw = await multicall(erc20ABI, calls)

  return new BigNumber(tokenBalancesRaw);
}
