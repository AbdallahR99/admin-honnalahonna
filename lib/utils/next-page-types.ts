export type NextPageParams = {
  params: Promise<{ slug: string, id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
