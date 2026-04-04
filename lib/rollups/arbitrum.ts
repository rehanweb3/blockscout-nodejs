export const verificationSteps = [
  { id: 'l1_confirmed', title: 'L1 Confirmed' },
  { id: 'sent', title: 'Sent to L1' },
  { id: 'confirmed', title: 'Confirmed' },
];

export const VERIFICATION_STEPS_MAP: Record<string, string> = {
  l1_confirmed: 'l1_confirmed',
  sent: 'sent',
  confirmed: 'confirmed',
};

export function getVerificationStepStatus(arbitrumData: { status?: string }): 'pending' | 'completed' {
  if (!arbitrumData?.status || arbitrumData.status === 'confirmed') return 'completed';
  return 'pending';
}
