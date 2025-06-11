export class SupabasePaths {
  static readonly BASE =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://xcijvgwuzxhfwgszypyw.supabase.co";
  static readonly STORAGE = `${SupabasePaths.BASE}/storage/v1/object/public`;
  static readonly IMAGES = `${SupabasePaths.STORAGE}/images`;
  static readonly VIDEOS = `${SupabasePaths.STORAGE}/videos`;
  static readonly SERVICE_CATEGORIES = `${SupabasePaths.IMAGES}/service_categories`;
  static readonly SERVICE_PROVIDERS = `${SupabasePaths.IMAGES}/service_providers`;
  static readonly USERS = `${SupabasePaths.IMAGES}/users`;
  static readonly SERVICE_PROVIDERS_VIDEOS = `${SupabasePaths.VIDEOS}/service_providers`;
}

export class SupabaseStorageBuckets {
  static readonly IMAGES = {
    name: "images",
    folders: {
      SERVICE_CATEGORIES: "service_categories",
      SERVICE_PROVIDERS: "service_providers",
      USERS: "users",
    },
  };

  static readonly VIDEOS = {
    name: "videos",
    folders: {
      SERVICE_PROVIDERS: "service_providers",
    },
  };

  static readonly DOCUMENTS = {
    name: "documents",
    folders: {
      SERVICE_PROVIDERS: "service_providers",
    },
  };
}
