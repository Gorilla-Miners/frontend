<template>
  <Button type="button" class="btn btn-block mt-3 btn-primary cornered-btn" @click="onPresentCollect" :class="{
    'no-click': !hasEarnings,
  }" label="Harvest Earnings" v-if="hasEarnings" />
  <Dialog header="Reward Harvest" v-model:visible="displayDialog" contentClass="d-flex flex-column" dismissableMask
    modal>
    <div class="d-flex justify-content-between align-items-center mt-5 mb-5">
      <div>Harvesting:</div>
      <div class="d-flex flex-column">
        <h3>{{ formattedBalance }} BUSD</h3>
      </div>
    </div>
    <template #footer>
      <Button v-if="pendingTx" :loading="pendingTx" type="button"
        class="btn btn-block mt-3 btn-primary cornered-btn w-100" label="Confirming..." />
      <Button v-else type="button" @click="handleHarvestConfirm"
        class="btn btn-block mt-3 btn-primary cornered-btn w-100" :class="{
          'no-click': pendingTx,
        }" label="Confirm" />
    </template>
  </Dialog>
</template>
<script lang="ts">
import { Vue, mixins, Options } from "vue-class-component";
import BigNumber from "bignumber.js";
import {
  formatNumber,
  getBalanceNumber,
  getFullDisplayBalance,
} from "@/utils/formatBalance";
import useCatchTxError, { TxResponse } from "@/helpers/useCatchTxError";
import { watchEffect } from "vue";
import { SerializedStaking } from "@/config/constants/types";
import { updateUserBalance, updateUserStakedBalance, updateUserStakingDetails } from "@/helpers/staking";
import CommonMixin from "@/helpers/mixins/CommonMixin";
import useHarvestStakings from "@/helpers/staking/useHarvesting";

class Props {
  stakingData: SerializedStaking;
  isLoading?: boolean;
}

@Options({
  components: {},
  watch: {},
})
export default class HarvestAction extends mixins(Vue.with(Props), CommonMixin) {
  hasEarnings = false;
  displayDialog = false;
  pendingTx: boolean = false;

  formattedBalance = "0";

  onPresentCollect() {
    if (this.hasEarnings) {
      this.displayDialog = true;
    }
  }

  formatNumber(number: number, minPrecision = 2, maxPrecision = 2) {
    return formatNumber(number, minPrecision, maxPrecision);
  }

  async handleHarvestConfirm() {
    if (this.pendingTx) return;

    const { onReward } = useHarvestStakings();

    let tx: TxResponse = null;
    try {
      this.pendingTx = true;
      tx = await onReward();

      const receipt = await tx.wait();
      if (receipt?.status) {
        this.$store.state.toast.add({ severity: 'success', summary: 'Harvested', detail: `Your earnings have been sent to your wallet!`, life: 5000 });

        this.$store.commit('useTxToast', { txHash: tx.hash })

        const address = this.$store.state.web3.user.address;

        updateUserStakingDetails(address);
        updateUserStakedBalance(address);
        updateUserBalance(address);

        this.displayDialog = false;
      }
    } catch (err) {
      console.log(err);
      useCatchTxError(err, tx);
    } finally {
      this.pendingTx = false;
    }
  }

  mounted() {
    watchEffect(() => {
      const stakingEarnings = this.stakingData.userData.totalReward.plus(this.stakingData.userData.referralReward)
      const earningTokenBalance = getBalanceNumber(
        stakingEarnings,
        18
      );
      this.formattedBalance = formatNumber(earningTokenBalance, 2, 8);

      this.hasEarnings = new BigNumber(stakingEarnings).toNumber() > 0;
    });
  }
}
</script>
<style lang="scss" scoped>
.btn-sm {
  min-width: 30px;
  padding: 4px 16px;
  flex-grow: 1;
}

.cornered-btn {
  border-radius: 0.75rem !important;
}

.btn-primary {
  background: #fff !important;
  margin-top: 20px;
  margin-bottom: 20px;

  &:hover {
    background: #fbbd18 !important;
  }
}

.no-click {
  cursor: not-allowed;
  filter: grayscale(0.8);
}
</style>