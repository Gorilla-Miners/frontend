import { fetchStakingAllowance, fetchUserBalances, fetchUserDetails, fetchUserStaked } from "@/store/modules/staking/fetchStakingData";
import store from "@/store";
import { watchEffect } from "vue";

export const stakingWithUserDataLoadingSelector = () => {
  const stakingData = store.state.staking.data;
  const userDataLoaded = store.state.staking.userDataLoaded;

  return { data: stakingData, userDataLoaded }
}

export const useStaking = () => {
  const stakingWithUserDataLoading = stakingWithUserDataLoadingSelector()
  const { data, userDataLoaded } = stakingWithUserDataLoading

  return { data, userDataLoaded }
}

export const useStakingPageFetch = () => {
  store.dispatch('fetchStakingData');

  watchEffect(() => {
    const { address } = store.state.web3.user;
    if (address) {
      store.dispatch('fetchStakingUserDataAsync', address);
    }
  })
}

export const updateUserStakingAllowance =
  async (account: string) => {
    const allowances = await fetchStakingAllowance(account)
    store.commit("updateStakingUserData", { field: 'allowance', value: allowances });
  }

export const updateUserStakingDetails = async (account: string) => {
  const userStakingDetail = await fetchUserDetails(account);
  const fields = ['amount', 'currentLeadershipPosition', 'totalWithdrawal', 'debt', 'totalInvestments', 'totalWithdrawal', 'totalReward', 'referralReward'];
  fields.map((field) => {
    store.commit("updateStakingUserData", { field: field, value: userStakingDetail[field] });
  })
}

export const updateUserStakedBalance =
  async (account: string) => {
    const stakedBalance = await fetchUserStaked(account)
    store.commit('updateStakingUserData', { field: 'amount', value: stakedBalance })
  }

export const updateUserBalance =
  async (account: string) => {
    const balance = await fetchUserBalances(account)
    store.commit('updateStakingUserData', { field: 'balance', value: balance })
  }