import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import UserProfilePopup from "@/components/UserProfilePopup";
import ForumCustomization from "@/components/ForumCustomization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft, Users, UserCheck, HeartHandshake, MessageCircle, Pencil, Trash2, X, Check, Plus, Paintbrush, Search, ChevronDown, ChevronUp } from "lucide-react";
import slothDecoration from "@/assets/sloth-decoration.png";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import useBadgeTracking from "@/hooks/useBadgeTracking";

// Types
interface ChatMessage {
  sender: string;
  text: string;
  timestamp: Date;
}
interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  messages: ChatMessage[];
}
interface Mentor {
  id: string;
  name: string;
  description: string;
  image: string;
  field: string;
  connected: boolean;
}
interface Berater {
  id: string;
  name: string;
  organization: string;
  description: string;
  image: string;
}
interface Peer {
  id: string;
  name: string;
  studiengang: string;
  semester: number;
  image: string;
  connected: boolean;
}
interface FriendData {
  name: string;
  image: string;
  studiengang?: string;
  semester?: number;
  isOnline: boolean;
}
interface PostComment {
  id: string;
  author: string;
  authorImage: string;
  content: string;
  timeAgo: string;
  isAnonymous?: boolean;
}
interface SuggestedPost {
  id: string;
  author: string;
  authorImage: string;
  title: string;
  content: string;
  category: string;
  timeAgo: string;
  comments: PostComment[];
  isAnonymous?: boolean;
  isUserCreated?: boolean;
}

