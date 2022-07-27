<template>
  <div v-if="isStaked" class="d-flex justify-content-between align-items-center">
    <div class="d-flex justify-content-between">
      <button type="button" @click="onPresentStake" class="btn stake-btn d-flex align-items-center">
        <i class="bi bi-plus"></i> <span>add</span>
      </button>
      <button type="button" @click="onPresentUnstake" class="btn stake-btn ml-2">
        <i class="bi bi-dash"></i>
      </button>
    </div>
  </div>
  <Button v-else type="button" class="btn btn-block btn4" @click="onPresentStake"
    :label="stakingTokenBalance.gt(0) ? 'Hire Miners' : 'You have no BUSD'" />
  <StakeDialog :stakingData="stakingData" :stakingTokenBalance="stakingTokenBalance" />
  <Dialog header="Withdraw" v-model:visible="displayDialog" :breakpoints="{ '760px': '62vw', '490px': '90vw' }"
    :style="{ width: '520px' }" contentClass="d-flex flex-column" dismissableMask modal>
    <div class="d-flex justify-content-between align-items-center mt-5 mb-5">
      <div>Harvesting:</div>
      <div class="d-flex flex-column">
        <h3>{{ formattedBalance }} BUSD</h3>
      </div>
    </div>
    <p>A fee of 2.5% will be applied for withdrawals</p>
    <p>Withdrawing before the end of 30 days will result in a penalty of losing 50% of earnings(investment+ compounded
      interest).</p>
    <template #footer>
      <Button v-if="pendingTx" :loading="pendingTx" type="button" class="btn btn-block btn4 mt-3 w-100"
        label="Confirming..." />
      <Button v-else type="button" @click="confirmWithdrawal" class="btn btn-block btn4 mt-3 w-100" :class="{
        'no-click': pendingTx,
      }" label="Confirm" />
    </template>
  </Dialog>
</template>
<script lang="ts">
import { Options, Vue, mixins } from "vue-class-component";
import { SerializedStaking } from "@/config/constants/types";
import useCatchTxError, { TxResponse } from "@/helpers/useCatchTxError";
import { BigNumber } from "bignumber.js";
import StakeDialog from "../StakeDialog.vue";
import { formatNumber, getBalanceNumber } from "@/utils/formatBalance";
import { updateUserBalance, updateUserStakedBalance, updateUserStakingDetails } from "@/helpers/staking";
import CommonMixin from "@/helpers/mixins/CommonMixin";
import useWithdrawStakings from "@/helpers/staking/useWithdrawStakings";
import { watchEffect } from "vue";

class Props {
  stakingData: SerializedStaking;
  stakingTokenBalance: BigNumber;
  stakedBalance: BigNumber;
  isStaked: ConstrainBoolean;
  isLoading?: boolean;
}

@Options({
  watch: {},
  components: { StakeDialog },
})
export default class StakeActions extends mixins(Vue.with(Props), CommonMixin) {
  needsApproval: boolean = true;
  hasEarnings = false;
  displayDialog = false;
  pendingTx: boolean = false;
  stakedTokenBalance: number = null;
  formattedBalance = "0";

  async onPresentUnstake() {
    if (this.hasEarnings) {
      this.displayDialog = true;
    }
  }

  getFormattedBalanceNumber(val: number, decimals = 8) {
    var formatter = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: decimals,
    });
    return formatter.format(val);
  }

  onPresentStake() {
    if (this.stakingTokenBalance.gt(0)) {
      this.emitter.emit("shouldDisplayStakeDialog", true, false);
    }
  }

  async confirmWithdrawal() {
    if (this.pendingTx) return;

    const { onWithdraw } = useWithdrawStakings();

    let tx: TxResponse = null;
    try {
      this.pendingTx = true;
      tx = await onWithdraw();

      const receipt = await tx.wait();
      if (receipt?.status) {
        this.$store.state.toast.add({ severity: 'success', summary: 'Withdrawal Successful', detail: `Your earnings have been sent to your wallet!`, life: 5000 });

        this.$store.commit('useTxToast', { txHash: tx.hash })

        const address = this.$store.state.web3.user.address;

        updateUserStakingDetails(address);
        updateUserStakedBalance(address);
        updateUserBalance(address);

        this.displayDialog = false;
      }
      this.$store.commit('useTxToast', { txHash: tx.hash })
    } catch (err) {
      useCatchTxError(err, tx);
    } finally {
      this.pendingTx = false;
    }
  }

  mounted() {
    this.stakedTokenBalance = getBalanceNumber(this.stakedBalance, 18);

    watchEffect(() => {
      const totalEarnings = this.stakingData.userData.amount.plus(this.stakingData.userData.referralReward.plus(this.stakingData.userData.totalReward))
      const earningTokenBalance = getBalanceNumber(totalEarnings, 18);
      this.formattedBalance = formatNumber(earningTokenBalance, 2, 8);

      this.hasEarnings = totalEarnings.toNumber() > 0;
    });
  }
}
</script>
<style lang="scss">
.stake-btn {
  min-width: 20px;
  border: solid 1px #13101f !important;
  color: #fbbd18 !important;
  background: #13101f !important;
  padding: 7px 12px !important;

  i {
    font-size: 25px;
    cursor: pointer;
  }
}
</style>