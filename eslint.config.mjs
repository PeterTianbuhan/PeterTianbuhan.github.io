import nextCoreVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".next/**", ".publish/**", "out/**"],
  },
  ...nextCoreVitals,
  ...nextTypescript,
];

export default eslintConfig;
