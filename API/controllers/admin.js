import { db } from "../connect.js";

// Get all users with pagination and filtering
export const getAllUsers = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const role = req.query.role || '';
  const status = req.query.status || '';
  const offset = (page - 1) * limit;

  let whereConditions = [];
  let queryParams = [];

  if (search) {
    whereConditions.push("(u.username LIKE ? OR u.name LIKE ? OR u.email LIKE ?)");
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (role) {
    whereConditions.push("r.name = ?");
    queryParams.push(role);
  }

  if (status) {
    whereConditions.push("u.status = ?");
    queryParams.push(status);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ${whereClause}
  `;

  db.query(countQuery, queryParams, (err, countData) => {
    if (err) return res.status(500).json(err);

    const total = countData[0].total;

    // Get users with pagination
    const usersQuery = `
      SELECT u.id, u.username, u.email, u.name, u.status, u.createdAt, u.last_login,
             u.profilePic, u.city, u.website, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ${whereClause}
      ORDER BY u.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const paginationParams = [...queryParams, limit, offset];

    db.query(usersQuery, paginationParams, (err, users) => {
      if (err) return res.status(500).json(err);

      res.status(200).json({
        users,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_users: total,
          per_page: limit
        }
      });
    });
  });
};

// Get user by ID
export const getUserById = (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT u.*, r.name as role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = ?
  `;

  db.query(query, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    const { password, ...userWithoutPassword } = data[0];
    res.status(200).json(userWithoutPassword);
  });
};

// Update user status (ban/unban)
export const updateUserStatus = (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;

  if (!['active', 'inactive', 'banned'].includes(status)) {
    return res.status(400).json("Invalid status value!");
  }

  const query = "UPDATE users SET status = ?, updatedAt = NOW() WHERE id = ?";

  db.query(query, [status, userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.affectedRows === 0) return res.status(404).json("User not found!");

    res.status(200).json(`User status updated to ${status}`);
  });
};

// Update user role
export const updateUserRole = (req, res) => {
  const userId = req.params.id;
  const { role_id } = req.body;

  // Verify role exists
  const checkRoleQuery = "SELECT id FROM roles WHERE id = ?";
  db.query(checkRoleQuery, [role_id], (err, roleData) => {
    if (err) return res.status(500).json(err);
    if (roleData.length === 0) return res.status(404).json("Role not found!");

    const query = "UPDATE users SET role_id = ?, updatedAt = NOW() WHERE id = ?";

    db.query(query, [role_id, userId], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows === 0) return res.status(404).json("User not found!");

      res.status(200).json("User role updated successfully");
    });
  });
};

// Delete user
export const deleteUser = (req, res) => {
  const userId = req.params.id;
  const currentUserId = req.userInfo.id;

  // Prevent self-deletion
  if (parseInt(userId) === currentUserId) {
    return res.status(400).json("Cannot delete your own account!");
  }

  const query = "DELETE FROM users WHERE id = ?";

  db.query(query, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.affectedRows === 0) return res.status(404).json("User not found!");

    res.status(200).json("User deleted successfully");
  });
};

// Get all posts with filtering
export const getAllPosts = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const userId = req.query.userId || '';
  const offset = (page - 1) * limit;

  let whereConditions = [];
  let queryParams = [];

  if (search) {
    whereConditions.push("p.Desc LIKE ?");
    queryParams.push(`%${search}%`);
  }

  if (userId) {
    whereConditions.push("p.userid = ?");
    queryParams.push(userId);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM posts p ${whereClause}`;

  db.query(countQuery, queryParams, (err, countData) => {
    if (err) return res.status(500).json(err);

    const total = countData[0].total;

    // Get posts with user info
    const postsQuery = `
      SELECT p.*, u.username, u.name, u.profilePic,
             (SELECT COUNT(*) FROM likes WHERE postid = p.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE postid = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.userid = u.id
      ${whereClause}
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const paginationParams = [...queryParams, limit, offset];

    db.query(postsQuery, paginationParams, (err, posts) => {
      if (err) return res.status(500).json(err);

      res.status(200).json({
        posts,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_posts: total,
          per_page: limit
        }
      });
    });
  });
};

// Delete post
export const deletePost = (req, res) => {
  const postId = req.params.id;

  const query = "DELETE FROM posts WHERE id = ?";

  db.query(query, [postId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.affectedRows === 0) return res.status(404).json("Post not found!");

    res.status(200).json("Post deleted successfully");
  });
};

// Get all comments with filtering
export const getAllComments = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const postId = req.query.postId || '';
  const offset = (page - 1) * limit;

  let whereConditions = [];
  let queryParams = [];

  if (search) {
    whereConditions.push("c.desc LIKE ?");
    queryParams.push(`%${search}%`);
  }

  if (postId) {
    whereConditions.push("c.postid = ?");
    queryParams.push(postId);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM comments c ${whereClause}`;

  db.query(countQuery, queryParams, (err, countData) => {
    if (err) return res.status(500).json(err);

    const total = countData[0].total;

    // Get comments with user and post info
    const commentsQuery = `
      SELECT c.*, u.username, u.name, u.profilePic, p.Desc as post_desc
      FROM comments c
      JOIN users u ON c.userid = u.id
      JOIN posts p ON c.postid = p.id
      ${whereClause}
      ORDER BY c.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const paginationParams = [...queryParams, limit, offset];

    db.query(commentsQuery, paginationParams, (err, comments) => {
      if (err) return res.status(500).json(err);

      res.status(200).json({
        comments,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_comments: total,
          per_page: limit
        }
      });
    });
  });
};

// Delete comment
export const deleteComment = (req, res) => {
  const commentId = req.params.id;

  const query = "DELETE FROM comments WHERE id = ?";

  db.query(query, [commentId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.affectedRows === 0) return res.status(404).json("Comment not found!");

    res.status(200).json("Comment deleted successfully");
  });
};

// Get analytics data
export const getAnalytics = (req, res) => {
  const period = req.query.period || '30'; // days

  const analyticsQueries = [
    // Total users
    "SELECT COUNT(*) as total_users FROM users WHERE status = 'active'",
    
    // Total posts
    "SELECT COUNT(*) as total_posts FROM posts",
    
    // Total comments
    "SELECT COUNT(*) as total_comments FROM comments",
    
    // Total likes
    "SELECT COUNT(*) as total_likes FROM likes",
    
    // New users in period
    `SELECT COUNT(*) as new_users FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${period} DAY)`,
    
    // New posts in period
    `SELECT COUNT(*) as new_posts FROM posts WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${period} DAY)`,
    
    // Active users (logged in within period)
    `SELECT COUNT(*) as active_users FROM users WHERE last_login >= DATE_SUB(NOW(), INTERVAL ${period} DAY)`,
    
    // User registration trends (last 7 days)
    `SELECT DATE(createdAt) as date, COUNT(*) as count 
     FROM users 
     WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
     GROUP BY DATE(createdAt) 
     ORDER BY date`,
    
    // Post creation trends (last 7 days)
    `SELECT DATE(createdAt) as date, COUNT(*) as count 
     FROM posts 
     WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
     GROUP BY DATE(createdAt) 
     ORDER BY date`,
    
    // Top users by posts
    `SELECT u.id, u.username, u.name, COUNT(p.id) as post_count 
     FROM users u 
     LEFT JOIN posts p ON u.id = p.userid 
     GROUP BY u.id 
     ORDER BY post_count DESC 
     LIMIT 10`
  ];

  // Execute all queries in parallel
  const results = {};
  let completed = 0;

  const queryNames = [
    'total_users', 'total_posts', 'total_comments', 'total_likes',
    'new_users', 'new_posts', 'active_users', 'user_trends', 'post_trends', 'top_users'
  ];

  analyticsQueries.forEach((query, index) => {
    db.query(query, (err, data) => {
      if (err) {
        console.error(`Analytics query ${index} failed:`, err);
        results[queryNames[index]] = null;
      } else {
        if (index <= 6) {
          // Single value queries
          results[queryNames[index]] = data[0] ? Object.values(data[0])[0] : 0;
        } else {
          // Array result queries
          results[queryNames[index]] = data;
        }
      }

      completed++;
      if (completed === analyticsQueries.length) {
        res.status(200).json(results);
      }
    });
  });
};

// Get all roles
export const getAllRoles = (req, res) => {
  const query = "SELECT * FROM roles ORDER BY name";

  db.query(query, (err, data) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(data);
  });
};