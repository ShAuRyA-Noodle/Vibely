import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // New rule shipped with eslint-config-next 16. The existing
      // effect-driven fetch/subscribe patterns are intentional, so keep
      // this as a warning rather than blocking lint.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
