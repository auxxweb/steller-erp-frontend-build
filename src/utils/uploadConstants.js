export const UPLOAD_ENDPOINTS = {
  products: '/uploads/products',
  productUnitImages: '/uploads/products/units',
  customerDocuments: '/uploads/customers/documents',
  userDocuments: '/uploads/users/documents',
  maintenance: '/uploads/maintenance',
  categories: '/uploads/categories',
  delete: '/uploads',
};

export const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp,image/gif,image/avif';
export const ACCEPT_DOCUMENTS = `${ACCEPT_IMAGES},application/pdf`;

export const UPLOAD_LIMITS = {
  productMaxFiles: 10,
  maintenanceMaxFiles: 10,
  customerMaxFiles: 5,
  categoryMaxFiles: 1,
  imageMaxMb: 10,
  documentMaxMb: 15,
};
