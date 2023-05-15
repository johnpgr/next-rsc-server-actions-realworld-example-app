/** @type {import("prettier").Config} */
module.exports = {
    semi: false,
    tabWidth: 4,
    printWidth: 80,
    trailingComma: "all",
    plugins: [require.resolve("prettier-plugin-tailwindcss")],
    tailwindConfig: "./tailwind.config.js",
};
