import { ProviderLayout } from '../../components/provider/ProviderLayout';
import { ProfileForm } from '../../components/provider/ProfileForm';

export function ProviderProfile() {
  return (
    <ProviderLayout title="Agency Profile">
      <ProfileForm />
    </ProviderLayout>
  );
}
