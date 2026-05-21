import { ref } from 'vue';

export const isOrphanDrawerOpen = ref(false);
export const orphanedData = ref<Record<string, any>>({});

export function openOrphanDrawer() {
	isOrphanDrawerOpen.value = true;
}

export function closeOrphanDrawer() {
	isOrphanDrawerOpen.value = false;
}
