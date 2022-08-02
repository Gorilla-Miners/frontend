<template>
  <Dialog header="Add Referrer" v-model:visible="displayDialog" :breakpoints="{ '760px': '62vw', '490px': '90vw' }"
    :style="{ width: '520px' }" contentClass="d-flex flex-column pb-3" dismissableMask modal>
    <div class="mb-2">
      <strong>Enter Referrer Address: </strong>
    </div>
    <div class="token-input2 mb-3">
      <div class="d-flex flex-column align-items-end mt-3">
        <input type="text" v-model="userAddress" class="border-0 p-0 text-right no-bg" />
      </div>
    </div>

    <template #footer>
      <Button v-if="pendingTx" :loading="pendingTx" type="button" class="btn btn-block btn4 mt-3 w-100"
        label="Loading..." />
      <Button v-else type="button" @click="handleConfirmClick" class="btn btn-block btn4 mt-3 w-100" :class="{
        'no-click':
          !userAddress || userAddress.length < 10,
      }" label="Proceed" />
    </template>
  </Dialog>
</template>
<script lang="ts">
import { Options, Vue, mixins } from "vue-class-component";
import useCatchTxError from "@/helpers/useCatchTxError";
import { TxResponse } from "@/helpers/useCatchTxError";
import CommonMixin from "@/helpers/mixins/CommonMixin";
import useReferralCallback from "@/helpers/useReferralCallback";

class Props {
}

@Options({
  watch: {},
  components: {},
})
export default class ReferralDialog extends mixins(Vue.with(Props), CommonMixin) {
  userAddress = '';

  displayDialog = false;
  pendingTx: boolean = false;

  async handleConfirmClick() {
    if (!this.userAddress || this.userAddress.length < 11)
      return;
    const { onReferUser } = useReferralCallback();
    let tx: TxResponse = null;
    try {
      this.pendingTx = true;
      tx = await onReferUser(this.user.address, this.userAddress);
      const receipt = await tx.wait();
      if (receipt?.status) {
        this.$store.commit("useToast", {
          severity: "success",
          summary: "Success",
          detail: `Referral Registered!`,
        });
        this.userAddress = '';
        this.displayDialog = false;
      }
      this.$store.commit("useTxToast", { txHash: tx.hash });
    } catch (err) {
      console.log(err);
      useCatchTxError(err, tx);
    } finally {
      this.pendingTx = false;
    }
  }

  mounted() {
    this.emitter.off("shouldDisplayReferralDialog");
    this.emitter.on("shouldDisplayReferralDialog", (isOpen: boolean) => {
      this.displayDialog = isOpen;
    });
  }
}
</script>
<style lang="scss">
.token-input2 {
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

.token-input2 {
  input:focus {
    box-shadow: none;
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