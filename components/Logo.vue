<template>
  <img class="TipJarLogo" src="/icon.png" />
</template>

<style>
.TipJarLogo {
  display: inline-block;
  animation: turn 2s linear forwards 1s;
  transform: rotateX(270deg) rotateY(180deg);
  position: relative;
  overflow: hidden;
  height: 240px;
  width: 240px;
}

@keyframes turn {
  100% {
    transform: rotateX(0deg) rotateY(0deg);
  }
}
</style>
