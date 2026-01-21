import { useEffect, useCallback } from "react";
import { unlockBadge, updateBadgeProgress, getUserBadges } from "@/components/BadgeSystem";
import { showBadgeNotification } from "@/components/BadgeNotification";

// Helper to check and track login streaks
const checkLoginStreak = () => {
  const today = new Date().toDateString();
  const lastLogin = localStorage.getItem("lastLoginDate");
  const currentStreak = parseInt(localStorage.getItem("loginStreak") || "0");
  
  if (lastLogin !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak: number;
    if (lastLogin === yesterday.toDateString()) {
      newStreak = currentStreak + 1;
    } else {
      newStreak = 1;
    }
    
    localStorage.setItem("lastLoginDate", today);
    localStorage.setItem("loginStreak", String(newStreak));
    
    // Update week streak badge progress
    updateBadgeProgress("week_streak", Math.min(newStreak, 7));
    if (newStreak >= 7) {
      const unlocked = unlockBadge("week_streak");
      if (unlocked) showBadgeNotification("week_streak");
    }
    
    // Update month streak badge progress
    updateBadgeProgress("month_streak", Math.min(newStreak, 30));
    if (newStreak >= 30) {
      const unlocked = unlockBadge("month_streak");
      if (unlocked) showBadgeNotification("month_streak");
    }
    
    // Check for early bird (before 7 AM)
    const hour = new Date().getHours();
    if (hour < 7) {
      const unlocked = unlockBadge("early_bird");
      if (unlocked) showBadgeNotification("early_bird");
    }
  }
};

// Track first login badge
const checkFirstLogin = () => {
  const hasVisited = localStorage.getItem("hasVisitedProfile");
  if (!hasVisited) {
    localStorage.setItem("hasVisitedProfile", "true");
    const unlocked = unlockBadge("first_login");
    if (unlocked) showBadgeNotification("first_login");
  }
};

export const useBadgeTracking = () => {
  useEffect(() => {
    checkFirstLogin();
    checkLoginStreak();
  }, []);

  // Track calendar event creation
  const trackCalendarEvent = useCallback(() => {
    const badges = getUserBadges();
    const calendarBadge = badges.find(b => b.id === "calendar_starter");
    if (calendarBadge && !calendarBadge.unlocked) {
      const unlocked = unlockBadge("calendar_starter");
      if (unlocked) showBadgeNotification("calendar_starter");
    }
  }, []);

  // Track mood logging
  const trackMoodLog = useCallback(() => {
    const moodDays = parseInt(localStorage.getItem("moodTrackedDays") || "0") + 1;
    localStorage.setItem("moodTrackedDays", String(moodDays));
    
    updateBadgeProgress("mood_tracker", Math.min(moodDays, 7));
    if (moodDays >= 7) {
      const unlocked = unlockBadge("mood_tracker");
      if (unlocked) showBadgeNotification("mood_tracker");
    }
    
    updateBadgeProgress("mood_master", Math.min(moodDays, 30));
    if (moodDays >= 30) {
      const unlocked = unlockBadge("mood_master");
      if (unlocked) showBadgeNotification("mood_master");
    }
  }, []);

  // Track forum post creation
  const trackForumPost = useCallback(() => {
    const postCount = parseInt(localStorage.getItem("forumPostCount") || "0") + 1;
    localStorage.setItem("forumPostCount", String(postCount));
    
    if (postCount === 1) {
      const unlocked = unlockBadge("first_forum_post");
      if (unlocked) showBadgeNotification("first_forum_post");
    }
    
    updateBadgeProgress("forum_regular", Math.min(postCount, 10));
    if (postCount >= 10) {
      const unlocked = unlockBadge("forum_regular");
      if (unlocked) showBadgeNotification("forum_regular");
    }
  }, []);

  // Track article reading
  const trackArticleRead = useCallback((articleId: string) => {
    const readArticles = JSON.parse(localStorage.getItem("readArticles") || "[]");
    if (!readArticles.includes(articleId)) {
      readArticles.push(articleId);
      localStorage.setItem("readArticles", JSON.stringify(readArticles));
      
      updateBadgeProgress("article_reader", Math.min(readArticles.length, 5));
      if (readArticles.length >= 5) {
        const unlocked = unlockBadge("article_reader");
        if (unlocked) showBadgeNotification("article_reader");
      }
    }
  }, []);

  // Track grade entry
  const trackGradeEntry = useCallback(() => {
    const badges = getUserBadges();
    const gradeBadge = badges.find(b => b.id === "grade_planner");
    if (gradeBadge && !gradeBadge.unlocked) {
      const unlocked = unlockBadge("grade_planner");
      if (unlocked) showBadgeNotification("grade_planner");
    }
  }, []);

  // Track Hugo coping exercises
  const trackHugoExercise = useCallback((category?: string) => {
    const exerciseCount = parseInt(localStorage.getItem("hugoExerciseCount") || "0") + 1;
    localStorage.setItem("hugoExerciseCount", String(exerciseCount));
    
    // First exercise badge
    if (exerciseCount === 1) {
      const unlocked = unlockBadge("first_hugo_exercise");
      if (unlocked) showBadgeNotification("first_hugo_exercise");
    }
    
    // Regular badge (10 exercises)
    updateBadgeProgress("hugo_regular", Math.min(exerciseCount, 10));
    if (exerciseCount >= 10) {
      const unlocked = unlockBadge("hugo_regular");
      if (unlocked) showBadgeNotification("hugo_regular");
    }
    
    // Master badge (25 exercises)
    updateBadgeProgress("hugo_master", Math.min(exerciseCount, 25));
    if (exerciseCount >= 25) {
      const unlocked = unlockBadge("hugo_master");
      if (unlocked) showBadgeNotification("hugo_master");
    }
    
    // Track category diversity
    if (category) {
      const usedCategories = JSON.parse(localStorage.getItem("hugoCategories") || "[]");
      if (!usedCategories.includes(category)) {
        usedCategories.push(category);
        localStorage.setItem("hugoCategories", JSON.stringify(usedCategories));
        
        updateBadgeProgress("hugo_all_categories", Math.min(usedCategories.length, 4));
        if (usedCategories.length >= 4) {
          const unlocked = unlockBadge("hugo_all_categories");
          if (unlocked) showBadgeNotification("hugo_all_categories");
        }
      }
    }
  }, []);

  // Track profile completion
  const trackProfileComplete = useCallback(() => {
    const username = localStorage.getItem("username");
    const hochschule = localStorage.getItem("hochschule");
    const studiengang = localStorage.getItem("studiengang");
    const interessen = localStorage.getItem("interessen");
    const gluecklich = localStorage.getItem("gluecklich");
    const profileImage = localStorage.getItem("profileImage");
    
    if (username && hochschule && studiengang && interessen && gluecklich && profileImage) {
      const unlocked = unlockBadge("profile_complete");
      if (unlocked) showBadgeNotification("profile_complete");
    }
  }, []);

  return {
    trackCalendarEvent,
    trackMoodLog,
    trackForumPost,
    trackArticleRead,
    trackGradeEntry,
    trackHugoExercise,
    trackProfileComplete
  };
};

export default useBadgeTracking;
