export function createRandomColor() {
  const chars = "0123456789ABCDEF";
  let color = "";
  for (let index = 0; index < 6; index++) {
    color += chars[Math.floor(Math.random() * 16)];
  }
  return `#${color}`;
}