// Mock Data
// Avatar URLs for anonymous students
// Lizenzfreie Unsplash-Bilder für anonyme Studenten
const studentAvatars = {
  // Haustiere
  cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop",
  dog: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop",
  bunny: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=100&h=100&fit=crop",
  hamster: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=100&h=100&fit=crop",
  // Landschaften & Natur
  sunset: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=100&h=100&fit=crop",
  mountains: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=100&h=100&fit=crop",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop",
  forest: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=100&h=100&fit=crop",
  // Kunst & Kreatives
  painting: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=100&h=100&fit=crop",
  galaxy: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=100&h=100&fit=crop",
  neonCity: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=100&h=100&fit=crop",
  abstract: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=100&h=100&fit=crop",
  // Essen & Lifestyle
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop",
  plants: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=100&h=100&fit=crop",
  books: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&h=100&fit=crop",
  music: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop"
};
const groups: Group[] = [{
  id: "mathe-lerngruppe",
  name: "Mathe Lerngruppe",
  description: "Gemeinsam durch Analysis und Lineare Algebra",
  memberCount: 24,
  messages: [{
    sender: "PixelPanda",
    text: "Hat jemand die Übungsblätter von letzter Woche?",
    timestamp: new Date()
  }, {
    sender: "CosmicCoder",
    text: "Ja, ich schick sie dir gleich!",
    timestamp: new Date()
  }, {
    sender: "NeonNinja",
    text: "Treffen wir uns morgen in der Bib?",
    timestamp: new Date()
  }]
}, {
  id: "informatik-projekte",
  name: "Informatik Projekte",
  description: "Projektpartner und Coding-Buddies finden",
  memberCount: 45,
  messages: [{
    sender: "ByteBandit",
    text: "Suche noch Leute für Web-Dev Projekt",
    timestamp: new Date()
  }, {
    sender: "QuantumQuokka",
    text: "Welches Framework nutzt ihr?",
    timestamp: new Date()
  }]
}, {
  id: "dnd-gruppe",
  name: "DnD Spielrunde",
  description: "Dungeons & Dragons Enthusiasten",
  memberCount: 12,
  messages: [{
    sender: "DragonDreamer",
    text: "Session 0 nächsten Freitag?",
    timestamp: new Date()
  }]
}];
const allMentors: Mentor[] = [{
  id: "1",
  name: "Lisa",
  description: "UX/UI Designerin bei einer Digitalagentur. Hilft bei Portfolio-Aufbau und Designfragen.",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  field: "Digital Media / UX Design",
  connected: false
}, {
  id: "2",
  name: "Max",
  description: "Motion Designer bei einem Streaming-Dienst. Tipps für After Effects und Cinema 4D.",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  field: "Digital Media / Motion Design",
  connected: false
}, {
  id: "3",
  name: "Michael",
  description: "Software Engineer bei einem Tech-Startup. Tipps für den Einstieg in die Tech-Branche.",
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  field: "Informatik / Web Development",
  connected: true
}, {
  id: "4",
  name: "Sarah",
  description: "Creative Director bei einer Werbeagentur. Expertise in Branding und Kampagnen.",
  image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
  field: "Digital Media / Creative Direction",
  connected: false
}, {
  id: "5",
  name: "Jonas",
  description: "Full-Stack Developer, arbeitet remote für ein US-Startup. Tipps für Freelancing.",
  image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face",
  field: "Informatik / Full-Stack",
  connected: true
}];
const berater: Berater[] = [{
  id: "1",
  name: "Frau Dr. Koch",
  organization: "Psychologische Beratung",
  description: "Unterstützung bei Stress, Prüfungsangst und persönlichen Herausforderungen.",
  image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face"
}, {
  id: "2",
  name: "Herr Müller",
  organization: "Studienberatung",
  description: "Fragen zu Studienverlauf, Fachwechsel und Prüfungsordnung.",
  image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face"
}, {
  id: "3",
  name: "Frau Schmidt",
  organization: "Career Center",
  description: "Bewerbungsunterlagen, Praktika und Berufseinstieg.",
  image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face"
}];
const allPeers: Peer[] = [{
  id: "1",
  name: "StellarSloth",
  studiengang: "Digital Media",
  semester: 4,
  image: studentAvatars.cat,
  connected: true
}, {
  id: "2",
  name: "NeonNomad",
  studiengang: "Digital Media",
  semester: 6,
  image: studentAvatars.sunset,
  connected: false
}, {
  id: "3",
  name: "PixelPhoenix",
  studiengang: "Digital Media",
  semester: 3,
  image: studentAvatars.galaxy,
  connected: false
}, {
  id: "4",
  name: "ByteBard",
  studiengang: "Informatik",
  semester: 5,
  image: studentAvatars.dog,
  connected: false
}, {
  id: "5",
  name: "CloudCrafter",
  studiengang: "Informatik",
  semester: 3,
  image: studentAvatars.mountains,
  connected: true
}, {
  id: "6",
  name: "WaveWizard",
  studiengang: "Digital Media",
  semester: 2,
  image: studentAvatars.beach,
  connected: false
}];
const allSuggestedPosts: SuggestedPost[] = [{
  id: "1",
  author: "DesignDragon",
  authorImage: studentAvatars.neonCity,
  title: "Figma vs. Adobe XD - Was nutzt ihr?",
  content: "Bin am Überlegen, ob ich komplett auf Figma umsteigen soll. Was sind eure Erfahrungen mit beiden Tools?",
  category: "Digital Media",
  timeAgo: "vor 2 Stunden",
  comments: [{
    id: "c1",
    author: "PixelPrincess",
    authorImage: studentAvatars.bunny,
    content: "Figma ist der Standard in der Branche mittlerweile, definitiv wechseln!",
    timeAgo: "vor 1 Stunde"
  }, {
    id: "c2",
    author: "AdobeAstronaut",
    authorImage: studentAvatars.painting,
    content: "XD ist gut wenn du schon Adobe CC hast, aber Figma hat bessere Collab-Features.",
    timeAgo: "vor 30 Minuten"
  }]
}, {
  id: "2",
  author: "MotionMystic",
  authorImage: studentAvatars.forest,
  title: "After Effects Lerngruppe gesucht",
  content: "Wer hat Lust, zusammen Motion Design Skills zu verbessern? Könnten uns wöchentlich treffen und Projekte besprechen.",
  category: "Digital Media",
  timeAgo: "vor 4 Stunden",
  comments: [{
    id: "c1",
    author: "AnimationAlpha",
    authorImage: studentAvatars.coffee,
    content: "Bin dabei! Hab gerade mit Character Animation angefangen.",
    timeAgo: "vor 2 Stunden"
  }]
}, {
  id: "3",
  author: "CodeComet",
  authorImage: studentAvatars.abstract,
  title: "React oder Vue für Portfolio-Website?",
  content: "Möchte meine Portfolio-Seite neu bauen. Was würdet ihr empfehlen - React oder Vue? Bin in beiden noch Anfänger.",
  category: "Informatik",
  timeAgo: "vor 6 Stunden",
  comments: [{
    id: "c1",
    author: "DevDolphin",
    authorImage: studentAvatars.hamster,
    content: "React hat mehr Job-Chancen, Vue ist einfacher zu lernen.",
    timeAgo: "vor 4 Stunden"
  }, {
    id: "c2",
    author: "WebWombat",
    authorImage: studentAvatars.plants,
    content: "Für ein Portfolio reicht auch plain HTML/CSS mit ein bisschen JS!",
    timeAgo: "vor 3 Stunden"
  }]
}, {
  id: "4",
  author: "CreativeCloud",
  authorImage: studentAvatars.music,
  title: "Portfolio-Review Thread 📁",
  content: "Lasst uns gegenseitig Feedback zu unseren Portfolios geben! Postet eure Links und gebt konstruktive Kritik.",
  category: "Digital Media",
  timeAgo: "vor 1 Tag",
  comments: [{
    id: "c1",
    author: "DesignDuo",
    authorImage: studentAvatars.books,
    content: "Super Idee! Hier ist meins: [Link]. Freue mich auf Feedback!",
    timeAgo: "vor 20 Stunden"
  }, {
    id: "c2",
    author: "UXUnicorn",
    authorImage: studentAvatars.cat,
    content: "Dein Case Study Aufbau ist top, aber die Ladezeit könnte besser sein.",
    timeAgo: "vor 18 Stunden"
  }]
}, {
  id: "5",
  author: "DigitalDaisy",
  authorImage: studentAvatars.sunset,
  title: "Praktikum bei Digitalagentur - Erfahrungen?",
  content: "Hat jemand schon ein Praktikum bei einer Digitalagentur gemacht? Wie war es und was habt ihr gelernt?",
  category: "Digital Media",
  timeAgo: "vor 8 Stunden",
  comments: [{
    id: "c1",
    author: "AgencyAce",
    authorImage: studentAvatars.dog,
    content: "War bei Jung von Matt Digital - sehr intensiv aber man lernt extrem viel!",
    timeAgo: "vor 5 Stunden"
  }]
}, {
  id: "6",
  author: "WebWanderer",
  authorImage: studentAvatars.galaxy,
  title: "CSS Grid oder Flexbox - wann was?",
  content: "Ich verwechsle immer, wann ich Grid und wann Flexbox nehmen soll. Hat jemand eine gute Eselsbrücke?",
  category: "Informatik",
  timeAgo: "vor 12 Stunden",
  comments: [{
    id: "c1",
    author: "CSSChampion",
    authorImage: studentAvatars.mountains,
    content: "Grid für 2D Layouts (Raster), Flexbox für 1D (Reihe oder Spalte). Easy!",
    timeAgo: "vor 10 Stunden"
  }]
}];
type ViewType = "browse" | "group" | "mentor" | "berater" | "peer" | "post";
type CategoryType = "gruppen" | "mentoren" | "berater" | "peer" | "peertopeer";

