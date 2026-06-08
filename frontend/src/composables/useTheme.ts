import { ref, watch } from 'vue';

const isDarkMode = ref(localStorage.getItem('customerDarkMode') === 'true');

// Watch for changes to save to localStorage
watch(isDarkMode, (newValue) => {
  localStorage.setItem('customerDarkMode', String(newValue));
});

export function useTheme() {
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  return {
    isDarkMode,
    toggleDarkMode
  };
}
