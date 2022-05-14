module.exports = (request, response) => {
  setTimeout(() => {
    response.status(200).json(
      Array.from(Array(100), (_, index) => ({
        employeeNumber: Date.now() + index,
        firstName: `firstName_${index}`,
        lastName: `lastName_${index}`,
        middleName: `middleName_${index}`,
        email: `email${index}@gmail.com`,
        role: `role_${index}`,
        status: `status_${index}`,
      })),
    );
  }, 1000);
};
