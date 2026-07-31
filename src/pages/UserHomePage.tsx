import { Navigate } from "react-router-dom";

const CustomerRedirect = (): JSX.Element => <Navigate to="/cliente" replace />;

function UserHomePage(): JSX.Element {
  return <CustomerRedirect />;
}

export default UserHomePage;
