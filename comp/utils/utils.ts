export function randomID(): string {
  return Math.floor(Math.random() * 36 ** 6).toString(36)
}
