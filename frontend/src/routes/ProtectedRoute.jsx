import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

//function to check if the user is logged in and allowed to access a page
export default function ProtectedRoute({children, allowedRoles}) {
    //get current user
    const {currentUser} = useAuth();

    //if not logged in redirect to login page
    if(!currentUser){
        return <Navigate to="/login" replace />;
    }

    //if a specific user is not allowed to access a redirect to home
    if(allowedRoles && !allowedRoles.includes(currentUser.role)){
        return <Navigate to="/" replace />
    } 

    //if allowed rdirect to requested page
    return children;
}
