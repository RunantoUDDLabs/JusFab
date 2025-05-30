import { createMongoAbility } from "@casl/ability";
import { abilitiesPlugin } from "@casl/vue";
import { cookies } from "@/plugins/useCookies";

export let $ability;

/**
 * Retrieves the user's role from localStorage, API, or another storage method.
 * Replace this with your actual authentication method.
 *
 * @returns {string} - User's role (e.g., 'admin', 'user')
 */
function getUserRole() {
  return cookies.get("user_role") || "GUEST";
}

export default function (app) {
  // Get the user's role when the app initializes
  const userRole = getUserRole();

  // Get the initial ability rules based on the user's role
  const userAbilityRules = USER_ABILITY_RULES[userRole];

  // Create the initial ability instance
  const initialAbility = createMongoAbility(userAbilityRules ?? []);
  $ability = initialAbility;

  // Register CASL ability plugin with Vue
  app.use(abilitiesPlugin, initialAbility, {
    useGlobalProperties: true,
  });
}
