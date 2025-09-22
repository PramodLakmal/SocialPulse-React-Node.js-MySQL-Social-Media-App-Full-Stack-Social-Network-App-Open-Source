import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';
import './App.css';


// Pages
import Login from './pages/Login';
import Register from './pages/register';
import Home from './pages/home';
import Profile from './pages/profile';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';

// Components
import Navbar from './components/Navbar';
import Leftbar from './components/Leftbar';
import Rightbar from './components/Rightbar';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import {
  QueryClient,
  QueryClientProvider,
  
} from '@tanstack/react-query';

function App() {


const { currentUser, loading } = useContext(AuthContext);

const queryClient = new QueryClient()


  const Layout = () => {
    return (
      <div>
        <QueryClientProvider client={queryClient}>

        <Navbar />
        <div style={{ display: 'flex' }}>
         <div style={{flex:2}}>
         <Leftbar />
          </div> 
          <div style={{flex:6}}><Outlet /></div>
          
          <div style={{flex:2}} ><Rightbar /></div>
          
        </div>
        </QueryClientProvider>
      </div>
    );
  };

  console.log("Current user:", currentUser)
  console.log("Loading state:", loading)
  
  // eslint-disable-next-line react/prop-types
  const ProtectedRoute = ({ children }) => {
    // Show loading spinner while checking authentication
    if (loading) {
      console.log("Showing loading spinner...");
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      );
    }
    
    // Only redirect to login if we're sure the user is not authenticated
    // and we're not in a loading state
    if (!loading && !currentUser) {
      console.log("No user found, redirecting to login");
      return <Navigate to="/login" replace />;
    }
    
    console.log("User authenticated, rendering protected content");
    return children;
  };

  // eslint-disable-next-line react/prop-types
  const AdminRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      );
    }
    
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    
    if (currentUser.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: '/profile/:id',
          element: <Profile />,
        },
      ],
    },
    {
      path: '/login',
      element: currentUser ? <Navigate to="/" replace /> : <Login />,
    },
    {
      path: '/register',
      element: currentUser ? <Navigate to="/" replace /> : <Register />,
    },
    {
      path: '/home',
      element: <ProtectedRoute>
        <Home />
      </ProtectedRoute>,
    },
    {
      path: '/admin',
      element: <AdminRoute>
        <AdminDashboardPage />
      </AdminRoute>,
    },
    {
      path: '/admin/users',
      element: <AdminRoute>
        <AdminUsersPage />
      </AdminRoute>,
    },
    {
      path: '/admin/posts',
      element: <AdminRoute>
        <AdminPostsPage />
      </AdminRoute>,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
