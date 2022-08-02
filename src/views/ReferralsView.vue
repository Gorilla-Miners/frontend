<script lang="ts">
import { BASE_BSC_SCAN_URL } from "@/config";
import { SerializedStaking } from "@/config/constants/types";
import CommonMixin from "@/helpers/mixins/CommonMixin";
import { useStaking, useStakingPageFetch } from "@/helpers/staking";
import { getStakingAddress } from "@/utils/addressHelpers";
import { watchEffect } from "vue";
import { Options } from "vue-class-component";
import Clock from '@/components/Clock.vue';
import CountDown from '@/components/CountDown.vue';
import BigNumber from "bignumber.js";
import { getBalanceNumber } from "@/utils/formatBalance";
import CardActions from "@/components/stakings/actions/CardActions.vue";
import HarvestAction from "@/components/stakings/actions/HarvestAction.vue";
import ReferralDialog from "@/components/ReferralDialog.vue";

@Options({
  components: {
    Clock,
    CardActions,
    CountDown,
    HarvestAction, ReferralDialog,
  },
})
export default class Referrals extends CommonMixin {
  stakingData: SerializedStaking = null;
  userDataLoaded: boolean = false;

  get referralLink() {
    return `${this.currentDomain}?ref=${this.user.address}`;
  }

  copy(content, title) {
    if (!!content) {
      const el = document.createElement('textarea');
      el.value = content;
      el.setAttribute('readonly', '');
      // el.style = { display: 'none' };
      document.body.appendChild(el);
      el.select();
      el.setSelectionRange(0, 99999); /*For mobile devices*/
      document.execCommand('copy');
      document.body.removeChild(el);

      this.$store.commit("useToast", {
        severity: "info",
        summary: "Copied",
        detail: `Successfully copied (${title})`,
      });

    } else this.$store.commit("useToast", {
      severity: "error",
      summary: "Failed to Copy",
      detail: `No data found!`,
    });
  }

  getFormattedBalance(val) {
    var formatter = new Intl.NumberFormat("en-US", {
      // These options are needed to round to whole numbers if that's what you want.
      //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
      maximumFractionDigits: 8,
    });
    return formatter.format(val);
  }

  getBalanceNumber(val: BigNumber, decimal = 2) {
    return getBalanceNumber(val, decimal);
  }

  getLeadershipReward(leadershipPosition) {
    let earnings = 0;
    const leadershipProgram = [
      { reward: 200, position: 1 },
      { reward: 1000, position: 2 },
      { reward: 2500, position: 3 },
      { reward: 5000, position: 4 },
      { reward: 10000, position: 5 },
      { reward: 15000, position: 6 },
      { reward: 20000, position: 7 },
    ];

    for (let i = 0; i < leadershipProgram.length; i++) {
      if (leadershipPosition < leadershipProgram[i].position) {
        break
      }
      earnings += leadershipProgram[i].reward;
    }
    return earnings;
  }

  onPresentAddReferral() {
    this.emitter.emit("shouldDisplayReferralDialog", true);
  }

  mounted() {
    useStakingPageFetch();
    watchEffect(() => {
      const { data: stakingData, userDataLoaded } = useStaking();
      this.stakingData = stakingData;
      this.userDataLoaded = userDataLoaded;
    });
  }
}
</script>

<template>
  <ReferralDialog />
  <!-- Token Sale start -->
  <div class="token-sale p-tb mt-4" id="token">
    <div class="container">
      <div class="sec-title text-center">
        <h3>Referrals</h3>
      </div>
      <div class="sub-txt text-center">
        <p>Earn 10% on referral commission and 15% of downline daily earnings.</p>
      </div>
      <div class="d-flex justify-content-center">
        <div class="card card-body pt-3 strange-card">
          <div class="icon-container h d-flex justify-content-center"><i
              class="bi bi-link border border-current sq-2 p-2 font-1 mr-2 rounded-circle text-primary"></i><b
              class="label text-black">My Referral Link</b></div>
          <hr class="s-1">
          <a @click="onPresentAddReferral" class="btn btn4" href="javascript:void(0)">Refer Someone to earn</a>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row" v-if="userDataLoaded">
        <div class="col-md-4">
          <div class="token-sale-box">
            <ul>
              <li>
                <span>Total Referrals:</span>
                <p>{{ stakingData.userData.totalReferrals }}</p>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-md-4">
          <div class="token-sale-box">
            <ul>
              <li>
                <span>Referral Bonus:</span>
                <p>{{
                  getFormattedBalance(getBalanceNumber(stakingData.userData.referralCommission, 18))
                  }} BUSD</p>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-md-4">
          <div class="token-sale-box">
            <ul>
              <li>
                <span>Daily Referral Earnings:</span>
                <p>{{
                  getFormattedBalance(getBalanceNumber(stakingData.userData.referralReward, 18))
                  }} BUSD</p>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-md-4">
          <div class="token-sale-box">
            <ul>
              <li>
                <span>Leadership Reward:</span>
                <p>{{
                  getFormattedBalance(getLeadershipReward(stakingData.userData.currentLeadershipPosition))
                  }} BUSD</p>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-md-4">
          <div class="token-sale-box">
            <ul>
              <li>
                <span>Total Team Sales:</span>
                <p>{{
                  getFormattedBalance(getBalanceNumber(stakingData.userData.leadershipScore, 18))
                  }} BUSD</p>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-md-4">
          <div class="token-sale-box">
            <ul>
              <li>
                <span>Total Team:</span>
                <p>{{
                  stakingData.userData.totalTeamSales
                  }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </div>
  <!-- Token Sale end -->
</template>
<style lang="scss" scoped>
.strange-card {
  width: 100%;
  max-width: 460px;
  border-radius: 10px;
}

.cover-ref {
  background: #000;
  color: #fff;
  border-radius: 12px;

  .copy-btn {
    cursor: pointer;
  }
}

.token-sale-box {
  margin-bottom: 15px;
}
</style>
