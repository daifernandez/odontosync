import { AccountDeletionPanel } from "@/components/account-deletion-panel";
import { ProfileAvatarForm } from "@/components/profile-avatar-form";
import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { createClient } from "@/lib/supabase/server";
import { defaultInitialConfiguration } from "@/modules/initial-configuration/domain/initial-configuration";
import { getInitialConfiguration } from "@/modules/initial-configuration/repository";
import {
  getProfileAvatarPath,
  getProfileAvatarUrl,
} from "@/modules/profile-avatar/repository";

export default async function ProfileConfigurationPage() {
  const supabase = await createClient();
  const [storedConfiguration, avatarPath, { data: { user } }] = await Promise.all([
    getInitialConfiguration(),
    getProfileAvatarPath(),
    supabase.auth.getUser(),
  ]);
  const configuration = storedConfiguration ?? defaultInitialConfiguration;
  const avatarUrl = await getProfileAvatarUrl(avatarPath);

  return (
    <section aria-labelledby="profile-configuration-title">
      <h2 className="m-0 text-2xl leading-tight tracking-[-0.03em] sm:text-[1.75rem]" id="profile-configuration-title">Cuenta y perfil</h2>
      <p className="mt-1.5 mb-4 text-sm leading-6 text-[var(--color-muted)] sm:mt-2 sm:mb-5">
        Elegí cómo te identificás dentro de OdontoSync y en tus documentos.
      </p>
      <div className="grid gap-4 sm:gap-5">
        <ProfileAvatarForm avatarUrl={avatarUrl} fullName={configuration.fullName || "Cuenta OdontoSync"} />
        <ProfileSettingsForm
          initialProfile={{
            fullName: configuration.fullName,
            licenseNumber: configuration.licenseNumber,
            licenseJurisdiction: configuration.licenseJurisdiction,
          }}
        />
        {user?.email ? <AccountDeletionPanel email={user.email} /> : null}
      </div>
    </section>
  );
}
