import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, User, Compass, Users, ChefHat, Star } from "lucide-react";
import { useEffect, useState } from "react";
import FloatingIcons from "../components/ui/FloatingIcons";

const features = [
  {
    icon: User,
    title: "Individual Mode",
    description: "Get personalized restaurant recommendations based on your mood and budget",
    emoji: "🎯",
  },
  {
    icon: Compass,
    title: "Explore Mode",
    description: "Discover trending spots and AI-powered suggestions",
    emoji: "🌟",
  },
  {
    icon: Users,
    title: "Group Mode",
    description: "Plan outings with friends and vote together",
    emoji: "👥",
  },
];

const stats = [
  { value: "500+", label: "Restaurants" },
  { value: "10K+", label: "Happy Users" },
  { value: "50K+", label: "Matches Made" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold">
              <span className="text-gradient">iam</span>
              <span className="text-foreground">hungry</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full text-foreground hover:text-primary transition-colors"
              >
                Sign In
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium shadow-glow-sm"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <FloatingIcons count={15} />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Restaurant Discovery
            </motion.span>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Find Your Perfect
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-red-600 bg-clip-text text-transparent block mt-2 font-extrabold drop-shadow-lg">
              Dining Experience
            </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              iamhungry uses AI to recommend restaurants based on your mood,
              budget and preferences. Plan solo adventures or group outings with ease.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-14 px-8 rounded-xl bg-primary text-primary-foreground text-lg font-semibold shadow-glow pulse-glow flex items-center gap-2"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-14 px-8 rounded-xl border border-border bg-card text-lg font-semibold hover:bg-muted transition-colors"
                >
                  I Have an Account
                </motion.button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Three Modes, Endless <span className="text-gradient">Possibilities</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're dining solo or with friends, iamhungry has the perfect mode for you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="card-float bg-card rounded-3xl p-8 h-full border border-border hover:border-primary/20">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-3xl"
                  >
                    {feature.emoji}
                  </motion.div>
                  <h3 className="text-2xl font-display font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl bg-animated p-12 md:p-16 text-center overflow-hidden"
          >
            <FloatingIcons count={8} />
            
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 mx-auto rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-6"
              >
                <ChefHat className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Ready to Find Your Match?
              </h2>

              <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of food lovers discovering their perfect dining experiences every day
              </p>

              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-14 px-8 rounded-xl bg-white text-primary font-semibold text-lg flex items-center gap-2 mx-auto shadow-lg"
                >
                  <Star className="w-5 h-5" />
                  Get Started Free
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-display font-bold">
                <span className="text-gradient">iam</span>
                <span className="text-foreground">hungry</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              © 2026 iamhungry. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}