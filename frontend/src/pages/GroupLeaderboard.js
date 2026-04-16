import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Medal, Users, ArrowLeft, Star, ChevronRight, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { leaderboardAPI } from "../services/api";
import FloatingIcons from "../components/ui/FloatingIcons";

const LeaderboardCard = ({ group, rank }) => {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`relative rounded-3xl p-6 transition-all hover:scale-[1.02] ${
        isFirst
          ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 shadow-xl shadow-yellow-500/20"
          : isSecond
          ? "bg-gradient-to-br from-gray-300/20 to-gray-400/20 border-2 border-gray-400/50 shadow-lg"
          : isThird
          ? "bg-gradient-to-br from-amber-700/20 to-amber-800/20 border-2 border-amber-700/50 shadow-lg"
          : "bg-white/60 backdrop-blur-md border border-border shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center justify-center min-w-[60px]">
          {isFirst ? (
            <Trophy className="w-10 h-10 text-yellow-500 mb-1" />
          ) : isSecond ? (
            <Medal className="w-8 h-8 text-gray-400 mb-1" />
          ) : isThird ? (
            <Medal className="w-8 h-8 text-amber-700 mb-1" />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>
          )}
        </div>

        <div className="flex-1">
          <h3 className={`text-xl font-bold ${isFirst ? 'text-yellow-700' : 'text-foreground'}`}>
            {group.groupName}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" /> {group.memberCount || 0} Members
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" /> Weekly rank #{group.rank || rank}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-500">
            {group.points || 0}
          </div>
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">
            Points
          </div>
        </div>

        <button className="p-3 bg-white/50 hover:bg-white rounded-full transition-colors border border-border">
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>
      </div>
    </motion.div>
  );
};

export default function GroupLeaderboard() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await leaderboardAPI.getLeaderboard();
      // Ensure we have an array and handle potential mapping objects
      const dataList = Array.isArray(data) ? data : (data.data || []);
      setGroups(dataList);
    } catch (err) {
      console.error(err);
      setError("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <FloatingIcons count={15} />

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-10 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-1">
              Group <span className="text-gradient">Leaderboard</span>
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> See which groups dine out the most
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.length === 0 ? (
              <div className="text-center p-12 bg-card/60 backdrop-blur-sm rounded-3xl border border-border">
                <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Groups Ranked Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start dining with your friends using Group Mode to climb the leaderboard!
                </p>
                <button 
                  onClick={() => navigate("/dashboard/group")}
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                >
                  Start Group Session
                </button>
              </div>
            ) : (
              // Display groups ranked
              groups.map((group, index) => (
                <LeaderboardCard key={group.groupId || index} group={group} rank={group.rank || index + 1} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
