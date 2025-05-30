import { store } from "@/plugins/2.pinia";
import { useAbility } from "@casl/vue";
import { USER_ABILITY_RULES } from "./constant";

export function useMixin() {
  let resizeObserver = null;
  const lastSizes = new WeakMap(); // Lưu kích thước cuối cùng để so sánh

  const observe = (element, callback, threshold = 2) => {
    if (!element || typeof callback !== "function") return;

    resizeObserver = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        for (let entry of entries) {
          const newWidth = Math.round(entry.contentRect?.width);
          const newHeight = Math.round(entry.contentRect?.height);
          const lastSize = lastSizes.get(entry.target) || {
            width: 0,
            height: 0,
          };

          if (
            Math.abs(newWidth - lastSize.width) > threshold ||
            Math.abs(newHeight - lastSize.height) > threshold
          ) {
            lastSizes.set(entry.target, { width: newWidth, height: newHeight });
            callback(newWidth, newHeight);
          }
        }

        resizeObserver.disconnect();
      });
    });

    resizeObserver.observe(element);
  };

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  return { observe };
}
