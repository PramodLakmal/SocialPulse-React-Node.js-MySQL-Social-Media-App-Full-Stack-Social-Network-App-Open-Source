import Posts from "../components/Posts"
import Share from "../components/Share"
import Stories from "../components/Stories"
import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"


const home = () => {
  const { currentUser, checkAuthStatus, loading } = useContext(AuthContext);

  // Force auth check when home page loads if user is null and not loading
  useEffect(() => {
    if (!currentUser && !loading) {
      // Small delay to ensure any OAuth redirects have completed
      const timer = setTimeout(() => {
        if (typeof checkAuthStatus === 'function') {
          checkAuthStatus();
        }
      }, 1000); // Increased delay for OAuth redirects
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, loading, checkAuthStatus]);

  return (
    <div className="place-items-center">  {/* it had grid  class */}
    
    <Stories />
    <Share/>
    <Posts component={(props) => <Posts userId={props.match.params.userId} />}/>

    </div>
  )
}

export default home