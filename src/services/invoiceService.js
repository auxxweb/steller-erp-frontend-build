import api from './api.js';

export const fetchInvoices = (params) => api.get('/invoices', { params });

export const fetchInvoice = (id) => api.get(`/invoices/${id}`);

export const updateInvoice = (id, payload) => api.patch(`/invoices/${id}`, payload);

export const finalizeInvoice = (id) => api.post(`/invoices/${id}/finalize`);

export const recordInvoicePayment = (id, payload) =>
  api.post(`/invoices/${id}/payments`, payload);

export const generateInvoiceFromRental = (rentalId) =>
  api.post(`/invoices/from-rental/${rentalId}`);

export const voidInvoice = (id, reason) => api.post(`/invoices/${id}/void`, { reason });

export const fetchWhatsAppUrl = (id) => api.get(`/invoices/${id}/whatsapp`);

/** Fetch the printable invoice HTML as a string. */
export const fetchInvoiceHtml = async (id) => {
  const { data } = await api.get(`/invoices/${id}/html`, { responseType: 'text' });
  return data;
};

/**
 * Open the printable invoice in a new tab, then trigger the print dialog
 * (from which the user can Save as PDF).
 *
 * The window is opened synchronously first so the browser treats it as a
 * user-initiated action and does not block it. We deliberately avoid the
 * `noopener` feature because it forces `window.open` to return `null`,
 * which would prevent us from writing the document.
 */
export const openInvoicePrint = async (id) => {
  const win = window.open('', '_blank');
  if (!win) {
    throw new Error('Pop-up blocked — allow pop-ups for this site to print the invoice');
  }

  win.document.write(
    '<!DOCTYPE html><html><head><title>Loading invoice…</title></head>' +
      '<body style="font-family:system-ui,sans-serif;padding:24px;color:#555">Preparing invoice…</body></html>',
  );
  win.document.close();

  try {
    const html = await fetchInvoiceHtml(id);
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
  } catch (err) {
    win.close();
    throw err;
  }
};

/** Download the invoice as a self-contained HTML file (opens/prints to PDF anywhere). */
export const downloadInvoiceHtml = async (id, invoiceNumber) => {
  const html = await fetchInvoiceHtml(id);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeName = String(invoiceNumber || id).replace(/[^a-zA-Z0-9._-]+/g, '_');
  anchor.href = url;
  anchor.download = `${safeName}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
