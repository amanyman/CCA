export interface Provider {
  id: string;
  user_id: string;
  agency_name: string;
  address: string;
  phone: string;
  email: string;
  main_contact_name: string;
  main_contact_phone: string;
  main_contact_email: string;
  secondary_contact_name: string | null;
  secondary_contact_phone: string | null;
  secondary_contact_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProviderFormData {
  agency_name: string;
  address: string;
  phone: string;
  email: string;
  main_contact_name: string;
  main_contact_phone: string;
  main_contact_email: string;
  secondary_contact_name: string;
  secondary_contact_phone: string;
  secondary_contact_email: string;
}
