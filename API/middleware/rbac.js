import { db } from "../connect.js";

// Middleware to check if user has specific permission
const hasPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.userInfo.id;

      // Get user's role and permissions
      const query = `
        SELECT p.name as permission_name, p.resource, p.action, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ? AND u.status = 'active'
      `;

      db.query(query, [userId], (err, data) => {
        if (err) {
          return res.status(500).json({ error: "Database error while checking permissions" });
        }

        const userPermissions = data.map(row => row.permission_name);
        
        if (userPermissions.includes(requiredPermission)) {
          next();
        } else {
          return res.status(403).json({ error: "Insufficient permissions" });
        }
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};

// Middleware to check if user has specific role
const hasRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userId = req.userInfo.id;

      const query = `
        SELECT r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ? AND u.status = 'active'
      `;

      db.query(query, [userId], (err, data) => {
        if (err) {
          return res.status(500).json({ error: "Database error while checking role" });
        }

        if (data.length === 0) {
          return res.status(404).json({ error: "User not found or inactive" });
        }

        const userRole = data[0].role_name;
        
        if (userRole === requiredRole) {
          next();
        } else {
          return res.status(403).json({ error: "Insufficient role privileges" });
        }
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};

// Middleware to check if user is admin
const isAdmin = hasRole('admin');

// Middleware to check if user is admin or moderator
const isAdminOrModerator = (req, res, next) => {
  const userId = req.userInfo.id;

  const query = `
    SELECT r.name as role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = ? AND u.status = 'active'
  `;

  db.query(query, [userId], (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Database error while checking role" });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: "User not found or inactive" });
    }

    const userRole = data[0].role_name;
    
    if (userRole === 'admin' || userRole === 'moderator') {
      next();
    } else {
      return res.status(403).json({ error: "Insufficient privileges" });
    }
  });
};

// Middleware to get user permissions and attach to request
const attachUserPermissions = (req, res, next) => {
  const userId = req.userInfo.id;

  const query = `
    SELECT p.name as permission_name, p.resource, p.action, r.name as role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = ? AND u.status = 'active'
  `;

  db.query(query, [userId], (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Database error while fetching permissions" });
    }

    req.userInfo.permissions = data.map(row => row.permission_name);
    req.userInfo.role = data.length > 0 ? data[0].role_name : 'user';
    next();
  });
};

// Helper function to check resource ownership
const isOwnerOrHasPermission = (resourceType, permission) => {
  return (req, res, next) => {
    const userId = req.userInfo.id;
    const resourceId = req.params.id;

    // First check if user has global permission
    if (req.userInfo.permissions && req.userInfo.permissions.includes(permission)) {
      return next();
    }

    // If no global permission, check ownership
    let ownershipQuery;
    switch (resourceType) {
      case 'post':
        ownershipQuery = 'SELECT userid FROM posts WHERE id = ?';
        break;
      case 'comment':
        ownershipQuery = 'SELECT userid FROM comments WHERE id = ?';
        break;
      case 'story':
        ownershipQuery = 'SELECT userid FROM stories WHERE id = ?';
        break;
      default:
        return res.status(400).json({ error: "Invalid resource type" });
    }

    db.query(ownershipQuery, [resourceId], (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Database error while checking ownership" });
      }

      if (data.length === 0) {
        return res.status(404).json({ error: "Resource not found" });
      }

      if (data[0].userid === userId) {
        next();
      } else {
        return res.status(403).json({ error: "Access denied: not owner and insufficient permissions" });
      }
    });
  };
};

export {
  hasPermission,
  hasRole,
  isAdmin,
  isAdminOrModerator,
  attachUserPermissions,
  isOwnerOrHasPermission
};