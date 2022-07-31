import BigNumber from 'bignumber.js'

export enum FetchStatus {
  Idle = 'IDLE',
  Fetching = 'FETCHING',
  Fetched = 'FETCHED',
  Failed = 'FAILED',
}

export enum GAS_PRICE {
  default = '5',
  fast = '6',
  instant = '7',
  testnet = '10',
}

export interface Address {
  97?: string
  56: string
}

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
  projectLink?: string
}

export interface SerializedStaking {
  contractAddress: string;
  totalInvestments?: BigNumber
  totalParticipants?: string
  totalPayouts?: BigNumber
  contractBalance?: BigNumber;
  stakingDuration: string
  contractInitializedAt?: string
  userData?: {
    totalReferrals: string;
    allowance: BigNumber
    currentLeadershipPosition: string
    referralDebt: BigNumber
    balance: BigNumber
    totalInvestments: BigNumber
    amount: BigNumber
    debt: BigNumber
    totalWithdrawal: BigNumber
    reinvestmentDeadline: string
    lockEndTime: string
    leadershipScore: BigNumber;
    totalReward: BigNumber;
    referralReward: BigNumber;
    referralCommission: BigNumber;
  }
}

export interface SerializedStakingPoolState {
  data: SerializedStaking[]
  userDataLoaded: boolean
}

export enum ChainId {
  MAINNET = 56,
  TESTNET = 97,
}

export type SerializedBigNumber = string