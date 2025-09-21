
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Login = () => {

  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });
  const [err, setErr] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

const navigate = useNavigate();
const location = useLocation();

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]); 

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const { login, loading } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr(null); // Clear previous errors
    setSuccessMessage(null); // Clear any success messages
    setIsLoading(true);
    
    try {
      console.log("Attempting login...");
      const userData = await login(inputs);
      console.log("Login successful, user data:", userData);
      
      if (userData) {
        console.log("Redirecting to home page...");
        // Small delay to ensure state is set
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErr(err.response?.data || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
    <div className="hero-content flex-col lg:flex-row-reverse">
      <div className="text-center lg:text-left">
        <h1 className="text-5xl font-bold">Welcome Back!</h1>
        <p className="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
        <Link to="/register">
      <button className="btn btn-neutral">Register</button>
    </Link>      
      </div>
      <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <form className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input type="usernamtext" placeholder="Username" name='username' onChange={handleChange} className="input input-bordered" required />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input type="password" placeholder="password" name='password' onChange={handleChange} className="input input-bordered" required />
            <label className="label">
              <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
            </label>
          </div>
          <div className="form-control mt-6">
            {successMessage && <div className="text-green-500 text-sm mb-2">{successMessage}</div>}
            {err && <div className="text-red-500 text-sm mb-2">{err}</div>}
            <button 
              onClick={handleLogin} 
              className={`btn btn-primary mb-4 ${(isLoading || loading) ? 'loading' : ''}`}
              disabled={isLoading || loading}
            >
              {(isLoading || loading) ? 'Logging in...' : 'Login'}
            </button>
            
            {/* Divider */}
            <div className="divider">OR</div>
            
            {/* Google Login Button */}
            <GoogleLoginButton />
          </div>
        </form>
      </div>
    </div>
  </div>
  )
}

export default Login