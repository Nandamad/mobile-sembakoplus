import UserApp from "./apps/user/App.jsx";
import DriverApp from "./apps/driver/App.jsx";

export default function RootApp() {
  return window.location.pathname.startsWith("/driver")
    ? <DriverApp />
    : <UserApp />;
}
