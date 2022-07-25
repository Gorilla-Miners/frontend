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

@Options({
  components: {
    Clock,
    CardActions,
    CountDown,
  },
})
export default class Home extends CommonMixin {
  BASE_BSC_SCAN_URL = BASE_BSC_SCAN_URL;

  stakingData: SerializedStaking = null;
  userDataLoaded: boolean = false;

  get contractAddress() {
    return getStakingAddress();
  }

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
  <!-- Hero Section Start -->
  <div class="hero-main layout-3 white-sec" style="background-image:url('images/banner.jpg');">
    <div id="gold-tech-bg"></div>
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-sm-12 hero-caption wow fadeIn text-center">
          <div class="sec-title text-center">
            <h1>GorillaMiners is the fastest <span>BUSD</span> mining platform</h1>
          </div>
          <!-- <p class="lead">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eu mauris bibendum, tincidunt mauris at, tempor nunc.</p> -->
        </div>
        <div class="col-sm-10 wow fadeIn" data-wow-delay="0.5s">
          <div class="pre-sale-timer-outer">
            <div class="pre-sale-timer style-2">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <h3>Contract has <span>been running since</span></h3>
                  <Clock v-if="stakingData" :countDownEndTime="stakingData.contractInitializedAt" />
                  <div class="hero-right-btn"><a class="btn btn4"
                      :href="`${BASE_BSC_SCAN_URL}/address/${contractAddress}`">View Contract</a></div>
                </div>
                <div class="col-md-6">
                  <div class="rang-slider-main" v-if="stakingData">
                    <div class="rang-slider-toltip">
                      <span>Number of participates <strong>{{
                      stakingData.totalParticipants
                      }}</strong></span>
                      <span>Total Payout<strong>${{ getFormattedBalance(getBalanceNumber(stakingData.totalPayouts,
                      18))
                      }}</strong></span>
                    </div>
                    <div class="rang-slider-total">
                      <span v-if="stakingData.totalInvestments">Total BUSD in Contract <strong style=" font-size:
                        30px">${{ getFormattedBalance(getBalanceNumber(stakingData.contractBalance, 18))
                        }}</strong></span>
                      <!-- <div class="rangTotal">91<small>%</small></div> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-10 wow fadeIn" style="margin-top: 50px ;" data-wow-delay="0.5s" v-if="stakingData">
          <div class="pre-sale-timer-outer">
            <div class="pre-sale-timer style-2" style="display: block">
              <div class="row align-items-center">
                <div class="col-md-6">
                  <h3>Start Mining <span>BUSD!</span></h3>
                  <div id="clock" data-date="2021/12/31"></div>
                  <div class="hero-right-btn" v-if="!isWalletConnected"><a class="btn btn4" href="javascript:void(0)"
                      @click="connectWallet()">Connect wallet</a>
                  </div>
                  <div class="hero-right-btn" v-else>
                    <CardActions v-if="userDataLoaded" :stakingData="stakingData" :stakedBalance="
                      stakingData.userData.amount
                    " />
                  </div>
                </div>
                <div class="col-md-6" v-if="userDataLoaded">
                  <div class="rang-slider-main">
                    <div class="rang-slider-toltip">
                      <span>You Have <strong>{{
                      
                      getFormattedBalance(getBalanceNumber(stakingData.userData.amount.plus(stakingData.userData.referralReward.plus(stakingData.userData.totalReward)),
                      18))
                      }}
                          BUSD</strong></span>
                      <span>Total Payout<strong>{{
                      getFormattedBalance(getBalanceNumber(stakingData.userData.totalWithdrawal, 18))
                      }}</strong></span>
                    </div>
                    <div class="rang-slider-total">
                      <span>Leadership Reward <strong style="font-size: 30px; text-align: center">{{
                      getFormattedBalance(getLeadershipReward(stakingData.userData.currentLeadershipPosition))
                      }}</strong></span>
                      <span>Total Referrals <strong style=" font-size: 30px">{{
                      stakingData.userData.totalReferrals
                      }}</strong></span>
                      <!-- <div class="rangTotal">91<small>%</small></div> -->
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="userDataLoaded && stakingData.userData.amount.gt(0)" style="display: block">
                <h6 class="mb-4 text-uppercase text-pr">Ends in:</h6>
                <CountDown :countDownEndTime="stakingData.userData.lockEndTime" />
              </div>
              <div v-if="isWalletConnected" style="display: block" class="mt-5">
                <h6 class="mb-4 text-uppercase text-pr">Referral Address</h6>
                <div class="cover-ref d-flex flex-center small mx-auto my-4 p-3 w-100 w-md-75">
                  <span class="text-truncate mr-4">{{ referralLink }}</span>
                  <span class="ml-auto px-3 copy-btn" @click="copy(`${referralLink}`, 'Referral Link')">COPY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Hero Section End -->
  <!--About Start -->
  <div class="about-section style-2 p-tb" id="about">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-sm-6 about-left">
          <div class="sec-title">
            <h1>About</h1>
            <h3 style="text-align: left;">Why to choose GorillaMiners?</h3>
          </div>
          <h5 class="accent-color">Gorilla Miners is designed for individuals with long term visions and goals that want
            to achieve great financial sustainability.</h5>
          <p>With our miners that have been systematically designed to give you 3% daily ROI and 90% a month in BUSD
            (190% including your capital) plus our compounding features that enables you multiply your earnings. This is
            a great opportunity for anyone who desires to meet their daily and monthly financial target, with a verified
            and well structured platform on the Blockchain . </p>
          <!-- <p>Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce ligula ante, auctor et tempor at, scelerisque id nisl. Aliquam ultrices libero a turpis feugiat, pulvinar faucibus libero sodales. Duis condimentum arcu magna.</p> -->
          <a class="btn" href="#">Gorilla Doc</a>

        </div>
        <div class="col-sm-6 about-right order-first order-md-last">
          <iframe width="100%" height="345" src="https://www.youtube.com/embed/u2e796JONEU">
          </iframe>
        </div>
      </div>
    </div>
  </div>
  <!--About end -->
  <!-- Benefits Start -->
  <div class="benefits p-tb white-sec">
    <div class="container">
      <div class="sec-title text-center">
        <h3>How It Works?</h3>
      </div>
      <!-- <div class="sub-txt text-center">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean cursus tincidunt ultrices. Ut quis blandit dolor. Ut laoreet sagittis arcu eu tristique. </p>
                    </div> -->
    </div>
    <div class="container">
      <div class="benefits-boxes row">
        <div class="col-md-6">
          <div style="height: 200px;" class="item wow fadeInUp">
            <div class="bf-image">
              <img src="images/icon-1.png" alt="Read Time Update">
            </div>
            <div class="bf-details">
              <h3>3% Daily ROI</h3>
              <p>Our platform has been systematically designed to give you 3% daily ROI and 90% a month in BUSD (190%
                including your capital)</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div style="height: 200px;" class="item wow fadeInUp" data-wow-delay="0.1s">
            <div class="bf-image">
              <img src="images/icon-4.png" alt="Instant operations">
            </div>
            <div class="bf-details">
              <h3>Sustainability</h3>
              <p>Gorilla Miners is sustained by continued community support by ways of
                contributing to the community pools.</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div style="height: 200px;" class="item wow fadeInUp" data-wow-delay="0.2s">
            <div class="bf-image">
              <img src="images/icon-6.png" alt="Protects the identity">
            </div>
            <div class="bf-details">
              <h3>Verified Public Contract</h3>
              <p>The Gorilla Miners contract is public, verified and can be viewed here on BSCScan.</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div style="height: 200px;" class="item wow fadeInUp" data-wow-delay="0.2s">
            <div class="bf-image">
              <img src="images/icon-5.png" alt="Strong teams & Advisors">
            </div>
            <div class="bf-details">
              <h3>Bonus Refferal System</h3>
              <p>You make 15% from the 3% daily earnings of all direct referral alone. This is intended to reward the
                powerful leaders among us.</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div style="height: 200px;" class="item wow fadeInUp" data-wow-delay="0.1s">
            <div class="bf-image">
              <img src="images/icon-3.png" alt="No transaction fees">
            </div>
            <div class="bf-details">
              <h3>Minimal transaction fee</h3>
              <p>All participants of Gorilla Miners are to pay a registration fee of $5. This is geared towards
                providing funds for platform maintenance and marketing/promotional budgets. </p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div style="height: 200px;" class="item wow fadeInUp">
            <div class="bf-image">
              <img src="images/icon-4.png" alt="Instant operations">
            </div>
            <div class="bf-details">
              <h3>Compounding Effect</h3>
              <p>A participant can only compound or top up from a minimum of $10.</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div style="height: 200px;" class="item wow fadeInUp">
            <div class="bf-image">
              <img src="images/icon-4.png" alt="Instant operations">
            </div>
            <div class="bf-details">
              <h3>Penalty</h3>
              <p>50% capital loss (this happens as a penalty to any participant who decided to take out their funds on
                or before the agreed period of time. You will receive 50% of your capital while 50% goes back to the
                community pool.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div style="width: 100%; display:flex ">
    <img src="images/Leadership.jpeg"
      style="margin-top: 60px; margin-bottom: 60px;margin-left: auto ; margin-right: auto" />
  </div>
</template>
<style lang="scss" scoped>
.cover-ref {
  background: #000;
  color: #fff;
  border-radius: 12px;

  .copy-btn {
    cursor: pointer;
  }
}
</style>
