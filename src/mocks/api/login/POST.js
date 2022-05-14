module.exports = (request, response) => {
  const { email, password } = request.body;
  setTimeout(() => {
    if (email === 'admin@gmail.com' && password === 'admin') {
      return response.status(200).json({
        msg: 'success',
        data: {
          userName: 'John Doe',
          email: 'john.doe@gmail.com',
        },
      });
    }
    return response
      .status(403)
      .json({ error: 'Email address or password is incorrect' });
  }, 1000);
};
