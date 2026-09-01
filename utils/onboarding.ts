import AsyncStorage from "@react-native-async-storage/async-storage";

export const ONBOARDING_COMPLETED_KEY = "cocoaguard.onboarding.completed.v1";
const MAIN_APP_ROUTE = "/(tabs)";

type RouterLike = {
  replace: (href: string) => void;
};

export async function markOnboardingCompleted() {
  await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
}

export async function hasCompletedOnboarding() {
  return (await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)) === "true";
}

export async function completeOnboarding(router: RouterLike) {
  await markOnboardingCompleted();
  router.replace(MAIN_APP_ROUTE);
}

export function getMainAppRoute() {
  return MAIN_APP_ROUTE;
}
