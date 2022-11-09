<template>
  <v-app>
    <NuxtLayout>
      <v-main>
        <NuxtLoadingIndicator :height="0">
          <v-progress-linear indeterminate />
        </NuxtLoadingIndicator>
        <NuxtPage />
      </v-main>
    </NuxtLayout>
  </v-app>
</template>