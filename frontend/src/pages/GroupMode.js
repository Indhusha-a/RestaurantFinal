import { useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function GroupMode() {

  const availableUsers = ["Alex", "Emma", "John", "Sarah", "Michael", "Olivia"];
  const restaurants = ["Pizza Hub", "Burger Town", "Fine Dine Place", "Sushi World", "Taco Fiesta"];

  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMember, setNewMember] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [preferences, setPreferences] = useState({});
  const [votingActive, setVotingActive] = useState(false);
  const [votes, setVotes] = useState({});
  const [winner, setWinner] = useState(null);

  // ---------------- CREATE GROUP ----------------
  const handleCreate = () => {
    if (groupName.trim().length < 3) {
      alert("Group name must be at least 3 characters.");
      return;
    }

    if (groups.some(g => g.name.toLowerCase() === groupName.trim().toLowerCase())) {
      alert("Group name already exists.");
      return;
    }

    const newGroup = {
      id: groups.length + 1,
      name: groupName.trim(),
      members: ["You"]
    };

    setGroups([...groups, newGroup]);
    setGroupName("");
  };

  // ---------------- INVITE MEMBER ----------------
  const handleInvite = () => {
    if (!newMember) {
      alert("Select a member first.");
      return;
    }

    if (selectedGroup.members.length >= 5) {
      alert("Maximum 5 members allowed.");
      return;
    }

    if (selectedGroup.members.includes(newMember)) {
      alert("Member already added.");
      return;
    }

    const updatedGroup = {
      ...selectedGroup,
      members: [...selectedGroup.members, newMember]
    };

    setGroups(groups.map(g =>
      g.id === selectedGroup.id ? updatedGroup : g
    ));

    setSelectedGroup(updatedGroup);
    setNewMember("");
  };

  // ---------------- START SESSION ----------------
  const startSession = () => {
    if (selectedGroup.members.length < 2) {
      alert("Minimum 2 members required to start session.");
      return;
    }

    setSessionActive(true);
    setPreferences({});
    setVotingActive(false);
    setVotes({});
    setWinner(null);
  };

  // ---------------- SUBMIT PREFERENCES ----------------
  const submitPreferences = () => {
    for (let member of selectedGroup.members) {
      if (!preferences[member]?.craving || !preferences[member]?.budget) {
        alert("All members must select craving and budget.");
        return;
      }
    }
    setVotingActive(true);
  };

  // ---------------- CALCULATE WINNER ----------------
  const calculateWinner = () => {
    if (Object.keys(votes).length !== selectedGroup.members.length) {
      alert("All members must vote.");
      return;
    }

    const voteCount = {};
    Object.values(votes).forEach(vote => {
      voteCount[vote] = (voteCount[vote] || 0) + 1;
    });

    const winningRestaurant = Object.keys(voteCount)
      .reduce((a, b) => voteCount[a] > voteCount[b] ? a : b);

    setWinner(winningRestaurant);
  };

  // ---------------- RESET SESSION ----------------
  const resetSession = () => {
    setSessionActive(false);
    setVotingActive(false);
    setPreferences({});
    setVotes({});
    setWinner(null);
  };

  return (
    <div className="py-16 px-6">

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
        className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6"
      >
        <Users className="w-12 h-12 text-primary" />
      </motion.div>

      <h2 className="text-3xl font-display font-bold text-center mb-8">
        Group Mode
      </h2>

      {/* CREATE GROUP */}
      <div className="max-w-md mx-auto mb-10">
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
        />

        <button
          onClick={handleCreate}
          className="w-full bg-primary text-white py-3 rounded-lg"
        >
          Create Group
        </button>
      </div>

      {/* GROUP DETAILS */}
      {selectedGroup && (
        <div className="max-w-md mx-auto mb-8 border p-4 rounded-lg bg-white shadow">
          <h3 className="text-lg font-bold mb-2">{selectedGroup.name}</h3>

          <p className="font-semibold">Members ({selectedGroup.members.length}/5):</p>
          <ul className="mb-4 list-disc pl-5">
            {selectedGroup.members.map((member, i) => (
              <li key={i}>{member}</li>
            ))}
          </ul>

          {/* Invite */}
          <div className="mb-4">
            <select
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              className="w-full border rounded p-2 mb-2"
            >
              <option value="">Select member</option>
              {availableUsers.map((user, i) => (
                <option key={i} value={user}>{user}</option>
              ))}
            </select>

            <button
              onClick={handleInvite}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              Invite Member
            </button>
          </div>

          <button
            onClick={startSession}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Start Session
          </button>

          <button
            onClick={() => setSelectedGroup(null)}
            className="ml-3 text-sm text-gray-500"
          >
            Close
          </button>
        </div>
      )}

      {/* PREFERENCES */}
      {sessionActive && selectedGroup && !votingActive && (
        <div className="max-w-md mx-auto mb-8 border p-4 rounded-lg bg-gray-50 shadow">
          <h3 className="text-lg font-bold mb-4">Submit Preferences</h3>

          {selectedGroup.members.map((member, i) => (
            <div key={i} className="mb-4">
              <p className="font-semibold">{member}</p>

              <select
                className="w-full border rounded p-2 mb-2"
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    [member]: {
                      ...preferences[member],
                      craving: e.target.value
                    }
                  })
                }
              >
                <option value="">Select Craving</option>
                <option value="Pizza">Pizza</option>
                <option value="Burger">Burger</option>
                <option value="Asian">Asian</option>
                <option value="Fine Dining">Fine Dining</option>
              </select>

              <select
                className="w-full border rounded p-2"
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    [member]: {
                      ...preferences[member],
                      budget: e.target.value
                    }
                  })
                }
              >
                <option value="">Select Budget</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          ))}

          <button
            onClick={submitPreferences}
            className="bg-purple-600 text-white px-4 py-2 rounded w-full"
          >
            Submit Preferences
          </button>
        </div>
      )}

      {/* VOTING */}
      {votingActive && selectedGroup && (
        <div className="max-w-md mx-auto mb-8 border p-4 rounded-lg bg-gray-100 shadow">
          <h3 className="text-lg font-bold mb-4">Voting Phase</h3>

          {selectedGroup.members.map((member, i) => (
            <div key={i} className="mb-4">
              <p className="font-semibold">{member}</p>

              <select
                className="w-full border rounded p-2"
                onChange={(e) =>
                  setVotes({
                    ...votes,
                    [member]: e.target.value
                  })
                }
              >
                <option value="">Vote for restaurant</option>
                {restaurants.map((restaurant, idx) => (
                  <option key={idx} value={restaurant}>
                    {restaurant}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button
            onClick={calculateWinner}
            className="bg-red-600 text-white px-4 py-2 rounded w-full"
          >
            Calculate Winner
          </button>
        </div>
      )}

      {/* WINNER */}
      {winner && (
        <div className="max-w-md mx-auto border p-4 rounded-lg bg-green-100 shadow text-center">
          <h3 className="text-xl font-bold">🎉 Winner Selected!</h3>
          <p className="mt-2 text-lg">{winner}</p>

          <button
            onClick={resetSession}
            className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
          >
            End Session
          </button>
        </div>
      )}

      {/* GROUP LIST */}
      <div className="max-w-md mx-auto">
        {groups.length === 0 && (
          <p className="text-center text-muted-foreground">
            No groups created yet.
          </p>
        )}

        {groups.map(group => (
          <div
            key={group.id}
            onClick={() => setSelectedGroup(group)}
            className="border rounded-lg p-4 mb-4 shadow-sm cursor-pointer hover:bg-gray-50"
          >
            <h3 className="font-bold">{group.name}</h3>
            <p>Members: {group.members.length}</p>
          </div>
        ))}
      </div>

    </div>
  );
}