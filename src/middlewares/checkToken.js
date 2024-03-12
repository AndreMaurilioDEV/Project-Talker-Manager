const validateToken = (req, res, next) => {
  console.log(req.headers.authorization);
  if (!req.headers.authorization) return res.status(401).json({ message: 'Token não encontrado' });
  
  if (typeof req.headers.authorization !== 'string' || req.headers.authorization.length !== 16) return res.status(401).json({ message: 'Token inválido' });
    
  next();
};
  
module.exports = validateToken;
