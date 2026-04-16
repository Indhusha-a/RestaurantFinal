// ===============================
// USERS
// ===============================
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


// ===============================
// RESTAURANT APPROVALS
// ===============================
export const restaurantApprovals = [
  {
    id: 1,
    restaurantName: "Cafe Aroma",
    address: "Colombo 07",
    phone: "0771234567",
    budgetRange: "LKR 1000 - 2000",
    description: "Cozy cafe with great coffee and desserts.",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814",
    location: "https://maps.google.com/?q=Colombo+07",
  },
  {
    id: 2,
    restaurantName: "Spicy Villa",
    address: "Kandy",
    phone: "0719876543",
    budgetRange: "LKR 2000 - 5000",
    description: "Authentic Sri Lankan spicy food with a modern touch.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    location: "https://maps.google.com/?q=Kandy",
  },
  {
    id: 3,
    restaurantName: "Ocean Spoon",
    address: "Galle",
    phone: "0754567890",
    budgetRange: "LKR 5000+",
    description: "Fresh seafood with a beautiful ocean view.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    location: "https://maps.google.com/?q=Galle",
  },
];


// ===============================
// BOOST REQUESTS
// ===============================
export const boostRequests = [
  {
    id: 1,
    restaurantName: "Cafe Aroma",
    duration: "7 Days",
    amount: "LKR 5000",
    address: "Colombo 07",
    phone: "0771234567",
    budgetRange: "LKR 1000 - 2000",
    description: "Cafe with best coffee.",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814",
    location: "https://maps.google.com/?q=Colombo+07",
  },
  {
    id: 2,
    restaurantName: "Spicy Villa",
    duration: "14 Days",
    amount: "LKR 8000",
    address: "Kandy",
    phone: "0719876543",
    budgetRange: "LKR 2000 - 5000",
    description: "Famous for spicy dishes.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    location: "https://maps.google.com/?q=Kandy",
  },
];


// ===============================
// MANAGE RESTAURANTS (OPTIONAL)
// ===============================
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