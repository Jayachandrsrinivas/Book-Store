const jwt = require('jsonwebtoken');

const protect = (roles = []) => {
  return (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bookversesecrettokenkey12345');
      req.user = decoded; // Contains id, email, role (user, seller, admin)

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  };
};

module.exports = { protect };
