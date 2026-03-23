// Dummy data for admin pages

export const users = [
  {
    id: 1,
    name: "Dilani Perera",
    email: "dilani@gmail.com",
    phone: "0771234567",
    status: "Active",
    deleteRequest: "Pending",
  },
  {
    id: 2,
    name: "Nimal Silva",
    email: "nimal@gmail.com",
    phone: "0719876543",
    status: "Active",
    deleteRequest: "None",
  },
  {
    id: 3,
    name: "Kavindi Fernando",
    email: "kavindi@gmail.com",
    phone: "0754567890",
    status: "Inactive",
    deleteRequest: "Pending",
  },
  {
    id: 4,
    name: "Ashen Peris",
    email: "ashen@gmail.com",
    phone: "0761112233",
    status: "Active",
    deleteRequest: "Rejected",
  },
];

export const boostRequests = [
  {
    id: 1,
    restaurantName: "Cafe Aroma",
    duration: "7 Days",
    status: "Pending",
  },
  {
    id: 2,
    restaurantName: "Spicy Villa",
    duration: "14 Days",
    status: "Approved",
  },
  {
    id: 3,
    restaurantName: "Urban Bites",
    duration: "3 Days",
    status: "Pending",
  },
];

export const restaurants = [
  {
    id: 1,
    name: "Cafe Aroma",
    location: "Colombo",
    status: "Pending",
  },
  {
    id: 2,
    name: "Spicy Villa",
    location: "Kandy",
    status: "Approved",
  },
];