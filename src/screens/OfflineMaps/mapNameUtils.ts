export const canSaveMapName = ({
  name,
  savedName,
  nameErrorKey,
}: {
  name: string;
  // undefined when the map is not available
  savedName: string | undefined;
  nameErrorKey: string | null | undefined;
}): boolean =>
  savedName !== undefined && !nameErrorKey && name.trim() !== savedName;
