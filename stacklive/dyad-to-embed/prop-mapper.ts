export function mapProps(props: any[] = []) {
  return props.map((p) => ({
    name: p.name,
    type: p.type || "any",
    default: p.default,
  }));
}
