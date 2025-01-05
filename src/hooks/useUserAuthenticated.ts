import { useEffect, useState } from "react";

const useUserAuthenticated = () => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() ?? null; // safely return null if no cookie found
    }
    return null;
  }

  useEffect(() => {
    function checkUserAuthentication(): void {
      const cookieValue = getCookie("moirai_expiry");
      if (cookieValue) {
        setIsUserAuthenticated(true);
      } else {
        setIsUserAuthenticated(false);
      }
    }
    checkUserAuthentication();
  }, []);
  return { isUserAuthenticated };
};

export default useUserAuthenticated;
