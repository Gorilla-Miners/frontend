<script lang="ts">
import { Options } from "vue-class-component";
import Web3ModalVue from "@/components/Web3ModalVue.vue";
import WalletConnectProvider from "@walletconnect/web3-provider";
import ConnectToTrustWallect from "@/providers/connectors/trust";
import injection from "@/providers/connectors/injected";
import { BASE_BSC_SCAN_URL } from "@/config/index";
import Web3Mixins from './helpers/mixins/web3Mixin';
import Dialog from "primevue/dialog";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
import Button from "primevue/button";
import Header from "@/components/Header.vue";
import { cache } from '@/utils/cache';
import { isEmpty } from "lodash";
import { checkReferralStatus } from "./helpers/staking";
import useAddReferral from "./helpers/staking/useAddReferral";
import useCatchTxError from "@/helpers/useCatchTxError";
import { TxResponse } from "@/helpers/useCatchTxError";

declare global {
  interface Window {
    BinanceChain: any;
    particlesJS: any;
  }
}

@Options({
  components: {
    Toast,
    Dialog,
    ConfirmDialog,
    Button,
    Web3ModalVue,
    Header,
  },
  watch: {
    "$route.query": {
      async handler(query) {
        try {
          const referrer = query.ref ?? query.referrer;
          this.cache.set("referrer", referrer);
          const stored_referrer = await this.cache.get("referrer");
          setTimeout(async () => {
            if (!isEmpty(stored_referrer) || !!referrer) {
              if (!this.user.active) {
                this.$confirm.close();
                this.$confirm.require({
                  message: `You have a referrer but you're not connected to your wallet, Would you like to your connect now?`,
                  header: 'Connect Wallet',
                  icon: `bi bi-info text-info`,
                  acceptLabel: 'Yes, Connect',
                  rejectLabel: 'Close',
                  acceptClass: `btn-info`,
                  rejectClass: 'btn-transparent',
                  blockScroll: false,
                  accept: async () => {
                    this.connectWallet();

                    setTimeout(async () => {
                      if (this.user.active) {
                        const referralCode = `${stored_referrer || referrer}`;
                        this.cache.remove("referrer");
                        if (this.user.address.toLowerCase() != referralCode.toLowerCase()) {
                          const referralStatus = await this.checkReferralStatus();
                          if (!referralStatus) {
                            await this.connectReferral(referralCode);
                          }
                        }
                      }
                    }, 4000)
                  },
                  reject: () => {
                    this.cache.remove("referrer")
                  }
                });
              } else {
                const referralCode = `${stored_referrer || referrer}`;
                this.cache.remove("referrer");
                if (this.user.address.toLowerCase() != referralCode.toLowerCase()){
                  const referralStatus = await this.checkReferralStatus();
                  if (!referralStatus) {
                    await this.connectReferral(referralCode);
                  }
                }
              }
            }
          }, 3000);
        } catch (err) {
          console.log(err);
        }
      },
      immediate: true,
    },
  },
})
export default class App extends Web3Mixins {
  BASE_BSC_SCAN_URL = BASE_BSC_SCAN_URL;
  cache: any = cache;

