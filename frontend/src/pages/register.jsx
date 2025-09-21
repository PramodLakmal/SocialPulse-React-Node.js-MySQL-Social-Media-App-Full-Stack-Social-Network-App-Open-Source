import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { AuthContext } from "../context/AuthContext";

const Register = () => {

    const [inputs, setInputs] = useState({
      username: "",
      email: "",
      password: "",
      name: "",
    });
    const [err, setErr] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { register, loading } = useContext(AuthContext);
  
    const handleChange = (e) => {
      setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
  
    const handleClick = async (e) => {
      e.preventDefault();
      setErr(null); // Clear previous errors
      setIsLoading(true);
  
      try {
        console.log("Attempting registration...");
        const userData = await register(inputs);
        
        if (userData) {
          console.log("Registration and auto-login successful, redirecting to home...");
          // Redirect to home page
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 100);
        }
        
      } catch (error) {
        console.error("Registration error:", error);
        setErr(error.response?.data || "Registration failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
  
    console.log(err)

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Register now!</h1>
          <p className="py-6">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
          <Link to="/login">
            <button className="btn btn-neutral">Login</button>
          </Link>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                placeholder="username"
                name="username"
                className="input input-bordered"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                name="email"
                className="input input-bordered"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="Name"
                name="name"
                className="input input-bordered"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                className="input input-bordered"
                name="password"
                onChange={handleChange}
                required
              />
              <label className="label">
                <a href="#" className="label-text-alt link link-hover">
                  Forgot password?
                </a>
              </label>
            </div>
            <div className="form-control mt-6">
              <span>{err && <div className="text-red-500 text-sm mb-2">{err}</div>}</span>
              <button 
                onClick={handleClick} 
                className={`btn btn-primary mb-4 ${(isLoading || loading) ? 'loading' : ''}`}
                disabled={isLoading || loading}
              >
                {(isLoading || loading) ? 'Creating Account...' : 'Register'}
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
  );
};

export default Register;
