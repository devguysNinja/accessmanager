class ApiRoute {
  static API_ADMIN = process.env.REACT_APP_API_ADMIN;
  static FRONTEND_DOMAIN = window.location.origin;

   static API_DOMAIN = "https://namely-ace-beetle.ngrok-free.app" 
  // static API_DOMAIN = process.env.REACT_APP_API_DOMAIN || "http://localhost:8000"; // to be read from .env on PROD

  static BASE_PATH = "/api/v1";
  static BASE_URL = `${ApiRoute.API_DOMAIN}${ApiRoute.BASE_PATH}`;
  static PROFILE_URL = `${ApiRoute.BASE_URL}/profiles`;
  static PROFILE_CHOICES_URL = `${ApiRoute.BASE_URL}/profile-choices`;
  static DRINK_LIST_URL = `${ApiRoute.BASE_URL}/drink-list`;
  static ROSTERS_URL = `${ApiRoute.BASE_URL}/rosters/`;
  // static PROFILE_DETAILS_URL = `${ApiRoute.BASE_URL}/profiles/${id}`;
  static LOGIN_URL = `${ApiRoute.BASE_URL}/login`;
  static AUTH_USER_URL = `${ApiRoute.BASE_URL}/auth-user`;
  static LOGOUT_URL = `${ApiRoute.BASE_URL}/logout`;
  static REGISTER_URL = `${ApiRoute.BASE_URL}/register`;
  static AVATAR_URL = `${ApiRoute.BASE_URL}/avatar`;
  static TRANSACTION_LIST_URL = `${ApiRoute.BASE_URL}/transactions`;
  static TRANSACTION_ACTRL_URL = `${ApiRoute.BASE_URL}/transactions/access-control`;
  static TRANSACTION_OWNER_DETAILS_URL = `${ApiRoute.BASE_URL}/transactions/owner-details`;
}

export async function ApiLogout(url = ApiRoute.LOGOUT_URL, metd = "POST", cred = false) {
  try {
    await fetch(url, {
      method: metd,
      headers: { "Content-Type": "application/json" },
      credentials: cred ? "include" : "omit",
    });
    localStorage.removeItem("profile");
    localStorage.removeItem("jwt");

    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/login`);
  } catch (error) {
    console.log("!!!!!!!!!!!!!!!API Logout Error: ", error.message);
    localStorage.removeItem("profile");
    localStorage.removeItem("jwt");

    window.location.assign(`${ApiRoute.FRONTEND_DOMAIN}/`);
  }
}

export function Capitalize(params) {
  try {
    var inputString = params;
    var outputString = inputString.charAt(0).toUpperCase() + inputString.slice(1);
    return outputString;
  } catch (error) {
    return "Staff";
  }
}
const auth_token = JSON.parse(localStorage.getItem('jwt'))
export const BEARER = `Bearer ${auth_token}`

export default ApiRoute;
