/** Indian mobile numbers or domestic landlines including their leading zero. */
export const isBusinessPhone = (phone: string) => /^[6-9]\d{9}$/.test(phone) || /^0[1-9]\d{9}$/.test(phone);