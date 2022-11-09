<script setup lang="ts">
const boxes = await $fetch('/api/boxes/scan')
</script>

<template>
    <v-container>
        <v-card title="Found Slingboxes" subtitle="(Note: this is just a test. you can't do anything here yet)">
            <v-card-text>
                <v-list>
                    <v-list-item v-for="box in boxes" :key="box.finderId" :title="box.name" :subtitle="`${box.host}:${box.port} [${box.finderId}]`" />
                </v-list>
            </v-card-text>
        </v-card>
    </v-container>
</template>