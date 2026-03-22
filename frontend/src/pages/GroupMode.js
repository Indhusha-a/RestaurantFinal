import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { authAPI, groupAPI, restaurantAPI } from "../services/api";
import FloatingIcons from "../components/ui/FloatingIcons";

export default function GroupMode() {
  const currentUser = authAPI.getCurrentUser();

  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteUsername, setInviteUsername] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [sessionId , setSessionId] = useState("");
  const [tags, setTags] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [result, setResult] = useState(null);
  const [topsisResult, setTopsisResult] = useState(null);

  const [userSearchResults, setUserSearchResults] = useState([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);

  const [preferenceForm, setPreferenceForm] = useState({
    craving: "",
    budgetRange: "",
    tagIds: []
  });

  const [voteForm, setVoteForm] = useState({
    restaurantId: "",
    isLiked: true
  });

  const currentUserId = currentUser?.userId;


  const getErrorMessage = (error, fallbackMessage) => {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return fallbackMessage;
  };





  const isLeader = useMemo(() => {
    if (!currentUserId || !members.length) return false;
    return members.some(
      (m) => m.user?.userId === currentUserId && m.role === "LEADER"
    );
  }, [members, currentUserId]);

  const memberNameMap = useMemo(() => {
    const map = {};
    members.forEach((member) => {
      if (member.user?.userId) {
        map[member.user.userId] = member.user.username;
      }
    });
    return map;
  }, [members]);

  const loadGroups = async () => {
    if (!currentUserId) return;
    try {
      const data = await groupAPI.getUserGroups(currentUserId);
      setGroups(data || []);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to load groups"));
    }
  };

  const loadInvitations = async () => {
    if (!currentUserId) return;
    try {
      const data = await groupAPI.getInvitations(currentUserId);
      setInvitations(data || []);
    } catch (error) {
      alert(getErrorMessage(error,"Failed to load invitations"));
    }
  };

  const loadTags = async () => {
    try {
      const data = await restaurantAPI.getTags();
      setTags(data || []);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to load tags"));
    }
  };

  const loadRestaurants = async () => {
    try {
      const data = await fetch("http://localhost:8080/api/restaurants");
      if (!data.ok) throw new Error("Failed to load restaurants");
      const json = await data.json();
      setRestaurants(json || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMembers = async (groupId) => {
    try {
      const data = await groupAPI.getGroupMembers(groupId);
      setMembers(data || []);
    } catch (error) {
      alert(getErrorMessage(error,  "Failed to load members"));
    }
  };

  useEffect(() => {
    loadGroups();
    loadInvitations();
    loadTags();
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (selectedGroup?.id) {
      loadMembers(selectedGroup.id);
    } else {
      setMembers([]);
    }
  }, [selectedGroup]);

  const handleCreateGroup = async () => {
    if (!currentUserId) {
      alert("User not logged in");
      return;
    }
    if (!groupName.trim()) {
      alert("Enter a group name");
      return;
    }

    try {
      const created = await groupAPI.createGroup(groupName.trim(), currentUserId);
      alert("Group created successfully");
      setGroupName("");
      await loadGroups();
      setSelectedGroup(created);
      await loadMembers(created.id);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to create group"));
    }
  };

  const handleInvite = async () => {
    if (!selectedGroup?.id) {
      alert("Select a group first");
      return;
    }
    if (!inviteUsername.trim()) {
      alert("Enter username to invite");
      return;
    }

    try {
      await groupAPI.inviteByUsername(
        selectedGroup.id,
        currentUserId,
        inviteUsername.trim()
      );
      alert("Invitation sent");
      setInviteUsername("");
      setUserSearchResults([]);
      setShowUserSuggestions(false);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to invite user"));
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await groupAPI.respondToInvitation(invitationId, "ACCEPT");
      alert("Invitation accepted");
      await loadInvitations();
      await loadGroups();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to accept invitation"));
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      await groupAPI.respondToInvitation(invitationId, "REJECT");
      alert("Invitation rejected");
      await loadInvitations();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to reject invitation"));
    }
  };

  const handleStartSession = async () => {
    if (!selectedGroup?.id) {
      alert("Select a group first");
      return;
    }

    try {
      const session = await groupAPI.startSession(selectedGroup.id, currentUserId);
      setSessionId(String(session.id));
      setResult(null);
      alert(`Session started. Session ID: ${session.id}`);
    } catch (error) {
      alert(getErrorMessage(error,"Failed to start session"));
    }
  };

  const handleTagToggle = (tagId) => {
    setPreferenceForm((prev) => {
      const exists = prev.tagIds.includes(tagId);

      if (exists) {
        return {
          ...prev,
          tagIds: prev.tagIds.filter((id) => id !== tagId)
        };
      }

      if (prev.tagIds.length >= 3) {
        alert("You can select up to 3 tags only");
        return prev;
      }

      return {
        ...prev,
        tagIds: [...prev.tagIds, tagId]
      };
    });
  };

  const handleSubmitPreference = async () => {
    if (!sessionId) {
      alert("Start a session first");
      return;
    }
    if (!preferenceForm.craving || !preferenceForm.budgetRange) {
      alert("Please fill craving and budget");
      return;
    }

    try {
      await groupAPI.submitPreference(
        Number(sessionId),
        currentUserId,
        preferenceForm.craving,
        preferenceForm.budgetRange,
        preferenceForm.tagIds
      );
      alert("Preference submitted");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to submit preference"));
    }
  };

  const handleSubmitVote = async () => {
    if (!sessionId) {
      alert("No active session");
      return;
    }
    if (!voteForm.restaurantId) {
      alert("Select a restaurant");
      return;
    }

    try {
      await groupAPI.submitVote(
        Number(sessionId),
        currentUserId,
        Number(voteForm.restaurantId),
        voteForm.isLiked
      );
      alert("Vote submitted");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to submit vote"));
    }
  };

  const handleGetResults = async () => {
    if (!sessionId) {
      alert("No session selected");
      return;
    }

    try {
      const data = await groupAPI.getSessionResults(Number(sessionId));
      setResult(data);
    } catch (error) {
      alert(getErrorMessage(error,"Failed to load results"));
    }
  };








    const handleSearchInviteUsers = async (value) => {
    setInviteUsername(value);

    if (!selectedGroup?.id || !value.trim()) {
      setUserSearchResults([]);
      setShowUserSuggestions(false);
      return;
    }

    try {
      const data = await groupAPI.searchUsersForInvite(
        selectedGroup.id,
        value.trim(),
        currentUserId
      );
      setUserSearchResults(data || []);
      setShowUserSuggestions(true);
    } catch (error) {
      console.error(error);
      setUserSearchResults([]);
      setShowUserSuggestions(false);
    }
  };



    const handleGenerateTopsis = async () => {
    if (!sessionId) {
      alert("No session selected");
      return;
    }

    try {
      const data = await groupAPI.generateTopsisRecommendations(Number(sessionId));
      setTopsisResult(data);
      alert("TOPSIS recommendations generated");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to generate TOPSIS recommendations"));
    }
  };





  const handleVoteFromRecommendation = async (restaurantId, isLiked) => {
    if (!sessionId) {
      alert("No active session");
      return;
    }

    try {
      await groupAPI.submitVote(
        Number(sessionId),
        currentUserId,
        Number(restaurantId),
        isLiked
      );
      alert(`Vote submitted for restaurant ${restaurantId}`);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to submit vote"));
    }
  };















  return (
  <div className="min-h-screen bg-background relative overflow-x-hidden">
    <FloatingIcons count={20} />

    <main className="container mx-auto px-4 py-12 relative z-10">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
        className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6"
      >
        <Users className="w-12 h-12 text-primary" />
      </motion.div>

      <h2 className="text-3xl font-display font-bold text-center mb-3">
        Group Mode
      </h2>

      <p className="text-center mb-8 text-gray-600">
        Logged in as: <strong>{currentUser?.username || "Unknown user"}</strong>
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="space-y-6">
          <div className="border rounded-lg p-4 bg-white shadow">
            <h3 className="text-lg font-bold mb-3">Create Group</h3>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border rounded-lg p-3 mb-3"
            />
            <button
              onClick={handleCreateGroup}
              className="w-full bg-primary text-white py-3 rounded-lg"
            >
              Create Group
            </button>
          </div>

          <div className="border rounded-lg p-4 bg-white shadow">
            <h3 className="text-lg font-bold mb-3">My Groups</h3>
            {groups.length === 0 ? (
              <p className="text-gray-500">No groups found.</p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => {
                    setSelectedGroup(group);
                    setResult(null);
                    setTopsisResult(null);
                  }}
                  className={`border rounded p-3 mb-2 cursor-pointer ${
                    selectedGroup?.id === group.id ? "bg-blue-50 border-blue-500" : ""
                  }`}
                >
                  <p className="font-semibold">{group.groupName}</p>
                  <p className="text-sm text-gray-600">Group ID: {group.id}</p>
                </div>
              ))
            )}
          </div>

          <div className="border rounded-lg p-4 bg-white shadow">
            <h3 className="text-lg font-bold mb-3">My Invitations</h3>
            {invitations.length === 0 ? (
              <p className="text-gray-500">No invitations found.</p>
            ) : (
              invitations.map((inv) => (
                <div key={inv.id} className="border rounded p-3 mb-2">
                  <p>
                    Group: <strong>{inv.group?.groupName}</strong>
                  </p>
                  <p>Status: {inv.status}</p>
                  {inv.status === "PENDING" && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAcceptInvitation(inv.id)}
                        className="bg-green-600 text-white px-3 py-2 rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectInvitation(inv.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          {selectedGroup && (
            <div className="border rounded-lg p-4 bg-white shadow">
              <h3 className="text-lg font-bold mb-3">
                Selected Group: {selectedGroup.groupName}
              </h3>

              <p className="font-semibold mb-2">Members</p>
              {members.length === 0 ? (
                <p className="text-gray-500">No members loaded.</p>
              ) : (
                <ul className="list-disc pl-5 mb-4">
                  {members.map((member) => (
                    <li key={member.id}>
                      {member.user?.username} - {member.role}
                    </li>
                  ))}
                </ul>
              )}

              {isLeader && (
                <>
                  <div className="mb-4">
                    {/* <input
                      type="text"
                      placeholder="Enter username to invite"
                      value={inviteUsername}
                      onChange={(e) => setInviteUsername(e.target.value)}
                      className="w-full border rounded p-3 mb-2"
                    />
                    <button
                      onClick={handleInvite}
                      className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                    >
                      Invite by Username
                    </button> */}




                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Enter username to invite"
                        value={inviteUsername}
                        onChange={(e) => handleSearchInviteUsers(e.target.value)}
                        onFocus={() => {
                          if (userSearchResults.length > 0) setShowUserSuggestions(true);
                        }}
                        className="w-full border rounded p-3 mb-2"
                      />

                      {showUserSuggestions && userSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
                          {userSearchResults.map((user) => (
                            <button
                              key={user.userId}
                              type="button"
                              onClick={() => {
                                setInviteUsername(user.username);
                                setShowUserSuggestions(false);
                              }}
                              className="block w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                            >
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-gray-500">
                                {user.firstName} {user.lastName}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {showUserSuggestions && inviteUsername.trim() && userSearchResults.length === 0 && (
                        <div className="absolute z-10 w-full bg-white border rounded shadow px-3 py-2 text-sm text-gray-500">
                          No matching users found
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleInvite}
                      className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                    >
                      Invite by Username
                    </button>
                  </div>

                  <button
                    onClick={handleStartSession}
                    className="bg-green-600 text-white px-4 py-2 rounded w-full"
                  >
                    Start Session
                  </button>
                </>
              )}
            </div>
          )}

          <div className="border rounded-lg p-4 bg-white shadow">
            <h3 className="text-lg font-bold mb-3">Submit My Preference</h3>

            <input
              type="number"
              placeholder="Enter active session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full border rounded p-3 mb-3"
            />


            <input
              type="text"
              placeholder="Craving"
              value={preferenceForm.craving}
              onChange={(e) =>
                setPreferenceForm((prev) => ({ ...prev, craving: e.target.value }))
              }
              className="w-full border rounded p-3 mb-3"
            />

            <select
              value={preferenceForm.budgetRange}
              onChange={(e) =>
                setPreferenceForm((prev) => ({ ...prev, budgetRange: e.target.value }))
              }
              className="w-full border rounded p-3 mb-3"
            >
              <option value="">Select Budget</option>
              <option value="ZERO_TO_1000">ZERO_TO_1000</option>
              <option value="ONE_TO_2000">ONE_TO_2000</option>
              <option value="TWO_TO_5000">TWO_TO_5000</option>
              <option value="FIVE_THOUSAND_PLUS">FIVE_THOUSAND_PLUS</option>
            </select>

            <p className="font-semibold mb-2">Select up to 3 tags</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {/* {tags.map((tag) => (
                <button
                  key={tag.tagId}
                  type="button"
                  onClick={() => handleTagToggle(tag.tagId)}
                  className={`px-3 py-2 rounded border ${
                    preferenceForm.tagIds.includes(tag.tagId)
                      ? "bg-blue-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {tag.tagName}
                </button>
              ))} */}

              {tags.map((tag) => {
                const tagId = tag.tagId ?? tag.id;
                const tagName = tag.tagName ?? tag.name;

                return (
                  <button
                    key={tagId}
                    type="button"
                    onClick={() => handleTagToggle(tagId)}
                    className={`px-3 py-2 rounded border ${
                      preferenceForm.tagIds.includes(tagId)
                        ? "bg-blue-600 text-white"
                        : "bg-white"
                    }`}
                  >
                    {tagName}
                  </button>
                );
              })}







            </div>

            <button
              onClick={handleSubmitPreference}
              className="bg-purple-600 text-white px-4 py-2 rounded w-full"
            >
              Submit Preference
            </button>
          </div>

          <div className="border rounded-lg p-4 bg-white shadow">
            <h3 className="text-lg font-bold mb-3">Submit Vote</h3>

            <select
              value={voteForm.restaurantId}
              onChange={(e) =>
                setVoteForm((prev) => ({ ...prev, restaurantId: e.target.value }))
              }
              className="w-full border rounded p-3 mb-3"
            >
              <option value="">Select Restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>

            <select
              value={voteForm.isLiked ? "true" : "false"}
              onChange={(e) =>
                setVoteForm((prev) => ({
                  ...prev,
                  isLiked: e.target.value === "true"
                }))
              }
              className="w-full border rounded p-3 mb-3"
            >
              <option value="true">LIKE</option>
              <option value="false">DISLIKE</option>
            </select>

            <button
              onClick={handleSubmitVote}
              className="bg-red-600 text-white px-4 py-2 rounded w-full mb-3"
            >
              Submit Vote
            </button>

            <button
              onClick={handleGenerateTopsis}
              className="bg-indigo-600 text-white px-4 py-2 rounded w-full mb-3"
            >
              Generate TOPSIS Recommendations
            </button>

            <button
              onClick={handleGetResults}
              className="bg-gray-800 text-white px-4 py-2 rounded w-full"
            >
              Get Session Result
            </button>
          </div>

          {topsisResult?.results && (
              <div className="border rounded-lg p-4 bg-blue-50 shadow">
                <h3 className="text-lg font-bold mb-3">TOPSIS Recommendations</h3>
                <p><strong>Session ID:</strong> {topsisResult.session_id}</p>
                <p><strong>Message:</strong> {topsisResult.message}</p>

                <div className="mt-4 space-y-3">
                  {topsisResult.results.map((item) => {
                    const restaurant = restaurants.find(
                      (r) => Number(r.id) === Number(item.restaurant_id)
                    );

                    return (
                      <div
                        key={item.restaurant_id}
                        className={`border rounded p-3 bg-white ${
                          item.rank === 1 ? "border-green-600 bg-green-50" : ""
                        }`}
                      >
                        {item.rank === 1 && (
                          <p className="text-green-700 font-bold">Top Recommendation</p>
                        )}
                        <p><strong>Restaurant ID:</strong> {item.restaurant_id}</p>
                        <p><strong>Restaurant Name:</strong> {restaurant?.name || "Unknown"}</p>
                        <p><strong>TOPSIS Score:</strong> {item.topsis_score}</p>
                        <p><strong>Group Match %:</strong> {item.group_match_percentage}</p>


                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleVoteFromRecommendation(item.restaurant_id, true)}
                            className="bg-green-600 text-white px-3 py-2 rounded"
                          >
                            Like
                          </button>

                          <button
                            onClick={() => handleVoteFromRecommendation(item.restaurant_id, false)}
                            className="bg-red-600 text-white px-3 py-2 rounded"
                          >
                            Dislike
                          </button>
                        </div>

                        <div className="mt-2">
                          <p className="font-semibold">Member Match %</p>
                          <ul className="list-disc pl-5">
                            {item.member_scores?.map((score, index) => (
                              <li key={index}>
                                {memberNameMap[score.user_id] || `User ${score.user_id}`}: {score.match_percentage}%
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {result && (
            <div className="border rounded-lg p-4 bg-green-50 shadow">
              <h3 className="text-lg font-bold mb-3">Session Result</h3>
              <p><strong>Session ID:</strong> {result.sessionId}</p>
              <p><strong>Group ID:</strong> {result.groupId}</p>
              <p><strong>Status:</strong> {result.status}</p>
              <p><strong>Total Votes:</strong> {result.totalVotes}</p>
              <p><strong>Winning Restaurant ID:</strong> {result.winningRestaurantId}</p>
              <p><strong>Winning Restaurant Name:</strong> {result.winningRestaurantName || "Not decided yet"}</p>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}