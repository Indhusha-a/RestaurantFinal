 import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Crown,
  Mail,
  Plus,
  Sparkles,
  CheckCircle2,
  XCircle,
  Utensils,
  Vote,
  Trophy,
  Search,
  ChevronRight,
  UserPlus,
  PlayCircle,
  Layers3,
  Star,
  BadgeCheck,
  Clock3
} from "lucide-react";
import { authAPI, groupAPI, restaurantAPI } from "../services/api";
import FloatingIcons from "../components/ui/FloatingIcons";

const cardMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28 }
};

function SectionCard({ title, subtitle, icon: Icon, children, action }) {
  return (
    <motion.section
      {...cardMotion}
      className="rounded-3xl border border-primary/10 bg-white shadow-xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-primary/10 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="p-6">{children}</div>
    </motion.section>
  );
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-white px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5 ${className}`}
    >
      {children}
    </button>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 ${className}`}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 ${className}`}
    >
      {children}
    </select>
  );
}

function Badge({ children, tone = "default" }) {
  const styles = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
    purple: "bg-primary/15 text-primary"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}

export default function GroupMode() {
  const currentUser = authAPI.getCurrentUser();
  const currentUserId = currentUser?.userId;

  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteUsername, setInviteUsername] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [tags, setTags] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [result, setResult] = useState(null);
  const [topsisResult, setTopsisResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

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

  const [sessionStarted, setSessionStarted] = useState(false);
  const [preferenceSubmitted, setPreferenceSubmitted] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [topsisGenerated, setTopsisGenerated] = useState(false);
  const [recommendationVoted, setRecommendationVoted] = useState(false);

  const getErrorMessage = (error, fallbackMessage) => {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return fallbackMessage;
  };

  const showToast = (message) => setStatusMessage(message);

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

  const completionSteps = [
    { label: "Group selected", done: !!selectedGroup },
    { label: "Session started", done: sessionStarted || !!sessionId },
    { label: "Preference submitted", done: preferenceSubmitted },
    { label: "Vote submitted", done: voteSubmitted },
    { label: "Recommendations generated", done: topsisGenerated },
    { label: "Final result viewed", done: !!result }
  ];

  const showPreferenceSection = !!selectedGroup;
  const showTagsSection = showPreferenceSection && !!preferenceForm.budgetRange;
  const showVoteSection = preferenceSubmitted;
  const showTopsisButton = voteSubmitted;
  const showTopsisResults = topsisGenerated && topsisResult?.results;
  const showResultButton = recommendationVoted;

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
      alert(getErrorMessage(error, "Failed to load invitations"));
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
      alert(getErrorMessage(error, "Failed to load members"));
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

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(""), 2800);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const resetFlowStates = () => {
    setSessionId("");
    setResult(null);
    setTopsisResult(null);
    setSessionStarted(false);
    setPreferenceSubmitted(false);
    setVoteSubmitted(false);
    setTopsisGenerated(false);
    setRecommendationVoted(false);
    setPreferenceForm({ craving: "", budgetRange: "", tagIds: [] });
    setVoteForm({ restaurantId: "", isLiked: true });
  };

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
      setGroupName("");
      await loadGroups();
      setSelectedGroup(created);
      await loadMembers(created.id);
      resetFlowStates();
      showToast("Group created successfully");
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
      setInviteUsername("");
      setUserSearchResults([]);
      setShowUserSuggestions(false);
      await loadMembers(selectedGroup.id);
      await loadInvitations();
      showToast("Invitation sent");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to invite user"));
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await groupAPI.respondToInvitation(invitationId, "ACCEPT");
      await loadInvitations();
      await loadGroups();
      showToast("Invitation accepted");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to accept invitation"));
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      await groupAPI.respondToInvitation(invitationId, "REJECT");
      await loadInvitations();
      showToast("Invitation rejected");
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
      setTopsisResult(null);
      setSessionStarted(true);
      setPreferenceSubmitted(false);
      setVoteSubmitted(false);
      setTopsisGenerated(false);
      setRecommendationVoted(false);
      showToast(`Session started · ID ${session.id}`);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to start session"));
    }
  };

  const handleTagToggle = (tagId) => {
    setPreferenceForm((prev) => {
      const exists = prev.tagIds.includes(tagId);
      if (exists) {
        return { ...prev, tagIds: prev.tagIds.filter((id) => id !== tagId) };
      }
      if (prev.tagIds.length >= 3) {
        alert("You can select up to 3 tags only");
        return prev;
      }
      return { ...prev, tagIds: [...prev.tagIds, tagId] };
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
      setPreferenceSubmitted(true);
      showToast("Preference submitted");
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
      setVoteSubmitted(true);
      showToast("Vote submitted");
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
      showToast("Session result loaded");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to load results"));
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
      setTopsisGenerated(true);
      showToast("Recommendations generated");
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
      setRecommendationVoted(true);
      showToast(`Vote submitted for restaurant ${restaurantId}`);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to submit vote"));
    }
  };

  const budgetOptions = [
    { value: "ZERO_TO_1000", label: "Rs. 0 - Rs. 1000" },
    { value: "ONE_TO_2000", label: "Rs. 1000 - Rs. 2000" },
    { value: "TWO_TO_5000", label: "Rs. 2000 - Rs. 5000" },
    { value: "FIVE_THOUSAND_PLUS", label: "Rs. 5000 +" }
  ];

  const cravingOptions = [
    "Burger",
    "Pizza",
    "Kottu",
    "Rice and Curry",
    "Pasta",
    "Noodles",
    "Seafood",
    "Desserts",
    "Cafe Food"
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <FloatingIcons count={20} />

      {statusMessage ? (
        <div className="fixed right-5 top-5 z-50 rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm font-medium text-foreground shadow-xl">
          {statusMessage}
        </div>
      ) : null}

      <main className="container mx-auto px-4 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 overflow-hidden rounded-[32px] bg-gradient-to-r from-primary/95 via-primary to-primary/85 p-8 text-white shadow-2xl"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
                <Sparkles className="h-4 w-4" />
                Group dining recommendation workspace
              </div>
              <h1 className="text-3xl font-display font-bold tracking-tight sm:text-5xl">
                Group Mode
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
                Create a group, invite members, collect preferences, vote together,
                and generate a recommendation in one clean flow.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[360px]">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Logged in as</p>
                <p className="mt-2 text-lg font-semibold">{currentUser?.username || "Unknown user"}</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Role</p>
                <p className="mt-2 text-lg font-semibold">{isLeader ? "Leader" : "Member"}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">My Groups</p>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">{groups.length}</p>
          </div>
          <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Pending Invites</p>
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">
              {invitations.filter((i) => i.status === "PENDING").length}
            </p>
          </div>
          <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Selected Group</p>
              <Layers3 className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 truncate text-lg font-semibold text-foreground">
              {selectedGroup?.groupName || "No group selected"}
            </p>
          </div>
          <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Session</p>
              <Clock3 className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-lg font-semibold text-foreground">{sessionId || "Not started"}</p>
          </div>
        </motion.div>

        <div className="grid gap-8 xl:grid-cols-[1.02fr,1.38fr]">
          <div className="space-y-6">
            <SectionCard
              title="Create Group"
              subtitle="Start a new decision space for your friends or team"
              icon={Plus}
            >
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <PrimaryButton onClick={handleCreateGroup} className="w-full">
                  <Plus className="h-4 w-4" />
                  Create Group
                </PrimaryButton>
              </div>
            </SectionCard>

            <SectionCard
              title="My Groups"
              subtitle="Select a group to manage members and start the flow"
              icon={Users}
              action={<Badge tone="info">{groups.length} total</Badge>}
            >
              {groups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/5 p-6 text-sm text-muted-foreground">
                  No groups found yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map((group) => {
                    const active = selectedGroup?.id === group.id;
                    return (
                      <button
                        key={group.id}
                        onClick={() => {
                          setSelectedGroup(group);
                          resetFlowStates();
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-primary bg-primary text-white shadow-lg"
                            : "border-primary/15 bg-white hover:border-primary/35 hover:bg-primary/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{group.groupName}</p>
                            <p className={`mt-1 text-sm ${active ? "text-white/80" : "text-muted-foreground"}`}>
                              Group ID: {group.id}
                            </p>
                          </div>
                          <ChevronRight className={`h-4 w-4 ${active ? "text-white" : "text-primary"}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="My Invitations"
              subtitle="Accept or reject pending group invitations"
              icon={Mail}
            >
              {invitations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/5 p-6 text-sm text-muted-foreground">
                  No invitations found.
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{inv.group?.groupName}</p>
                          <p className="mt-1 text-sm text-muted-foreground">Invitation ID: {inv.id}</p>
                        </div>
                        <Badge
                          tone={
                            inv.status === "PENDING"
                              ? "warning"
                              : inv.status === "ACCEPTED"
                              ? "success"
                              : "danger"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </div>

                      {inv.status === "PENDING" && (
                        <div className="mt-4 flex gap-3">
                          <PrimaryButton onClick={() => handleAcceptInvitation(inv.id)} className="flex-1 bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Accept
                          </PrimaryButton>
                          <SecondaryButton onClick={() => handleRejectInvitation(inv.id)} className="flex-1 border-red-200 text-red-700 hover:bg-red-50">
                            <XCircle className="h-4 w-4" />
                            Reject
                          </SecondaryButton>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title="Workflow Progress"
              subtitle="A clearer view of the full group recommendation process"
              icon={Sparkles}
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {completionSteps.map((step, index) => (
                  <div
                    key={step.label}
                    className={`rounded-2xl border p-4 ${
                      step.done
                        ? "border-primary/20 bg-primary/10"
                        : "border-primary/10 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          step.done
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{step.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {step.done ? "Completed" : "Waiting"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {selectedGroup && (
              <SectionCard
                title={`Selected Group: ${selectedGroup.groupName}`}
                subtitle="Manage members, invite users, and begin a new session"
                icon={Layers3}
                action={isLeader ? <Badge tone="purple">Leader controls enabled</Badge> : <Badge>View only</Badge>}
              >
                <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-foreground">Members</h4>
                    </div>

                    {members.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/5 p-5 text-sm text-muted-foreground">
                        No members loaded.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-2xl border border-primary/10 bg-white px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {member.user?.username}
                              </p>
                              <p className="text-sm text-muted-foreground">User ID: {member.user?.userId}</p>
                            </div>
                            {member.role === "LEADER" ? (
                              <Badge tone="warning">
                                <span className="inline-flex items-center gap-1">
                                  <Crown className="h-3 w-3" /> LEADER
                                </span>
                              </Badge>
                            ) : (
                              <Badge>MEMBER</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isLeader && (
                    <div className="space-y-5">
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-foreground">Invite Members</h4>
                        </div>

                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="Search username to invite"
                            value={inviteUsername}
                            onChange={(e) => handleSearchInviteUsers(e.target.value)}
                            onFocus={() => {
                              if (userSearchResults.length > 0) setShowUserSuggestions(true);
                            }}
                            className="pr-11"
                          />
                          <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />

                          {showUserSuggestions && userSearchResults.length > 0 && (
                            <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-primary/10 bg-white p-2 shadow-2xl">
                              {userSearchResults.map((user) => (
                                <button
                                  key={user.userId}
                                  type="button"
                                  onClick={() => {
                                    setInviteUsername(user.username);
                                    setShowUserSuggestions(false);
                                  }}
                                  className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-primary/5"
                                >
                                  <div className="font-medium text-foreground">{user.username}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {user.firstName} {user.lastName}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {showUserSuggestions && inviteUsername.trim() && userSearchResults.length === 0 && (
                            <div className="absolute z-20 mt-2 w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm text-muted-foreground shadow-xl">
                              No matching users found
                            </div>
                          )}
                        </div>

                        <PrimaryButton onClick={handleInvite} className="mt-3 w-full">
                          <UserPlus className="h-4 w-4" />
                          Invite by Username
                        </PrimaryButton>
                      </div>

                      <div className="rounded-3xl border border-primary/15 bg-primary/5 p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <PlayCircle className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold text-foreground">Start Group Session</h4>
                        </div>
                        <p className="mb-4 text-sm leading-6 text-muted-foreground">
                          Start a decision session so members can submit preferences and vote on restaurants.
                        </p>
                        <PrimaryButton onClick={handleStartSession} className="w-full">
                          <PlayCircle className="h-4 w-4" />
                          Start Session
                        </PrimaryButton>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {showPreferenceSection && (
              <SectionCard
                title="Submit My Preference"
                subtitle="Provide your craving, budget, and preferred tags"
                icon={Utensils}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">Active Session ID</label>
                    <Input
                      type="number"
                      placeholder="Enter active session ID"
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Craving</label>
                    <Select
                      value={preferenceForm.craving}
                      onChange={(e) =>
                        setPreferenceForm((prev) => ({ ...prev, craving: e.target.value }))
                      }
                    >
                      <option value="">Select Craving</option>
                      {cravingOptions.map((craving) => (
                        <option key={craving} value={craving}>
                          {craving}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Budget Range</label>
                    <Select
                      value={preferenceForm.budgetRange}
                      onChange={(e) =>
                        setPreferenceForm((prev) => ({
                          ...prev,
                          budgetRange: e.target.value
                        }))
                      }
                    >
                      <option value="">Select Budget</option>
                      {budgetOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {showTagsSection && (
                  <div className="mt-5 rounded-3xl border border-primary/10 bg-primary/5 p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">Preferred Tags</p>
                        <p className="text-sm text-muted-foreground">Choose up to 3 tags</p>
                      </div>
                      <Badge tone="info">{preferenceForm.tagIds.length}/3 selected</Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const tagId = tag.tagId ?? tag.id;
                        const tagName = tag.tagName ?? tag.name;
                        const active = preferenceForm.tagIds.includes(tagId);

                        return (
                          <button
                            key={tagId}
                            type="button"
                            onClick={() => handleTagToggle(tagId)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                              active
                                ? "border-primary bg-primary text-white shadow"
                                : "border-primary/15 bg-white text-foreground hover:border-primary/35 hover:bg-primary/5"
                            }`}
                          >
                            {tagName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <PrimaryButton onClick={handleSubmitPreference} className="mt-5 w-full">
                  <BadgeCheck className="h-4 w-4" />
                  Submit Preference
                </PrimaryButton>
              </SectionCard>
            )}

            {showVoteSection && (
              <SectionCard
                title="Submit Vote"
                subtitle="Vote for a restaurant before generating recommendations"
                icon={Vote}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Restaurant</label>
                    <Select
                      value={voteForm.restaurantId}
                      onChange={(e) =>
                        setVoteForm((prev) => ({ ...prev, restaurantId: e.target.value }))
                      }
                    >
                      <option value="">Select Restaurant</option>
                      {restaurants.map((restaurant) => (
                        <option key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Vote</label>
                    <Select
                      value={voteForm.isLiked ? "true" : "false"}
                      onChange={(e) =>
                        setVoteForm((prev) => ({
                          ...prev,
                          isLiked: e.target.value === "true"
                        }))
                      }
                    >
                      <option value="true">Like</option>
                      <option value="false">Dislike</option>
                    </Select>
                  </div>
                </div>

                <PrimaryButton onClick={handleSubmitVote} className="mt-5 w-full">
                  <Vote className="h-4 w-4" />
                  Submit Vote
                </PrimaryButton>
              </SectionCard>
            )}

            {showTopsisButton && (
              <SectionCard
                title="Generate TOPSIS Recommendations"
                subtitle="Run TOPSIS after votes are submitted"
                icon={Sparkles}
              >
                <PrimaryButton onClick={handleGenerateTopsis} className="w-full">
                  <Sparkles className="h-4 w-4" />
                  Generate TOPSIS Recommendations
                </PrimaryButton>
              </SectionCard>
            )}

            {showTopsisResults && (
              <SectionCard
                title="TOPSIS Recommendations"
                subtitle="Ranked restaurant recommendations for the selected session"
                icon={Trophy}
                action={<Badge tone="success">{topsisResult.results.length} results</Badge>}
              >
                <div className="mb-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-sm text-primary">Session ID</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{topsisResult.session_id}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-sm text-primary">Message</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{topsisResult.message}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {topsisResult.results.map((item) => {
                    const restaurant = restaurants.find(
                      (r) => Number(r.id) === Number(item.restaurant_id)
                    );

                    return (
                      <div
                        key={item.restaurant_id}
                        className={`rounded-3xl border p-5 shadow-sm ${
                          item.rank === 1
                            ? "border-primary/25 bg-primary/5"
                            : "border-primary/10 bg-white"
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              {item.rank === 1 ? (
                                <Badge tone="success">
                                  <span className="inline-flex items-center gap-1">
                                    <Star className="h-3 w-3" /> Top Recommendation
                                  </span>
                                </Badge>
                              ) : (
                                <Badge tone="info">Rank #{item.rank}</Badge>
                              )}
                            </div>
                            <h4 className="text-xl font-semibold text-foreground">
                              {restaurant?.name || "Unknown Restaurant"}
                            </h4>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl bg-primary/5 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Restaurant ID</p>
                                <p className="mt-1 font-semibold text-foreground">{item.restaurant_id}</p>
                              </div>
                              <div className="rounded-2xl bg-primary/5 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">TOPSIS Score</p>
                                <p className="mt-1 font-semibold text-foreground">{item.topsis_score}</p>
                              </div>
                              <div className="rounded-2xl bg-primary/5 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Group Match</p>
                                <p className="mt-1 font-semibold text-foreground">{item.group_match_percentage}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[240px] lg:grid-cols-1">
                            <PrimaryButton
                              onClick={() => handleVoteFromRecommendation(item.restaurant_id, true)}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Like
                            </PrimaryButton>
                            <SecondaryButton
                              onClick={() => handleVoteFromRecommendation(item.restaurant_id, false)}
                              className="w-full border-red-200 text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                              Dislike
                            </SecondaryButton>
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                          <p className="mb-3 font-semibold text-foreground">Member Match %</p>
                          <div className="space-y-2">
                            {item.member_scores?.map((score, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded-xl bg-white px-4 py-3"
                              >
                                <span className="text-sm font-medium text-foreground">
                                  {memberNameMap[score.user_id] || `User ${score.user_id}`}
                                </span>
                                <Badge tone="purple">{score.match_percentage}%</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {showResultButton && (
              <SectionCard
                title="Final Session Result"
                subtitle="Load the final outcome after recommendation voting"
                icon={Trophy}
              >
                <PrimaryButton onClick={handleGetResults} className="w-full">
                  <Trophy className="h-4 w-4" />
                  Get Session Result
                </PrimaryButton>
              </SectionCard>
            )}

            {result && (
              <SectionCard
                title="Session Result Summary"
                subtitle="Final winning restaurant for the selected session"
                icon={Trophy}
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-sm text-muted-foreground">Session ID</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{result.sessionId}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-sm text-muted-foreground">Group ID</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{result.groupId}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{result.status}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-sm text-muted-foreground">Total Votes</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{result.totalVotes}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                    <p className="text-sm text-muted-foreground">Winning Restaurant ID</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{result.winningRestaurantId}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <p className="text-sm text-primary">Winning Restaurant</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {result.winningRestaurantName || "Not decided yet"}
                    </p>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
