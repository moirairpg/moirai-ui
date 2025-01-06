const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() ?? null; // safely return null if no cookie found
  }
  return null;
};

const isUserAuthenticated = () => {
  return !!getCookie("moirai_expiry");
};

export default isUserAuthenticated;
