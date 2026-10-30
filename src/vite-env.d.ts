/// <reference types="vite/client" />

declare module "virtual:formats" {
  const formats: { id: string; name: string }[];
  export default formats;
}
