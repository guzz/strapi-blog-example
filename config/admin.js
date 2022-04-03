module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '76bc242985c951cdaa3333c5e91b04fb'),
  },
});
