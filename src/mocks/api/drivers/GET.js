module.exports = (request, response) => {
  setTimeout(() => {
    response.status(200).json(
      Array.from(Array(100), (_, index) => ({
        driver_id: `driver_id ${index}`,
        user_id: `user_id ${index}`,
        phone_number: `phone_number ${index}`,
        email: `email ${index}`,
        registration_form: `registration_form ${index}`,
        terms_condition_accepted_at: `terms_condition_accepted_at ${index}`,
        delivery_cluster: `deliveryCluster ${index}`,
        delivery_city: `deliveryCity ${index}`,
        delivery_area: `delivery_area ${index}`,
        license_restriction: `license_restriction ${index}`,
        driver_status: index % 2 === 0 ? 'Active' : 'Inactive',
        status: index % 2 === 0 ? 'Active' : 'Inactive',
        approval_status:
          index % 3 === 0
            ? 'Pending'
            : index % 2 === 0
            ? 'Approved'
            : 'Rejected',
        profile: {
          driver_id: `driver_id ${index}`,
          picture: `picture ${index}`,
          address: `address ${index}`,
          city: `city ${index}`,
          province: `province ${index}`,
          driver_group: `driver_group ${index}`,
          first_name: `firstName ${index}`,
          middle_name: `middleName ${index}`,
          last_name: `lastName ${index}`,
          location: `location ${index}`,
        },
        vehicles: {
          vehicle_id: `vehicle_id ${index}`,
          driver_id: `driver_id ${index}`,
          vehicle_model: `vehicle_model ${index}`,
          vehicle_type: `vehicle_type ${index}`,
          registered_plate_number: `registered_plate_number ${index}`,
          status: index % 2 === 0 ? 'Active' : 'Inactive',
        },
        settings: {
          driver_id: `settings driver_id ${index}`,
          commission_rate: `settings commission_rate ${index}`,
          min_wallet_balance: `settings min_wallet_balance ${index}`,
        },
      })),
    );
  }, 1000);
};
