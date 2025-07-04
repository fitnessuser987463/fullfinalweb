
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './context/AuthContext';
// import Landing from './components/pages/Landing';
// import Login from './components/pages/Login';
// import Home from './components/pages/Home';
// import Leaderboard from './components/pages/Leaderboard';
// import Submission from './components/pages/Submission';
// import Notifications from './components/pages/Notifications';
// import AdminDashboard from './components/admin/AdminPanel';
// import ProtectedRoute from './components/common/ProtectedRoute';
// import AdminRoute from './components/common/AdminRoute';
// import LoadingSpinner from './components/common/LoadingSpinner';

// function App() {
//   const { loading, isAuthenticated } = useAuth();

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           {/* Root route - redirect based on auth status */}
//           <Route 
//             path="/" 
//             element={
//               isAuthenticated ? <Navigate to="/home" replace /> : <Landing />
//             } 
//           />
          
//           {/* Public routes */}
//           <Route path="/landing" element={<Landing />} />
//           <Route path="/login" element={<Login />} />
          
//           {/* Protected routes */}
//           <Route
//             path="/home"
//             element={
//               <ProtectedRoute>
//                 <Home />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/leaderboard"
//             element={
//               <ProtectedRoute>
//                 <Leaderboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/submission/:challengeId"
//             element={
//               <ProtectedRoute>
//                 <Submission />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/notifications"
//             element={
//               <ProtectedRoute>
//                 <Notifications />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin"
//             element={
//               <AdminRoute>
//                 <AdminDashboard />
//               </AdminRoute>
//             }
//           />
          
//           {/* Catch-all route */}
//           <Route 
//             path="*" 
//             element={
//               isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
//             } 
//           />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './components/pages/Landing';
import Login from './components/pages/Login';
import Home from './components/pages/Home';
import AllChallenges from './components/pages/AllChallenges'; 
import Leaderboard from './components/pages/Leaderboard';
import Submission from './components/pages/Submission';
import Notifications from './components/pages/Notifications';
import AdminDashboard from './components/admin/AdminPanel';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Root route - redirect based on auth status */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Landing />
            } 
          />
          
          {/* Public routes */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          
          {/* NEW: All Challenges Route */}
          <Route
            path="/challenges"
            element={
              <ProtectedRoute>
                <AllChallenges />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submission/:challengeId"
            element={
              <ProtectedRoute>
                <Submission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          
          {/* Catch-all route */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;