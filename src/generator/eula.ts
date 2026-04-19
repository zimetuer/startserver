export function generateEula(): string {
  return `#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://aka.ms/MinecraftEULA).
#${new Date().toISOString()}
eula=true
`;
}