  providerOptions = {
    "custom-metamask": {
      display: {
        logo: "/images/logos/metamask.svg",
        name: "MetaMask",
        description: "Connect to your MetaMask",
      },
      package: true,
      connector: async () => injection(),
    },
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          56: "https://bsc-dataseed.binance.org/",
        },
        network: "binance",
        chainId: 56,
      },
    },
    "custom-trustwallet": {
      display: {
        logo: "/images/logos/trust.svg",
        name: "TrustWallet",
        description: "Connect to your TrustWallet",
      },
      package: true,
      connector: async (_, __, opt) =>
        ConnectToTrustWallect(
          WalletConnectProvider,
          {
            rpc: {
              56: "https://bsc-dataseed.binance.org/",
            },
            network: "binance",
            chainId: 56,
          },
          opt
        ),
    },
    "custom-binancechainwallet": {
      display: {
        logo: "/images/logos/binance.png",
        name: "Binance Chain Wallet",
        description: "Connect to your Binance Chain Wallet",
      },
      package: true,
      connector: async () => {
        let provider = null;
        if (typeof window.BinanceChain !== "undefined") {
          provider = window.BinanceChain;
          try {
            await provider.request({ method: "eth_requestAccounts" });
          } catch (error) {
            throw new Error("User Rejected");
          }
        } else {
          throw new Error("No Binance Chain Wallet found");
        }
        return provider;
      },
    },
  };

  declare $refs: {
    web3modal: any;
    toast: any;
    txToast: any;
  };

  async checkReferralStatus() {
    try {
      const result = await checkReferralStatus(this.user.address);
      return result;
    } catch (err) {
      throw new Error(err.toString());
    }
  }

  async connectReferral(referralCode: string) {
    const { onRefer } = useAddReferral();
    let tx: TxResponse = null;
    try {
      tx = await onRefer(this.user.address, referralCode);
      const receipt = await tx.wait();
      if (receipt?.status) {
        this.$store.commit("useToast", {
          severity: "success",
          summary: "Success",
          detail: `Referral Registered!`,
        });
      }
      this.$store.commit("useTxToast", { txHash: tx.hash });
    } catch (err) {
      console.log(err);
      this.cache.remove("referrer");
      useCatchTxError(err, tx);
    } finally {
    }
  }

  mounted() {
    this.$store.commit("setToast", this.$refs.toast);
    this.$store.commit("setTxToast", this.$refs.txToast);

    setTimeout(() => {
      window.particlesJS("gold-tech-bg", { "particles": { "number": { "value": 20, "density": { "enable": false, "value_area": 200 } }, "color": { "value": "#ffffff" }, "shape": { "type": "image", "stroke": { "width": 0, "color": "#000000" }, "polygon": { "nb_sides": 3 }, "image": { "src": "images/gold-animation-icon.png", "width": 100, "height": 100 } }, "opacity": { "value": 0, "random": false, "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false } }, "size": { "value": 28.05971106514665, "random": true, "anim": { "enable": false, "speed": 25, "size_min": 0.1, "sync": false } }, "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0, "width": 0 }, "move": { "enable": true, "speed": 1.5, "direction": "none", "random": false, "straight": false, "out_mode": "bounce", "bounce": false, "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 } } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true }, "modes": { "grab": { "distance": 400, "line_linked": { "opacity": 1 } }, "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 }, "repulse": { "distance": 200, "duration": 0.4 }, "push": { "particles_nb": 4 }, "remove": { "particles_nb": 2 } } }, "retina_detect": true });
    }, 3000)

    this.$nextTick(async () => {
      const web3modal = this.$refs.web3modal;
      this.$store.commit("setWeb3Modal", web3modal);
      if (web3modal.cachedProvider) {
        this.$store.dispatch("connect");
      }
    });
  }
}
</script>

<template>
  <div class="wrapper" id="top">
    <web3-modal-vue :disableInjectedProvider="true" ref="web3modal" :providerOptions="providerOptions"
      :cacheProvider="true" network="binance" />
    <Toast ref="toast" group="regular" />
    <Toast position="top-right" ref="txToast">
      <template #message="slotProps">
        <span class="p-toast-message-icon pi pi-times"></span>
        <div class="p-toast-message-text">
          <span class="p-toast-summary">{{ slotProps.message.summary }}</span>
          <div class="p-toast-detail">
            <a :href="`${BASE_BSC_SCAN_URL}/tx/${slotProps.message.detail}`" target="_blank">Check your transaction on
              BSCScan</a>
          </div>
        </div>
      </template>
    </Toast>
    <Header />
    <div class="midd-container">
      <router-view>
      </router-view>
    </div>
    <div class="clear"></div>
    <!--footer Start-->
    <footer class="footer-1">
      <div class="container">
        <div class="row">
          <div class="col-md-4 footer-box-1">
            <div class="footer-logo">
              <a href="#" title=""><img src="images/GorillaMiners.png" style="height: 100px ;" alt="Cp Silver"></a>
            </div>
            <p>Gorilla Miners is designed for individuals with long term visions and goals that want to achieve great
              financial sustainability.</p>
          </div>
          <div class="col-md-4 footer-box-2">
            <div class="sec-title">
              <h4 class="widget-title">Pages</h4>
            </div>
            <ul class="footer-menu onepage">
              <li><a href="#token">Contract</a></li>
              <li><a href="#roadmap">Gorilla Doc</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#about">Refferal</a></li>
            </ul>
          </div>
          <div class="col-md-4 footer-box-3">
            <div class="socials">
              <ul>
                <li><a href="https://facebook.com/"><i class="fab fa-telegram-plane"></i> Telegram</a></li>
                <li><a href="https://twitter.com/"><i class="fab fa-twitter"></i> Twitter</a></li>
                <!-- <li><a href="https://plus.google.com/"><i class="fab fa-google-plus-g"></i> Google +</a></li>
                                <li><a href="https://www.youtube.com/"><i class="fab fa-youtube"></i> Youtube</a></li> -->
              </ul>
            </div>
          </div>
        </div>
        <div style="margin-top: 50px;" class="row">
          <div class="col-md-4">
            <div class="copyrights style-1">
              © 2022 GorillaMiners.
            </div>
          </div>
        </div>
      </div>
    </footer>
    <!--footer end-->
  </div>
  <ConfirmDialog class="max-w-md-75"></ConfirmDialog>
</template>


