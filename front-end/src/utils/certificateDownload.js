import { api } from '../services/api';
export async function downloadCertificate(
  certificate,
  { administrator = false } = {}
) {
  const file = await api.get(
    `/${administrator ? 'certificates' : 'student/certificates'}/${encodeURIComponent(certificate.id)}/download`
  );
  if (file.mimeType !== 'application/pdf' || !file.content)
    throw new Error('The server did not return a certificate PDF.');
  const bytes = Uint8Array.from(atob(file.content), (character) =>
    character.charCodeAt(0)
  );
  const url = URL.createObjectURL(new Blob([bytes], { type: file.mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
