export function toNames(name: string) {
  const kebab = name.replace(/_/g, "-");

  const pascal = kebab
    .split("-")
    .filter((x) => x.length > 0)
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join("");

  const snake = kebab.replace(/-/g, "_");

  return { kebab, pascal, snake };
}
