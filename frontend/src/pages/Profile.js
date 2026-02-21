import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Mail, Phone, Calendar, MapPin, ArrowLeft, Edit2, Star, Clock, Users, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import FloatingIcons from "../components/ui/FloatingIcons";
import { userAPI } from "../services/api"; 

export default function Profile() {
  const [user, setUser] = useState({
    userId: null,
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    gender: "",
    avatarIcon: "neutral",
    joinedDate: "",
    points: 0,
    visits: 0,
    groups: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });

  useEffect(() => {
    // 1. Try to load from localStorage first for instant render
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Loaded from localStorage:", parsedUser);
        const mappedUser = mapDataToState(parsedUser);
        setUser(prev => ({ ...prev, ...mappedUser }));
        setEditForm(prev => ({ ...prev, ...mappedUser }));
      } catch (e) {
        console.error("Error parsing localStorage user", e);
      }
    }

    // 2. Fetch fresh data from API
    const fetchProfile = async () => {
      try {
        const data = await userAPI.getProfile();
        console.log("Fresh API Profile Data:", data); // Check Console!
        
        if (data) {
          const mappedUser = mapDataToState(data);
          setUser(mappedUser);
          setEditForm(mappedUser); // Sync edit form with fresh data
          localStorage.setItem('user', JSON.stringify(mappedUser));
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Only redirect to login if it's a 401 error (not 403)
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    };

    if (localStorage.getItem('token')) {
      fetchProfile();
    }
  }, []);

  // Helper to map API DTO to State cleanly
  const mapDataToState = (data) => {
    return {
      userId: data.userId || null,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      username: data.username || "",
      email: data.email || "", 
      phoneNumber: data.phoneNumber || data.phone || "", // Handle both keys
      gender: data.gender || "PREFER_NOT_TO_SAY",
      avatarIcon: data.avatarIcon || "neutral",
      joinedDate: data.createdAt || data.joinedDate || "",
      points: data.points || 0,
      visits: data.totalVisits || data.visits || 0,
      groups: data.groups || 0,
      isActive: data.isActive !== undefined ? data.isActive : true
    };
  };

  const handleSaveEdit = async () => {
    // Client-side validation
    const fName = editForm.firstName?.trim() || "";
    const lName = editForm.lastName?.trim() || "";
    const phone = editForm.phoneNumber?.trim() || "";

    if (!fName || !lName) {
      alert("Validation Error: First Name and Last Name cannot be empty.");
      return;
    }

    if (!phone || phone.length !== 10) {
      alert("Validation Error: Phone Number must be exactly 10 digits.");
      return;
    }

    let mappedGender = "PREFER_NOT_TO_SAY";
    if (editForm.gender) {
        const g = editForm.gender.toUpperCase();
        if (g === 'MALE') mappedGender = "Male";
        else if (g === 'FEMALE') mappedGender = "Female";
    }

    try {
      const cleanPayload = {
          userId: user.userId,
          firstName: fName,
          lastName: lName,
          username: user.username, 
          email: user.email,       
          phoneNumber: phone,
          gender: mappedGender,
          avatarIcon: editForm.avatarIcon || "neutral",
          isActive: true
      };

      console.log("Sending Update Payload:", cleanPayload);
      await userAPI.updateProfile(cleanPayload);
      
      // Refresh after update
      const freshData = await userAPI.getProfile();
      const mappedFresh = mapDataToState(freshData);
      
      setUser(mappedFresh);
      setEditForm(mappedFresh);
      localStorage.setItem('user', JSON.stringify(mappedFresh));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      const msg = error.response?.data?.message || error.message || "Unknown error";
      alert("Failed to update: " + msg);
    }
  };

  const handleDeleteRequest = async () => {
    try {
      await userAPI.requestDeletion();
      alert("Deletion request submitted.");
      setShowDeleteConfirm(false);
    } catch (error) {
      alert("Failed to submit deletion request");
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <FloatingIcons count={25} />
      
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/80 backdrop-blur-sm rounded-3xl border-2 border-border/50 shadow-xl p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <motion.div
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg"
              >
                {user.avatarIcon === "chef" ? "🧑‍🍳" : 
                 user.avatarIcon === "neutral" ? "👤" :
                 user.avatarIcon === "happy" ? "😊" :
                 user.avatarIcon === "cool" ? "😎" :
                 user.avatarIcon === "foodie" ? "🍔" : "👤"}
              </motion.div>

              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-muted-foreground mb-4">@{user.username || "username"}</p>
                
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{user.points}</span>
                    <span className="text-muted-foreground text-sm">points</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{user.visits}</span>
                    <span className="text-muted-foreground text-sm">visits</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{user.groups}</span>
                    <span className="text-muted-foreground text-sm">groups</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                   // Force sync edit form with current valid user data before opening
                   setEditForm({ ...user });
                   setIsEditing(true);
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </motion.button>
            </div>
          </motion.div>

          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/80 backdrop-blur-sm rounded-3xl border-2 border-border/50 shadow-xl p-8"
          >
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Full Name */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500/5 to-pink-500/5 rounded-xl border border-border/50">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500/5 to-pink-500/5 rounded-xl border border-border/50">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email || "Not provided"}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500/5 to-pink-500/5 rounded-xl border border-border/50">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{user.phoneNumber || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Joined */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500/5 to-pink-500/5 rounded-xl border border-border/50">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : "Recently"}</p>
                  </div>
                </div>

                {/* Gender */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500/5 to-pink-500/5 rounded-xl border border-border/50">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">
                      {user.gender === "PREFER_NOT_TO_SAY" ? "Prefer not to say" : user.gender}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500/5 to-pink-500/5 rounded-xl border border-border/50">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">Colombo, Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Request Account Deletion
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-3xl max-w-md w-full p-6 border-2 border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-display font-bold mb-4">Edit Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName || ""}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-border/50 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName || ""}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-border/50 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone (10 Digits)</label>
                  <input
                    type="tel"
                    maxLength="10"
                    placeholder="e.g. 0712345678"
                    value={editForm.phoneNumber || ""}
                    onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-border/50 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select
                    value={
                        (editForm.gender === "Male" || editForm.gender === "Female") 
                        ? editForm.gender 
                        : "Prefer not to say"
                    }
                    onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                    className="w-full p-3 rounded-xl border-2 border-border/50 focus:border-primary transition-all"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Choose Avatar</label>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { id: 'neutral', emoji: '👤', label: 'Neutral' },
                      { id: 'chef', emoji: '🧑‍🍳', label: 'Chef' },
                      { id: 'happy', emoji: '😊', label: 'Happy' },
                      { id: 'cool', emoji: '😎', label: 'Cool' },
                      { id: 'foodie', emoji: '🍔', label: 'Foodie' }
                    ].map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setEditForm({...editForm, avatarIcon: avatar.id})}
                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${
                          editForm.avatarIcon === avatar.id
                            ? 'bg-gradient-to-br from-orange-500 to-pink-500 ring-2 ring-primary ring-offset-2 scale-110'
                            : 'bg-muted/50 hover:bg-muted border-2 border-border/50 hover:border-primary/50'
                        }`}
                        title={avatar.label}
                      >
                        {avatar.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 border-2 border-border/50 rounded-xl font-semibold hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Delete Confirm Modal (omitted for brevity, assume unchanged) */}
    </div>
  );
}