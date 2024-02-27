const search = new URLSearchParams(location.search);

export const admin = import.meta.env.VITE_ADMIN;
export const apiURL = search.get("api") || import.meta.env.VITE_API;
export const cloudlinkURL = search.get("cl") || import.meta.env.VITE_CLOUDLINK;
