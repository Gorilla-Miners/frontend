<template>
  <Dialog header="Start Mining" v-model:visible="displayDialog" :breakpoints="{ '760px': '62vw', '490px': '90vw' }"
    :style="{ width: '520px' }" contentClass="d-flex flex-column pb-3" dismissableMask modal>
    <div class="d-flex justify-content-between mb-2">
      <strong>Start mining BUSD: </strong>
      <div class="d-flex align-items-center">
        <img class="item sq-2 rounded-circle" src="/images/busd.png" alt="BUSD" />
        <span class="ml-2">BUSD</span>
      </div>
    </div>
    <div class="token-input mb-3">
      <div class="d-flex flex-column align-items-end mt-3">
        <InputNumber @input="handleStakeInputChange($event)" inputClass="border-0 p-0 text-right no-bg" mode="decimal"
          :minFractionDigits="2" :maxFractionDigits="18" :max="79" :modelValue="stakeAmount" />
      </div>
    </div>
    <div class="jfPlkw" v-if="userNotEnoughToken">
      Insufficient BUSD
    </div>
    <div class="text-right">
      {{ `Bal: ${getFullDisplayBalance(getCalculatedStakingLimit(), 18)}` }}
    </div>

    <div class="d-flex justify-content-between mt-5">
      <button class="btn btn-sm btn-default cornered-btn mx-2" @click="handleChangePercent(25)">
        25%
      </button>
      <button class="btn btn-sm btn-default cornered-btn mx-2" @click="handleChangePercent(50)">
        50%
      </button>
      <button class="btn btn-sm btn-default cornered-btn mx-2" @click="handleChangePercent(75)">
        75%
      </button>
      <button class="btn btn-sm btn-default cornered-btn mx-2" @click="handleChangePercent(100)">
        Max
      </button>
    </div>

    <div class="d-flex justify-content-between mt-3 mb-3" v-if="!isRemovingStake">
      <span>APR at current rates(minus admin fee):</span>
      <span v-if="annualRoi > 0">{{ formatNumber(annualRoi, 2, 6) }} BUSD</span>
      <span v-else>_</span>
    </div>
    <div class="jfPlkw2">
      A 5 dollar fee will be deducted as admin fee
    </div>
    <template #footer>
      <Button v-if="pendingTx" :loading="pendingTx" type="button" class="btn btn-block btn4 mt-3 w-100"
        label=" Confirming..." />
      <Button v-else type="button" @click="handleConfirmClick" class="btn btn-block btn4 mt-3 w-100" :class="{
        'no-click':
          !stakeAmount || parseFloat(stakeAmount) === 0 || userNotEnoughToken,
      }" label="Confirm" />
    </template>
  </Dialog>
</template>
<script lang="ts">
import { Options, Vue, mixins } from "vue-class-component";
import { SerializedStaking } from "@/config/constants/types";
import { BigNumber } from "bignumber.js";
import {
  getDecimalAmount,
  getFullDisplayBalance,
  formatNumber,
} from "@/utils/formatBalance";
import { watchEffect } from "vue";
import useCatchTxError from "@/helpers/useCatchTxError";
import { TxResponse } from "@/helpers/useCatchTxError";
import useBUSDStaking from "@/helpers/staking/useBUSDStaking";
import { updateUserBalance, updateUserStakedBalance, updateUserStakingDetails } from "@/helpers/staking";
import CommonMixin from "@/helpers/mixins/CommonMixin";

class Props {
  stakingData: SerializedStaking;
  stakingTokenBalance: BigNumber;
}

@Options({
  watch: {},
  components: {},
})
export default class StakeDialog extends mixins(Vue.with(Props), CommonMixin) {
  displayDialog = false;
  userNotEnoughToken: boolean = false;
  pendingTx: boolean = false;
  isRemovingStake = false;

  fullDecimalStakeAmount: BigNumber = new BigNumber(0);
  BigNumber = BigNumber;

  percent = 0;

  stakeAmount = "";

  annualRoi = null;

