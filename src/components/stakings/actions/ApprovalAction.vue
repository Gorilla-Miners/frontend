<template>
  <template v-if="!isLoading">
    <Button v-if="pendingTx" :loading="pendingTx" type="button" class="btn btn-block btn4" label="Enabling..." />
    <Button v-else type="button" @click="handleApprove" class="btn btn-block btn4" :class="{
        'no-click': pendingTx,
      }" label="Enable Mining" />
  </template>
</template>
<script lang="ts">
import { Options, Vue, mixins } from "vue-class-component";
import { SerializedStaking } from "@/config/constants/types";
import { useERC20 } from "@/helpers/useContract";
import { serializeTokens } from '@/config/constants/tokens';
import useCatchTxError, { TxResponse } from "@/helpers/useCatchTxError";
import { useApproveStaking } from "@/helpers/staking/useApprove";
import { updateUserStakingAllowance } from "@/helpers/staking";
import CommonMixin from "@/helpers/mixins/CommonMixin";

class Props {
  stakingData: SerializedStaking;
  isLoading: boolean;
}

@Options({
  watch: {},
  components: {},
})
export default class ApprovalActions extends mixins(Vue.with(Props), CommonMixin) {
  pendingTx: boolean = false;

  mounted() {}

  async handleApprove() {
    const serializedTokens = serializeTokens()
    const busdContract = useERC20(serializedTokens.busd.address || "");
    const { handleApprove } = useApproveStaking(busdContract);
    const { address } = this.user;

    let tx: TxResponse = null;
    try {
      this.pendingTx = true;
      tx = await handleApprove();
      this.$store.commit("useToast", {
          severity: "success",
          summary: "Transaction Submitted",
          detail: `Transaction Submitted`,
        });
      const receipt = await tx.wait();
      if (receipt?.status) {
        this.$store.commit("useToast", {
          severity: "success",
          summary: "Contract Enabled!",
          detail: `You can now start mining!`,
        });
        updateUserStakingAllowance(address);
      }
      this.$store.commit("useTxToast", { txHash: tx.hash });
    } catch (err) {
      useCatchTxError(err, tx);
    } finally {
      this.pendingTx = false;
    }
  }
}
</script>
<style lang="scss" scoped>
.cornered-btn {
  border-radius: 0.75rem !important;
}
.btn-primary {
  background: #9982ed !important;

  &:hover {
    background: #9982ed;
  }
}
.no-click {
  cursor: not-allowed;
  filter: grayscale(0.8);
}
</style>