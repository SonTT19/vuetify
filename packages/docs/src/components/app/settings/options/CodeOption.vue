<template>
  <AppSettingsSettingsHeader text="enable-composition-message" title="enable-composition">
    <v-defaults-provider
      :defaults="{
        VIcon: { color: user.ecosystem.docs.composition === 'composition' ? 'primary' : 'disabled' }
      }"
    >
      <SettingsSwitch
        v-model="user.ecosystem.docs.composition"
        false-value="options"
        true-value="composition"
      />
    </v-defaults-provider>
  </AppSettingsSettingsHeader>
</template>

<script setup>
  const user = useUserStore()
</script>
