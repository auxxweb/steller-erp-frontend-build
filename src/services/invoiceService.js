import api from './api.js';

export const fetchInvoices = (params) => api.get('/invoices', { params });

export const fetchInvoice = (id) => api.get(`/invoices/${id}`);

export const updateInvoice = (id, payload) => api.patch(`/invoices/${id}`, payload);

export const finalizeInvoice = (id) => api.post(`/invoices/${id}/finalize`);

export const generateInvoiceFromRental = (rentalId) =>
  api.post(`/invoices/from-rental/${rentalId}`);

export const voidInvoice = (id, reason) => api.post(`/invoices/${id}/void`, { reason });

export const fetchWhatsAppUrl = (id) => api.get(`/invoices/${id}/whatsapp`);

/** Open printable HTML in a new tab (Save as PDF from print dialog). */
export const openInvoicePrint = async (id) => {
  const { data } = await api.get(`/invoices/${id}/html`, { responseType: 'text' });
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) throw new Error('Pop-up blocked — allow pop-ups to download PDF');
  win.document.write(data);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
};
