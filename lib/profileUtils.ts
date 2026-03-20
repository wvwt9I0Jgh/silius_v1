export interface DistrictOption {
  value: string;
  label: string;
}

export const MUGLA_DISTRICT_OPTIONS: DistrictOption[] = [
  { value: 'mugla-merkez', label: 'Mugla Merkez' },
  { value: 'dalaman', label: 'Dalaman' },
  { value: 'ortaca', label: 'Ortaca' },
  { value: 'milas', label: 'Milas' },
  { value: 'marmaris', label: 'Marmaris' },
  { value: 'bodrum', label: 'Bodrum' },
  { value: 'fethiye', label: 'Fethiye' },
  { value: 'gocek', label: 'Gocek' },
  { value: 'koycegiz', label: 'Koycegiz' },
  { value: 'datca', label: 'Datca' },
  { value: 'ula', label: 'Ula' },
  { value: 'yatagan', label: 'Yatagan' },
];

export const getDistrictLabel = (district?: string): string | undefined => {
  if (!district) return undefined;
  const match = MUGLA_DISTRICT_OPTIONS.find((option) => option.value === district);
  return match?.label ?? district;
};

export const calculateAgeFromBirthDate = (
  birthDate?: string,
  fallbackAge?: number
): number | undefined => {
  if (!birthDate) return fallbackAge;

  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return fallbackAge;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();

  const monthDiff = today.getMonth() - dob.getMonth();
  const hasBirthdayPassed =
    monthDiff > 0 || (monthDiff === 0 && today.getDate() >= dob.getDate());

  if (!hasBirthdayPassed) age -= 1;

  return age >= 0 ? age : fallbackAge;
};
