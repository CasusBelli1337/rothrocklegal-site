import type { IntakeController } from '@/lib/intake/use-intake';
import type { UploadBinding } from '@/lib/intake/use-uploads';

/** Every step screen receives the controller and the shared upload binding. */
export interface StepProps {
  intake: IntakeController;
  uploads: UploadBinding;
}
