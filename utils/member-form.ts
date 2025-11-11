import type { CreateParivarMemberDraft } from './create-parivar-storage';

export const relationshipOptions = [
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Grandparent',
  'Grandchild',
  'Relative',
  'Friend',
  'Caregiver',
  'Other',
];

export const genderOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
export const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const medicalOptions = ['None', 'Diabetes', 'Hypertension', 'Asthma', 'Allergies', 'Heart Conditions'];
export const defaultMedicalSelections = medicalOptions[0];
export const defaultPhoneCountryCode = '+91';

export type MemberFormState = {
  name: string;
  relationship: string;
  gender: string;
  bloodGroup: string;
  dob: string;
  dobDate: Date | null;
  medicalConditions: string;
  phoneNumber: string;
};

export function createEmptyMemberForm(): MemberFormState {
  return {
    name: '',
    relationship: '',
    gender: '',
    bloodGroup: '',
    dob: '',
    dobDate: null,
    medicalConditions: defaultMedicalSelections,
    phoneNumber: '',
  };
}

export function formatDate(date: Date) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return adjusted.toISOString().split('T')[0];
}

export function parseDateString(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function generateMemberId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function extractLocalPhone(value?: string) {
  if (!value) {
    return '';
  }
  const normalized = value.replace(/\s+/g, '');
  const withoutCode = normalized.startsWith(defaultPhoneCountryCode)
    ? normalized.slice(defaultPhoneCountryCode.length)
    : normalized.startsWith('+')
      ? normalized.slice(1)
      : normalized;
  return withoutCode.replace(/\D/g, '');
}

export function sanitizeFamilyMembers(members: CreateParivarMemberDraft[]) {
  return members.map((member) => {
    const payload: Record<string, unknown> = {
      id: member.id,
      name: member.name,
      relationship: member.relationship ?? 'Family',
    };
    if (member.gender) {
      payload.gender = member.gender;
    }
    if (member.bloodGroup) {
      payload.bloodGroup = member.bloodGroup;
    }
    if (member.dob) {
      payload.dob = member.dob;
    }

    const normalizedMedical =
      Array.isArray(member.medicalConditions)
        ? member.medicalConditions.filter((value) => !!value)
        : typeof member.medicalConditions === 'string'
          ? member.medicalConditions
              .split(',')
              .map((value) => value.trim())
              .filter((value) => value.length > 0)
          : undefined;
    if (normalizedMedical && normalizedMedical.length > 0) {
      payload.medicalConditions = normalizedMedical;
    }

    if (member.userId) {
      payload.userId = member.userId;
    }
    if (member.phoneNumber) {
      payload.phoneNumber = member.phoneNumber;
    }
    return payload;
  });
}
