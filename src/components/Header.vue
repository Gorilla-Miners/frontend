<script lang="ts">
import Web3Mixins from "../helpers/mixins/web3Mixin";
export default class ConnectWalletButton extends Web3Mixins { }
</script>

<template>
  <!--Header Start -->
  <header>
    <div class="container">
      <div class="row" style=" display:flex; justify-items: center; align-items: center ">
        <div class="col-sm-6 col-md-4 logo">
          <a href="cp-gold.html" title="Cp Gold">
            <img class="light" style="height: 70px ;" src="images/GorillaMiners.png" alt="Cp Gold">
            <img class="dark" style="height: 70px ;" src="images/GorillaMinersb.png" alt="Cp Gold">
          </a>
        </div>
        <div class="col-sm-6 col-md-8 main-menu">
          <div class="menu-icon">
            <span class="top"></span>
            <span class="middle"></span>
            <span class="bottom"></span>
          </div>
          <nav class="onepage">
            <ul>
              <li class="active"><a href="#top">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a style=" display: flex; flex-direction: column" href="#token">Gorilla lottery<span
                    style=" text-align:center; font-size:10px; font-style:normal; margin-top: -6px">coming
                    soon</span></a></li>
              <li><a href="#about">Refferal</a></li>
              <li class="nav-btn"><a href="javascript:;" v-if="!isWalletConnected" @click="connectWallet()">Connect
                  Wallet</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </header>
  <!--Header End-->

</template>