// Mapping für Studiengang zu Kategorien
const studiengangToCategories: Record<string, string[]> = {
  "Digital Media": ["Digital Media", "Informatik", "UX Design", "Motion Design", "Creative Direction"],
  "Informatik": ["Informatik", "Digital Media", "Web Development", "Full-Stack"],
  "Medieninformatik": ["Digital Media", "Informatik", "Web Development"]
};
const Forum = () => {
  const [searchParams] = useSearchParams();
  const isGuest = searchParams.get("guest") === "true";
  const [activeView, setActiveView] = useState<ViewType>("browse");
  const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedBerater, setSelectedBerater] = useState<Berater | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null);
  const [selectedPost, setSelectedPost] = useState<SuggestedPost | null>(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userStudiengang, setUserStudiengang] = useState<string>("Allgemein");
  const [forumBackground, setForumBackground] = useState<string | null>(null);
  const [forumTextColor, setForumTextColor] = useState<string | null>(null);
  const [forumBorderColor, setForumBorderColor] = useState<string | null>(null);
  const [backgroundDialogOpen, setBackgroundDialogOpen] = useState(false);
  const { trackForumPost } = useBadgeTracking();

  // Collapsible sidebar sections for mobile
  const [sidebarDeinBereichOpen, setSidebarDeinBereichOpen] = useState(true);
  const [sidebarEntdeckenOpen, setSidebarEntdeckenOpen] = useState(false);

  // Commented posts as quick links (replaces peer connections)
  const [commentedPostIds, setCommentedPostIds] = useState<string[]>([]);

  // Profile popup state
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<{
    name: string;
    image: string;
    bio?: string;
    studiengang?: string;
    semester?: number;
    isFriend?: boolean;
    isMentor?: boolean;
    isBerater?: boolean;
  } | null>(null);
  const [friends, setFriends] = useState<FriendData[]>([]);

  // Dynamic posts state for adding comments
  const [postsWithComments, setPostsWithComments] = useState<SuggestedPost[]>(allSuggestedPosts);

  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");

  // User profile from localStorage
  const [userProfile, setUserProfile] = useState({
    username: "Du",
    profileImage: null as string | null,
    profiltext: ""
  });

  // Create post dialog state
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAnonymous, setNewPostAnonymous] = useState(false);

  // Anonymous name generator
  const anonymousNames = [
    "Anonymes Faultier", "Stiller Beobachter", "Unsichtbarer Helfer", 
    "Geheimer Student", "Anonymer Denker", "Versteckter Weiser",
    "Maskierter Mentor", "Unbekannter Freund", "Verborgener Ratgeber"
  ];
  
  const getRandomAnonymousName = () => {
    return anonymousNames[Math.floor(Math.random() * anonymousNames.length)];
  };

  // Load user's settings and stored comments from localStorage
  useEffect(() => {
    const storedStudiengang = localStorage.getItem("studiengang");
    if (storedStudiengang && storedStudiengang.trim() !== "") {
      setUserStudiengang(storedStudiengang);
    }

    // Load user profile
    const storedUsername = localStorage.getItem("username");
    const storedProfileImage = localStorage.getItem("profileImage");
    const storedProfiltext = localStorage.getItem("profiltext");
    setUserProfile({
      username: storedUsername || "Du",
      profileImage: storedProfileImage,
      profiltext: storedProfiltext || ""
    });

    // Load user-created posts from localStorage
    const storedUserPosts = localStorage.getItem("userCreatedPosts");
    if (storedUserPosts) {
      try {
        const userPosts: SuggestedPost[] = JSON.parse(storedUserPosts);
        setPostsWithComments(prev => [...userPosts, ...prev.filter(p => !userPosts.find(up => up.id === p.id))]);
      } catch (e) {
        console.error("Error parsing stored user posts:", e);
      }
    }

    // Load stored comments from localStorage
    const storedComments = localStorage.getItem("forumComments");
    if (storedComments) {
      try {
        const parsedComments: Record<string, PostComment[]> = JSON.parse(storedComments);
        setPostsWithComments(prev => prev.map(post => ({
          ...post,
          comments: [...post.comments, ...(parsedComments[post.id] || [])]
        })));
      } catch (e) {
        console.error("Error parsing stored comments:", e);
      }
    }

    // Load friends from localStorage
    const storedFriends = localStorage.getItem("forumFriends");
    if (storedFriends) {
      try {
        const parsedFriends: FriendData[] = JSON.parse(storedFriends);
        // Randomize online status on load
        setFriends(parsedFriends.map(f => ({
          ...f,
          isOnline: Math.random() > 0.5
        })));
      } catch (e) {
        console.error("Error parsing stored friends:", e);
      }
    }

    // Load commented post IDs
    const storedCommentedPosts = localStorage.getItem("commentedPostIds");
    if (storedCommentedPosts) {
      try {
        setCommentedPostIds(JSON.parse(storedCommentedPosts));
      } catch (e) {
        console.error("Error parsing stored commented posts:", e);
      }
    }
    
    // Load forum background and customization
    const storedBackground = localStorage.getItem("forumBackground");
    if (storedBackground) {
      setForumBackground(storedBackground);
    }
    const storedTextColor = localStorage.getItem("forumTextColor");
    if (storedTextColor) {
      setForumTextColor(storedTextColor);
    }
    const storedBorderColor = localStorage.getItem("forumBorderColor");
    if (storedBorderColor) {
      setForumBorderColor(storedBorderColor);
    }
  }, []);

  // Save user comments to localStorage whenever they change
  const saveCommentsToLocalStorage = (posts: SuggestedPost[], username: string) => {
    const userComments: Record<string, PostComment[]> = {};
    posts.forEach(post => {
      const ownComments = post.comments.filter(c => c.author === username && !allSuggestedPosts.find(p => p.id === post.id)?.comments.find(oc => oc.id === c.id));
      if (ownComments.length > 0) {
        userComments[post.id] = ownComments;
      }
    });
    localStorage.setItem("forumComments", JSON.stringify(userComments));
  };

  // Filter content based on Studiengang
  const relevantCategories = studiengangToCategories[userStudiengang] || [];
  const suggestedPosts = userStudiengang === "Allgemein" ? postsWithComments : postsWithComments.filter(post => relevantCategories.some(cat => post.category.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(post.category.toLowerCase())));
  const mentors = userStudiengang === "Allgemein" ? allMentors : allMentors.filter(mentor => relevantCategories.some(cat => mentor.field.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(mentor.field.toLowerCase())));
  const peers = userStudiengang === "Allgemein" ? allPeers : allPeers.filter(peer => peer.studiengang.toLowerCase().includes(userStudiengang.toLowerCase()) || userStudiengang.toLowerCase().includes(peer.studiengang.toLowerCase()) || relevantCategories.some(cat => peer.studiengang.toLowerCase().includes(cat.toLowerCase())));

  // Handle profile click
  const handleProfileClick = (profile: {
    name: string;
    image: string;
    bio?: string;
    studiengang?: string;
    semester?: number;
    isMentor?: boolean;
    isBerater?: boolean;
  }) => {
    setSelectedProfile({
      ...profile,
      isFriend: friends.some(f => f.name === profile.name)
    });
    setProfilePopupOpen(true);
  };

  // Handle adding friend
  const handleAddFriend = (name: string) => {
    // Guests cannot add friends
    if (isGuest) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Melde dich an, um Freunde hinzuzufügen.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if already a friend (prevent duplicates)
    if (friends.some(f => f.name === name)) {
      toast({
        title: "Bereits befreundet",
        description: `${name} ist bereits in deiner Freundesliste.`,
        variant: "destructive"
      });
      return;
    }

    // Find the profile data from posts, peers, or mock data
    let friendData: FriendData | null = null;

    // Check in peers
    const peerMatch = allPeers.find(p => p.name === name);
    if (peerMatch) {
      friendData = {
        name: peerMatch.name,
        image: peerMatch.image,
        studiengang: peerMatch.studiengang,
        semester: peerMatch.semester,
        isOnline: Math.random() > 0.5
      };
    }

    // Check in post authors
    if (!friendData) {
      const postMatch = allSuggestedPosts.find(p => p.author === name);
      if (postMatch) {
        friendData = {
          name: postMatch.author,
          image: postMatch.authorImage,
          isOnline: Math.random() > 0.5
        };
      }
    }

    // Check in comment authors
    if (!friendData) {
      for (const post of allSuggestedPosts) {
        const commentMatch = post.comments.find(c => c.author === name);
        if (commentMatch) {
          friendData = {
            name: commentMatch.author,
            image: commentMatch.authorImage,
            isOnline: Math.random() > 0.5
          };
          break;
        }
      }
    }

    // Fallback with initial letter
    if (!friendData) {
      friendData = {
        name,
        image: "",
        isOnline: Math.random() > 0.5
      };
    }
    const updatedFriends = [...friends, friendData];
    setFriends(updatedFriends);

    // Save to localStorage
    localStorage.setItem("forumFriends", JSON.stringify(updatedFriends));
    toast({
      title: "Freund hinzugefügt! 🎉",
      description: `${name} wurde zu deinen Freunden hinzugefügt.`
    });
  };

  // Handle removing friend
  const handleRemoveFriend = (name: string) => {
    const updatedFriends = friends.filter(f => f.name !== name);
    setFriends(updatedFriends);

    // Save to localStorage
    localStorage.setItem("forumFriends", JSON.stringify(updatedFriends));

    // Close chat if removing friend we're chatting with
    if (selectedFriend?.name === name) {
      handleBackToBrowse();
    }
    toast({
      title: "Freund entfernt",
      description: `${name} wurde aus deiner Freundesliste entfernt.`
    });
  };

  // Handle adding comment to post
  const handleAddComment = () => {
    if (!message.trim() || !selectedPost) return;
    
    // If the post is anonymous, comments are also anonymous
    const isAnonymousComment = selectedPost.isAnonymous === true;
    
    const newComment: PostComment = {
      id: `c${Date.now()}`,
      author: isAnonymousComment ? getRandomAnonymousName() : userProfile.username,
      authorImage: isAnonymousComment ? "" : (userProfile.profileImage || ""),
      content: message,
      timeAgo: "gerade eben",
      isAnonymous: isAnonymousComment
    };

    // Update posts with new comment
    const updatedPosts = postsWithComments.map(post => post.id === selectedPost.id ? {
      ...post,
      comments: [...post.comments, newComment]
    } : post);
    setPostsWithComments(updatedPosts);

    // Update selected post
    setSelectedPost(prev => prev ? {
      ...prev,
      comments: [...prev.comments, newComment]
    } : null);

    // Save to localStorage
    saveCommentsToLocalStorage(updatedPosts, userProfile.username);

    // Add post to Peer to Peer quick links if not already there
    const isNewQuickLink = !commentedPostIds.includes(selectedPost.id);
    console.log("Adding comment - Post ID:", selectedPost.id, "Title:", selectedPost.title);
    console.log("Current commentedPostIds:", commentedPostIds);
    console.log("Is new quick link:", isNewQuickLink);
    
    if (isNewQuickLink) {
      const updatedCommentedPosts = [...commentedPostIds, selectedPost.id];
      console.log("Updated commentedPostIds:", updatedCommentedPosts);
      setCommentedPostIds(updatedCommentedPosts);
      localStorage.setItem("commentedPostIds", JSON.stringify(updatedCommentedPosts));
      // Open Peer to Peer category to show the new quick link
      setActiveCategory("peer");
    }
    
    setMessage("");
    
    // Show appropriate toast
    if (isNewQuickLink) {
      toast({
        title: "Kommentar gepostet! 💬",
        description: `"${selectedPost.title}" wurde zu Peer to Peer hinzugefügt.`
      });
    } else {
      toast({
        title: "Kommentar gepostet! 💬",
        description: "Dein Kommentar wurde hinzugefügt."
      });
    }
  };

  // Handle editing comment
  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingCommentContent(currentContent);
  };

  // Handle saving edited comment
  const handleSaveEditComment = () => {
    if (!editingCommentContent.trim() || !selectedPost || !editingCommentId) return;
    const updatedPosts = postsWithComments.map(post => post.id === selectedPost.id ? {
      ...post,
      comments: post.comments.map(c => c.id === editingCommentId ? {
        ...c,
        content: editingCommentContent,
        timeAgo: "bearbeitet"
      } : c)
    } : post);
    setPostsWithComments(updatedPosts);

    // Update selected post
    setSelectedPost(prev => prev ? {
      ...prev,
      comments: prev.comments.map(c => c.id === editingCommentId ? {
        ...c,
        content: editingCommentContent,
        timeAgo: "bearbeitet"
      } : c)
    } : null);

    // Save to localStorage
    saveCommentsToLocalStorage(updatedPosts, userProfile.username);
    setEditingCommentId(null);
    setEditingCommentContent("");
    toast({
      title: "Kommentar bearbeitet! ✏️",
      description: "Dein Kommentar wurde aktualisiert."
    });
  };

  // Handle deleting comment
  const handleDeleteComment = (commentId: string) => {
    if (!selectedPost) return;
    const updatedPosts = postsWithComments.map(post => post.id === selectedPost.id ? {
      ...post,
      comments: post.comments.filter(c => c.id !== commentId)
    } : post);
    setPostsWithComments(updatedPosts);

    // Update selected post
    setSelectedPost(prev => prev ? {
      ...prev,
      comments: prev.comments.filter(c => c.id !== commentId)
    } : null);

    // Save to localStorage
    saveCommentsToLocalStorage(updatedPosts, userProfile.username);
    toast({
      title: "Kommentar gelöscht 🗑️",
      description: "Dein Kommentar wurde entfernt."
    });
  };

  // Handle creating new post
  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte gib einen Titel und eine Beschreibung ein.",
        variant: "destructive"
      });
      return;
    }

    const postId = `user-${Date.now()}`;
    const newPost: SuggestedPost = {
      id: postId,
      author: newPostAnonymous ? getRandomAnonymousName() : userProfile.username,
      authorImage: newPostAnonymous ? "" : (userProfile.profileImage || ""),
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      category: userStudiengang === "Allgemein" ? "Allgemein" : userStudiengang,
      timeAgo: "gerade eben",
      comments: [],
      isAnonymous: newPostAnonymous,
      isUserCreated: true
    };

    // Add new post at the beginning
    setPostsWithComments(prev => [newPost, ...prev]);

    // Add to Peer to Peer quick links
    const updatedCommentedPosts = [...commentedPostIds, postId];
    setCommentedPostIds(updatedCommentedPosts);
    localStorage.setItem("commentedPostIds", JSON.stringify(updatedCommentedPosts));

    // Save to localStorage
    const storedUserPosts = localStorage.getItem("userCreatedPosts");
    const userPosts = storedUserPosts ? JSON.parse(storedUserPosts) : [];
    userPosts.unshift(newPost);
    localStorage.setItem("userCreatedPosts", JSON.stringify(userPosts));

    // Reset form and close dialog
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostAnonymous(false);
    setCreatePostOpen(false);

    // Open Peer to Peer to show the new post
    setActiveCategory("peer");

    // Track badge
    trackForumPost();

    toast({
      title: "Beitrag erstellt! 🎉",
      description: newPostAnonymous 
        ? "Dein anonymer Beitrag wurde veröffentlicht." 
        : "Dein Beitrag wurde erfolgreich veröffentlicht."
    });
  };

  // Handle deleting user's own post
  const handleDeletePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Remove from posts state
    setPostsWithComments(prev => prev.filter(p => p.id !== postId));
    
    // Remove from localStorage
    const storedUserPosts = localStorage.getItem("userCreatedPosts");
    if (storedUserPosts) {
      const userPosts = JSON.parse(storedUserPosts);
      const updatedUserPosts = userPosts.filter((p: SuggestedPost) => p.id !== postId);
      localStorage.setItem("userCreatedPosts", JSON.stringify(updatedUserPosts));
    }
    
    // Remove from quick links
    const updatedCommentedPosts = commentedPostIds.filter(id => id !== postId);
    setCommentedPostIds(updatedCommentedPosts);
    localStorage.setItem("commentedPostIds", JSON.stringify(updatedCommentedPosts));
    
    // If viewing this post, go back to browse
    if (selectedPost?.id === postId) {
      handleBackToBrowse();
    }
    
    toast({
      title: "Beitrag gelöscht 🗑️",
      description: "Dein Beitrag wurde entfernt."
    });
  };

  // Handle removing quick link from Peer to Peer
  const handleRemoveQuickLink = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedCommentedPosts = commentedPostIds.filter(id => id !== postId);
    setCommentedPostIds(updatedCommentedPosts);
    localStorage.setItem("commentedPostIds", JSON.stringify(updatedCommentedPosts));
    toast({
      title: "Schnelllink entfernt",
      description: "Der Beitrag wurde aus Peer to Peer entfernt."
    });
  };
  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
    setSelectedMentor(null);
    setSelectedBerater(null);
    setSelectedPeer(null);
    setChatMessages(group.messages);
    setActiveView("group");
  };
  const handleMentorClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setSelectedGroup(null);
    setSelectedBerater(null);
    setSelectedPeer(null);
    setChatMessages([]);
    setActiveView("mentor");
  };
  const handleBeraterClick = (berater: Berater) => {
    setSelectedBerater(berater);
    setSelectedGroup(null);
    setSelectedMentor(null);
    setSelectedPeer(null);
    setChatMessages([]);
    setActiveView("berater");
  };
  const handlePeerClick = (peer: Peer) => {
    setSelectedPeer(peer);
    setSelectedGroup(null);
    setSelectedMentor(null);
    setSelectedBerater(null);
    setChatMessages([]);
    setActiveView("peer");
  };
  const handlePostClick = (post: SuggestedPost) => {
    setSelectedPost(post);
    setSelectedGroup(null);
    setSelectedMentor(null);
    setSelectedBerater(null);
    setSelectedPeer(null);
    setActiveView("post");
  };
  const handleBackToBrowse = () => {
    setActiveView("browse");
    setSelectedGroup(null);
    setSelectedMentor(null);
    setSelectedBerater(null);
    setSelectedPeer(null);
    setSelectedFriend(null);
    setSelectedPost(null);
  };

  // Handle friend chat click
  const handleFriendChatClick = (friend: FriendData) => {
    setSelectedFriend(friend);
    setSelectedGroup(null);
    setSelectedMentor(null);
    setSelectedBerater(null);
    setSelectedPeer(null);
    setSelectedPost(null);
    setChatMessages([]);
    setActiveView("group"); // Reuse chat view
  };
  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        sender: "Du",
        text: message,
        timestamp: new Date()
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessage("");
    }
  };
  const handleConnect = (type: "mentor" | "peer", id: string) => {
    if (type === "mentor") {
      const mentor = mentors.find(m => m.id === id);
      if (mentor) {
        handleMentorClick(mentor);
      }
    } else if (type === "peer") {
      const peer = peers.find(p => p.id === id);
      if (peer) {
        handlePeerClick(peer);
      }
    }
  };
  const getChatTitle = () => {
    if (selectedGroup) return selectedGroup.name;
    if (selectedMentor) return `Chat mit ${selectedMentor.name}`;
    if (selectedBerater) return `Chat mit ${selectedBerater.name}`;
    if (selectedPeer) return `Chat mit ${selectedPeer.name}`;
    if (selectedFriend) return `Chat mit ${selectedFriend.name}`;
    return "";
  };

  // Handle background image upload
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setForumBackground(base64);
        localStorage.setItem("forumBackground", base64);
        setBackgroundDialogOpen(false);
        toast({ title: "Hintergrund geändert", description: "Dein Forum-Hintergrund wurde aktualisiert." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    setForumBackground(null);
    localStorage.removeItem("forumBackground");
    setBackgroundDialogOpen(false);
    toast({ title: "Hintergrund entfernt", description: "Der Forum-Hintergrund wurde zurückgesetzt." });
  };

  // Get commented posts as quick links
  const commentedPosts = postsWithComments.filter(post => commentedPostIds.includes(post.id));
  
  return (
    <div 
      className="min-h-screen bg-background"
      style={forumBackground ? { 
        backgroundImage: `url(${forumBackground})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : undefined}
    >
      <Header isGuest={isGuest} />
      
      <main className="page-container pt-12 pb-6 md:pt-16 md:pb-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Forum</h1>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Browse Sidebar */}
          <aside className="bg-card rounded-2xl p-5 h-fit border border-border/50">
            {/* Dein Bereich - Collapsible on mobile */}
            <div>
              <button 
                onClick={() => setSidebarDeinBereichOpen(!sidebarDeinBereichOpen)}
                className="flex items-center justify-between w-full lg:cursor-default"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">Dein Bereich</h2>
                </div>
                <div className="flex items-center gap-2">
                  <ForumCustomization
                    forumBackground={forumBackground}
                    forumTextColor={forumTextColor}
                    forumBorderColor={forumBorderColor}
                    onBackgroundChange={setForumBackground}
                    onTextColorChange={setForumTextColor}
                    onBorderColorChange={setForumBorderColor}
                    isGuest={isGuest}
                  />
                  <span className="lg:hidden">
                    {sidebarDeinBereichOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </span>
                </div>
              </button>
              
              <div className={`${sidebarDeinBereichOpen ? 'block' : 'hidden'} lg:block mt-4`}>
                {/* Mitglieder */}
                <div className="mb-5">
                  <button onClick={() => setActiveCategory(activeCategory === "peer" ? null : "peer")} className="flex items-center gap-2 w-full text-left font-semibold text-base mb-2 text-foreground hover:text-primary transition-colors">
                    <Users className="w-5 h-5 text-primary" />
                    Mitglieder
                  </button>
                  {activeCategory === "peer" && <ul className="space-y-1 pl-7">
                      {peers.filter(p => p.connected).length > 0 ? peers.filter(p => p.connected).map(peer => <li key={peer.id}>
                          <button onClick={() => handlePeerClick(peer)} className={`text-sm transition-colors py-1 w-full text-left ${selectedPeer?.id === peer.id ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}`}>
                            → {peer.name}
                          </button>
                        </li>) : <p className="text-xs text-muted-foreground">Verbinde dich mit Mitgliedern</p>}
                    </ul>}
                </div>

                {/* Mentoren */}
                <div className="mb-5">
                  <button onClick={() => setActiveCategory(activeCategory === "mentoren" ? null : "mentoren")} className="flex items-center gap-2 w-full text-left font-semibold text-base mb-2 text-foreground hover:text-primary transition-colors">
                    <UserCheck className="w-5 h-5 text-primary" />
                    Mentoren
                  </button>
                  {activeCategory === "mentoren" && <ul className="space-y-1 pl-7">
                      {mentors.filter(m => m.connected).length > 0 ? mentors.filter(m => m.connected).map(mentor => <li key={mentor.id}>
                          <button onClick={() => handleMentorClick(mentor)} className={`text-sm transition-colors py-1 w-full text-left ${selectedMentor?.id === mentor.id ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}`}>
                            → {mentor.name}
                          </button>
                        </li>) : <p className="text-xs text-muted-foreground">Verbinde dich mit Mentoren</p>}
                    </ul>}
                </div>

                {/* Peer to Peer - Posts the user participated in */}
                <div className="mb-5">
                  <button onClick={() => setActiveCategory(activeCategory === "peertopeer" ? null : "peertopeer")} className="flex items-center gap-2 w-full text-left font-semibold text-base mb-2 text-foreground hover:text-primary transition-colors">
                    <HeartHandshake className="w-5 h-5 text-primary" />
                    Peer to Peer
                  </button>
                  {activeCategory === "peertopeer" && <ul className="space-y-1 pl-7">
                      {commentedPostIds.length > 0 ? commentedPostIds.map(postId => {
                        const post = postsWithComments.find(p => p.id === postId);
                        if (!post) return null;
                        return <li key={postId} className="flex items-center justify-between group">
                          <button 
                            onClick={() => handlePostClick(post)} 
                            className={`text-sm transition-colors py-1 text-left truncate flex-1 ${selectedPost?.id === postId ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}`}
                          >
                            → {post.title.length > 20 ? post.title.slice(0, 20) + "..." : post.title}
                          </button>
                          <button 
                            onClick={(e) => handleRemoveQuickLink(postId, e)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </li>;
                      }) : <p className="text-xs text-muted-foreground">Beiträge, an denen du dich beteiligst</p>}
                    </ul>}
                </div>

                {/* Gruppen */}
                <div className="mb-5">
                  <button onClick={() => setActiveCategory(activeCategory === "gruppen" ? null : "gruppen")} className="flex items-center gap-2 w-full text-left font-semibold text-base mb-2 text-foreground hover:text-primary transition-colors">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Gruppen
                  </button>
                  {activeCategory === "gruppen" && <ul className="space-y-1 pl-7">
                      {groups.map(group => <li key={group.id}>
                          <button onClick={() => handleGroupClick(group)} className={`text-sm transition-colors py-1 w-full text-left ${selectedGroup?.id === group.id ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}`}>
                            → {group.name}
                          </button>
                        </li>)}
                    </ul>}
                </div>
                
                {/* Friends List */}
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Freunde {friends.length > 0 && `(${friends.length})`}
                  </h3>
                  {friends.length > 0 ? (
                    <div className="space-y-2">
                      {friends.map((friend, index) => <div key={`${friend.name}-${index}`} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                          <button onClick={() => handleProfileClick({
                      name: friend.name,
                      image: friend.image,
                      studiengang: friend.studiengang,
                      semester: friend.semester
                    })} className="relative">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center hover:ring-2 hover:ring-primary transition-all">
                              {friend.image ? <img src={friend.image} alt={friend.name} className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-primary">
                                  {friend.name.charAt(0).toUpperCase()}
                                </span>}
                            </div>
                            {/* Online/Offline indicator */}
                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${friend.isOnline ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                          </button>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-foreground">{friend.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {friend.isOnline ? 'Online' : 'Offline'}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2" onClick={() => handleFriendChatClick(friend)}>
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>)}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Klicke auf Profile, um Freunde hinzuzufügen</p>
                  )}
                </div>
              </div>
            </div>

            {/* Entdecken Section - Collapsible on mobile */}
            <div className="mt-6 pt-5 border-t border-border/50">
              <button 
                onClick={() => setSidebarEntdeckenOpen(!sidebarEntdeckenOpen)}
                className="flex items-center justify-between w-full lg:cursor-default"
              >
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Entdecken
                </h3>
                <span className="lg:hidden">
                  {sidebarEntdeckenOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </span>
              </button>
              
              <div className={`${sidebarEntdeckenOpen ? 'block' : 'hidden'} lg:block mt-4`}>
                {/* Mitglieder finden */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground mb-2">Mitglieder</p>
                  <div className="space-y-2">
                    {(peers.filter(p => !p.connected).length > 0 ? peers.filter(p => !p.connected).slice(0, 3) : allPeers.filter(p => !p.connected).slice(0, 3)).map(peer => (
                      <div key={peer.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <button onClick={() => handleProfileClick({
                          name: peer.name,
                          image: peer.image,
                          studiengang: peer.studiengang,
                          semester: peer.semester
                        })} className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer flex-shrink-0">
                          <img src={peer.image} alt={peer.name} className="w-full h-full object-cover" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{peer.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{peer.studiengang}</p>
                        </div>
                        {!isGuest && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => handleConnect("peer", peer.id)}>
                            +
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verfügbare Mentoren */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground mb-2">Verfügbare Mentoren</p>
                  <div className="space-y-2">
                    {(mentors.filter(m => !m.connected).length > 0 ? mentors.filter(m => !m.connected).slice(0, 3) : allMentors.filter(m => !m.connected).slice(0, 3)).map(mentor => (
                      <div key={mentor.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <img src={mentor.image} alt={mentor.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{mentor.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{mentor.field}</p>
                        </div>
                        {!isGuest && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => handleConnect("mentor", mentor.id)}>
                            +
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Neue Gruppen */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Neue Gruppen für dich</p>
                  <div className="space-y-2">
                    {groups.slice(0, 3).map(group => (
                      <button 
                        key={group.id} 
                        onClick={() => handleGroupClick(group)} 
                        className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground">{group.name}</p>
                        <p className="text-xs text-muted-foreground">{group.memberCount} Mitglieder</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="space-y-4">
            {activeView === "browse" ? (/* Suggested Posts View */
          <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="text-xl font-bold text-foreground">Vorgeschlagene Beiträge</h2>
                  <div className="flex items-center gap-3">
                    {isGuest ? (
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" disabled>
                        <Plus className="w-4 h-4" />
                        Anmelden zum Posten
                      </Button>
                    ) : (
                      <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                            <Plus className="w-4 h-4" />
                            Beitrag erstellen
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Neuen Beitrag erstellen</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="post-title">Überschrift</Label>
                            <Input
                              id="post-title"
                              placeholder="Worum geht es in deinem Beitrag?"
                              value={newPostTitle}
                              onChange={(e) => setNewPostTitle(e.target.value)}
                              maxLength={100}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="post-content">Kurzinfo</Label>
                            <Textarea
                              id="post-content"
                              placeholder="Beschreibe dein Anliegen oder deine Frage..."
                              value={newPostContent}
                              onChange={(e) => setNewPostContent(e.target.value)}
                              rows={4}
                              maxLength={500}
                            />
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <input
                              type="checkbox"
                              id="post-anonymous"
                              checked={newPostAnonymous}
                              onChange={(e) => setNewPostAnonymous(e.target.checked)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                              <Label htmlFor="post-anonymous" className="cursor-pointer font-medium">
                                Anonym posten
                              </Label>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Dein Name wird nicht angezeigt. Alle Kommentare sind ebenfalls anonym.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Kategorie: <span className="font-medium text-primary">{userStudiengang}</span></span>
                            <span>{newPostContent.length}/500</span>
                          </div>
                          <Button
                            onClick={handleCreatePost}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={!newPostTitle.trim() || !newPostContent.trim()}
                          >
                            {newPostAnonymous ? "Anonym veröffentlichen" : "Beitrag veröffentlichen"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    )}
                    <span className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
                      Basierend auf: <span className="font-medium text-primary">{userStudiengang}</span>
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {suggestedPosts.length > 0 ? suggestedPosts.map(post => <div key={post.id} className="w-full text-left bg-card rounded-xl p-5 border border-border/50 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                          {post.isAnonymous ? (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-sm">🎭</span>
                            </div>
                          ) : (
                            <button onClick={e => {
                              e.stopPropagation();
                              handleProfileClick({
                                name: post.author,
                                image: post.authorImage
                              });
                            }} className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                              {post.authorImage ? (
                                <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover bg-primary/10" />
                              ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">{post.author.charAt(0).toUpperCase()}</span>
                                </div>
                              )}
                            </button>
                          )}
                          <span className="font-medium text-foreground">{post.author}</span>
                          {post.isAnonymous && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">anonym</span>
                          )}
                          <span className="text-muted-foreground text-sm">• {post.timeAgo}</span>
                          <div className="ml-auto flex items-center gap-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {post.category}
                            </span>
                            {post.isUserCreated && (
                              <button
                                onClick={(e) => handleDeletePost(post.id, e)}
                                className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                title="Beitrag löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <button onClick={() => handlePostClick(post)} className="w-full text-left cursor-pointer">
                          <h3 className="text-lg font-semibold text-foreground mb-2">{post.title}</h3>
                          <p className="text-muted-foreground">{post.content}</p>
                          <p className="text-xs text-primary mt-3">{post.comments.length} Kommentare</p>
                        </button>
                      </div>) : postsWithComments.slice(0, 3).map(post => <div key={post.id} className="w-full text-left bg-card rounded-xl p-5 border border-border/50 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                          {post.isAnonymous ? (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-sm">🎭</span>
                            </div>
                          ) : (
                            <button onClick={e => {
                              e.stopPropagation();
                              handleProfileClick({
                                name: post.author,
                                image: post.authorImage
                              });
                            }} className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                              {post.authorImage ? (
                                <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover bg-primary/10" />
                              ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-bold text-primary">{post.author.charAt(0).toUpperCase()}</span>
                                </div>
                              )}
                            </button>
                          )}
                          <span className="font-medium text-foreground">{post.author}</span>
                          {post.isAnonymous && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">anonym</span>
                          )}
                          <span className="text-muted-foreground text-sm">• {post.timeAgo}</span>
                          <div className="ml-auto flex items-center gap-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {post.category}
                            </span>
                            {post.isUserCreated && (
                              <button
                                onClick={(e) => handleDeletePost(post.id, e)}
                                className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                title="Beitrag löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <button onClick={() => handlePostClick(post)} className="w-full text-left cursor-pointer">
                          <h3 className="text-lg font-semibold text-foreground mb-2">{post.title}</h3>
                          <p className="text-muted-foreground">{post.content}</p>
                          <p className="text-xs text-primary mt-3">{post.comments.length} Kommentare</p>
                        </button>
                      </div>)}
                </div>
              </div>) : activeView === "post" && selectedPost ? (/* Post Detail View */
          <div className="bg-card rounded-2xl border border-border/50 p-6">
                <Button variant="ghost" size="sm" onClick={handleBackToBrowse} className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>

                {/* Post Header */}
                <div className="flex items-center gap-3 mb-4">
                  {selectedPost.isAnonymous ? (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xl">🎭</span>
                    </div>
                  ) : (
                    <button onClick={e => {
                      e.stopPropagation();
                      handleProfileClick({
                        name: selectedPost.author,
                        image: selectedPost.authorImage
                      });
                    }} className="w-12 h-12 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                      {selectedPost.authorImage ? (
                        <img src={selectedPost.authorImage} alt={selectedPost.author} className="w-full h-full object-cover bg-primary/10" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{selectedPost.author.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </button>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">{selectedPost.author}</p>
                      {selectedPost.isAnonymous && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">anonym</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedPost.timeAgo}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {selectedPost.category}
                    </span>
                    {selectedPost.isUserCreated && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeletePost(selectedPost.id, e)}
                        title="Beitrag löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <h2 className="text-2xl font-bold text-foreground mb-3">{selectedPost.title}</h2>
                <p className="text-foreground mb-6">{selectedPost.content}</p>

                {/* Comments Section */}
                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-bold text-foreground mb-4">{selectedPost.comments.length} Kommentare</h3>
                  
                  <div className="space-y-4 mb-6">
                    {selectedPost.comments.map(comment => <div key={comment.id} className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <button onClick={() => handleProfileClick({
                      name: comment.author,
                      image: comment.authorImage,
                      bio: comment.author === userProfile.username ? userProfile.profiltext : undefined
                    })} className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer flex items-center justify-center bg-primary/10">
                            {comment.authorImage ? <img src={comment.authorImage} alt={comment.author} className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-primary">
                                {comment.author.charAt(0).toUpperCase()}
                              </span>}
                          </button>
                          <span className="font-medium text-foreground">{comment.author}</span>
                          <span className="text-muted-foreground text-xs">• {comment.timeAgo}</span>
                          
                          {/* Edit/Delete buttons for own comments */}
                          {comment.author === userProfile.username && !editingCommentId && <div className="ml-auto flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEditComment(comment.id, comment.content)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteComment(comment.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>}
                        </div>
                        
                        {/* Show edit input or content */}
                        {editingCommentId === comment.id ? <div className="flex gap-2 pl-10">
                            <Input value={editingCommentContent} onChange={e => setEditingCommentContent(e.target.value)} className="flex-1" autoFocus onKeyDown={e => e.key === "Enter" && handleSaveEditComment()} />
                            <Button size="icon" className="h-9 w-9" onClick={handleSaveEditComment}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setEditingCommentId(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div> : <p className="text-foreground text-sm pl-10">{comment.content}</p>}
                      </div>)}
                  </div>

                  {/* Add Comment */}
                  {isGuest ? <div className="bg-muted/30 rounded-xl p-4 text-center">
                      <p className="text-muted-foreground text-sm">
                        Melde dich an, um Kommentare zu schreiben.
                      </p>
                    </div> : <div className="flex gap-2">
                      <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Kommentar schreiben..." className="flex-1" onKeyDown={e => e.key === "Enter" && handleAddComment()} />
                      <Button size="icon" onClick={handleAddComment}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>}
                </div>
              </div>) : (/* Chat View */
          <div className="bg-card rounded-2xl border border-border/50 h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-border/50 flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={handleBackToBrowse}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  
                  {selectedGroup && <>
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-bold text-foreground">{selectedGroup.name}</h3>
                        <p className="text-xs text-muted-foreground">{selectedGroup.memberCount} Mitglieder</p>
                      </div>
                    </>}
                  
                  {selectedMentor && <>
                      <img src={selectedMentor.image} alt={selectedMentor.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h3 className="font-bold text-foreground">{selectedMentor.name}</h3>
                        <p className="text-xs text-muted-foreground">{selectedMentor.field}</p>
                      </div>
                    </>}
                  
                  {selectedBerater && <>
                      <img src={selectedBerater.image} alt={selectedBerater.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h3 className="font-bold text-foreground">{selectedBerater.name}</h3>
                        <p className="text-xs text-muted-foreground">{selectedBerater.organization}</p>
                      </div>
                    </>}
                  
                  {selectedPeer && <>
                      <img src={selectedPeer.image} alt={selectedPeer.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h3 className="font-bold text-foreground">{selectedPeer.name}</h3>
                        <p className="text-xs text-muted-foreground">{selectedPeer.studiengang}, {selectedPeer.semester}. Semester</p>
                      </div>
                    </>}
                  
                  {selectedFriend && <>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                        {selectedFriend.image ? <img src={selectedFriend.image} alt={selectedFriend.name} className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-primary">
                            {selectedFriend.name.charAt(0).toUpperCase()}
                          </span>}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{selectedFriend.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedFriend.isOnline ? '🟢 Online' : '⚫ Offline'}
                        </p>
                      </div>
                    </>}
                </div>

                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {chatMessages.length === 0 ? <p className="text-muted-foreground text-sm text-center py-8">
                        Starte eine Unterhaltung...
                      </p> : chatMessages.map((msg, i) => <div key={i} className={`p-3 rounded-xl max-w-[80%] ${msg.sender === "Du" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}>
                          <p className="text-xs font-medium mb-1 opacity-70">{msg.sender}</p>
                          <p className="text-sm">{msg.text}</p>
                        </div>)}
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                {isGuest ? <div className="p-4 border-t border-border/50 bg-muted/30 text-center">
                    <p className="text-muted-foreground text-sm">
                      Melde dich an, um Nachrichten zu schreiben.
                    </p>
                  </div> : <div className="p-4 border-t border-border/50 flex gap-2">
                    <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Nachricht schreiben..." onKeyDown={e => e.key === "Enter" && handleSendMessage()} className="flex-1" />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>}
              </div>)}
          </div>
        </div>
      </main>

      {/* Profile Popup */}
      <UserProfilePopup user={selectedProfile} open={profilePopupOpen} onOpenChange={setProfilePopupOpen} onAddFriend={handleAddFriend} onRemoveFriend={handleRemoveFriend} isGuest={isGuest} />
    </div>
  );
};
export default Forum;