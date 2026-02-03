import { ProviderLayout } from '../../components/provider/ProviderLayout';
import { ReferralForm } from '../../components/provider/ReferralForm';

export function NewReferral() {
  return (
    <ProviderLayout title="New Referral">
      <ReferralForm />
    </ProviderLayout>
  );
}