  formatNumber(number: number, minPrecision = 2, maxPrecision = 2) {
    return formatNumber(number, minPrecision, maxPrecision);
  }

  getFullDisplayBalance(
    balance: BigNumber,
    decimals = 18,
    displayDecimals?: number
  ) {
    return getFullDisplayBalance(balance, decimals, displayDecimals);
  }

  getCalculatedStakingLimit() {
    return this.stakingTokenBalance;
  }

  handleStakeInputChange(e) {
    const input = e.value;
    if (input) {
      const convertedInput = getDecimalAmount(new BigNumber(input), 18);
      const percentage = Math.floor(
        convertedInput
          .dividedBy(this.getCalculatedStakingLimit())
          .multipliedBy(100)
          .toNumber()
      );
      this.percent = Math.min(percentage, 100);
    } else {
      this.percent = 0;
    }
    this.stakeAmount = input;
  }

  handleChangePercent(sliderPercent: number) {
    if (sliderPercent > 0) {
      const percentageOfStakingMax = this.getCalculatedStakingLimit()
        .dividedBy(100)
        .multipliedBy(sliderPercent);
      const amountToStake = getFullDisplayBalance(
        percentageOfStakingMax,
        18,
        18
      );
      this.stakeAmount = amountToStake;
    } else {
      this.stakeAmount = "0";
    }
    this.percent = sliderPercent;
  }

  async handleConfirmClick() {
    if (
      !this.stakeAmount ||
      parseFloat(this.stakeAmount) === 0 ||
      this.userNotEnoughToken
    )
      return;
    const { onStake } = useBUSDStaking();
    let tx: TxResponse = null;
    try {
      this.pendingTx = true;
      tx = await onStake(this.stakeAmount, 18);
      const receipt = await tx.wait();
      if (receipt?.status) {
        this.$store.commit("useToast", {
          severity: "success",
          summary: "Staked",
          detail: `Your BUSD have been invested!`,
        });
        const address = this.$store.state.web3.user.address;
        updateUserStakedBalance(address);
        updateUserBalance(address);
        updateUserStakingDetails(address);
        this.displayDialog = false;
      }
      this.$store.commit("useTxToast", { txHash: tx.hash });
    } catch (err) {
      useCatchTxError(err, tx);
    } finally {
      this.pendingTx = false;
    }
  }

  getAnnualRoi(amount) {
    const annualReward = ((amount * 3) / 100);
    return annualReward;
  }

  mounted() {
    watchEffect(() => {
      this.fullDecimalStakeAmount = getDecimalAmount(
        new BigNumber(this.stakeAmount),
        18
      );
      this.userNotEnoughToken = new BigNumber(this.stakingData.userData.balance).lt(
        this.fullDecimalStakeAmount
      );
      this.annualRoi =
        Number(this.stakeAmount) - 5 > 0
          ? this.getAnnualRoi(this.stakeAmount)
          : null;
    });

    this.emitter.off("shouldDisplayStakeDialog");
    this.emitter.on("shouldDisplayStakeDialog", (isOpen: boolean) => {
      this.displayDialog = isOpen;
      this.isRemovingStake = false;
    });
  }
}
</script>
<style lang="scss">
.token-input {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;

  .p-inputtext,
  .p-inputnumber {
    width: 100%;
  }

  input {
    background: transparent;
  }
}

.no-bg {
  background: transparent
}

.jfPlkw {
  color: #ed4b9e;
  font-weight: 400;
  line-height: 1.5;
  margin-top: 4px;
  font-size: 12px;
}

.jfPlkw2 {
  color: #3d53a4;
  font-weight: 400;
  line-height: 1.5;
  margin-top: 4px;
  font-size: 13px;
}

.btn-sm {
  min-width: 30px;
  padding: 4px 16px !important;
  flex-grow: 1;
}

.cornered-btn {
  border-radius: 0.75rem !important;
}

.no-click {
  cursor: not-allowed;
  filter: grayscale(0.8);
}
</style>