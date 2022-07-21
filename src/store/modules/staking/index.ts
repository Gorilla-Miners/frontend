import stakingConfig from '@/config/constants/staking';
import { SerializedStaking } from '@/config/constants/types';
import BigNumber from 'bignumber.js'
import { fetchStakingData, fetchStakingAllowance, fetchUserBalances, fetchUserDetails } from './fetchStakingData';

export interface StakingState {
  data: SerializedStaking
  userDataLoaded: boolean
}

const stakingStore = {
  state: <StakingState>{
    data: { ...stakingConfig },
    userDataLoaded: false
  },
  mutations: {
    setStakingData(state: StakingState, { data }: { data: SerializedStaking }) {
      state.data = data;
    },
    setStakingPublicData(state: StakingState, liveStakingData) {
      state.data = {
        ...state.data, ...liveStakingData
      }
    },
    updateStakingUserData(state: StakingState, payload: any) {
      const { field, value } = payload

        state.data = { ...state.data, userData: { ...state.data.userData, [field]: value } }
    },
    setStakingUserData(state: StakingState, payload: any) {
      const userData = payload;
      state.data = { ...state.data, userData: userData }
      state.userDataLoaded = true
    }
  },
  actions: {
    async fetchStakingData({ state, commit }) {
      const stakingData = await fetchStakingData();
      commit('setStakingPublicData', stakingData);
    },
    async fetchStakingUserDataAsync({ state, commit, rootState, dispatch }, account: string) {
      try {
        const [allowance, userBalance, userStakingDetails] = await Promise.all([
          fetchStakingAllowance(account),
          fetchUserBalances(account),
          fetchUserDetails(account),
        ])

        const userData = {
          allowance: allowance,
          balance: userBalance,
          ...userStakingDetails,
        }

        commit('setStakingUserData', userData);
      } catch (error) {
        console.error('[Pools Action] Error fetching pool user data', error)
      }
    }
  }
}

export default stakingStore;