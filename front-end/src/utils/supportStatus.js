export function supportStatus(status) {
  return ['resolved', 'closed', 'rejected'].includes(
    String(status || '')
      .trim()
      .toLowerCase()
  )
    ? 'Resolved'
    : 'Pending';
}
